import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  @Input() book: Book | null = null;
  @Output() bookSaved = new EventEmitter<Book>();
  @Output() cancelled = new EventEmitter<void>();

  bookForm!: FormGroup;
  isEditMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private bookService: BookService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.book;
    this.initForm();
  }

  initForm(): void {
    this.bookForm = this.formBuilder.group({
      title: [this.book?.title || '', Validators.required],
      author: [this.book?.author || '', Validators.required],
      category: [this.book?.category || '', Validators.required],
      description: [this.book?.description || '', Validators.required],
      isbn: [this.book?.isbn || '', Validators.required],
      publishedYear: [this.book?.publishedYear || new Date().getFullYear(), Validators.required],
      totalCopies: [this.book?.totalCopies || 1, [Validators.required, Validators.min(1)]],
      availableCopies: [this.book?.availableCopies || 0, [Validators.required, Validators.min(0)]]
    });

    // Add validator for available copies not exceeding total copies
    if (this.isEditMode) {
      this.bookForm.get('availableCopies')?.addValidators(
        Validators.max(this.bookForm.get('totalCopies')?.value || 0)
      );

      // Update max validator when total copies changes
      this.bookForm.get('totalCopies')?.valueChanges.subscribe(value => {
        this.bookForm.get('availableCopies')?.setValidators([
          Validators.required,
          Validators.min(0),
          Validators.max(value)
        ]);
        this.bookForm.get('availableCopies')?.updateValueAndValidity();
      });
    }
  }

  onSubmit(): void {
    if (this.bookForm.invalid) {
      return;
    }

    const bookData: Book = this.bookForm.value;
    
    // If not in edit mode, set available copies equal to total copies
    if (!this.isEditMode) {
      bookData.availableCopies = bookData.totalCopies;
    }

    if (this.isEditMode && this.book?.id) {
      // Update existing book
      bookData.id = this.book.id;
      this.bookService.updateBook(bookData).subscribe({
        next: (updatedBook: Book) => {
          this.snackBar.open('Book updated successfully!', 'Close', { duration: 3000 });
          this.bookSaved.emit(updatedBook);
        },
        error: (error: any) => {
          console.error('Error updating book:', error);
          this.snackBar.open('Failed to update book. Please try again.', 'Close', { duration: 3000 });
        }
      });
    } else {
      // Create new book
      this.bookService.addBook(bookData).subscribe({
        next: (newBook: Book) => {
          this.snackBar.open('Book added successfully!', 'Close', { duration: 3000 });
          this.bookSaved.emit(newBook);
        },
        error: (error: any) => {
          console.error('Error adding book:', error);
          this.snackBar.open('Failed to add book. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
