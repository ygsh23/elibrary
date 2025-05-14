import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './book-form-dialog.component.html',
  styleUrls: ['./book-form-dialog.component.css']
})
export class BookFormDialogComponent implements OnInit {
  bookForm!: FormGroup;
  dialogTitle: string;
  categories = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Thriller',
    'Romance',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Self-Help',
    'Children',
    'Poetry',
    'Comics'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BookFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { book?: Book }
  ) {
    this.dialogTitle = data.book ? 'Edit Book' : 'Add New Book';
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    const book = this.data.book;
    
    this.bookForm = this.fb.group({
      id: [book?.id || null],
      title: [book?.title || '', [Validators.required]],
      author: [book?.author || '', [Validators.required]],
      isbn: [book?.isbn || '', [Validators.required]],
      category: [book?.category || '', [Validators.required]],
      description: [book?.description || ''],
      publisher: [book?.publisher || 'Cosmic Publications'],
      publishYear: [book?.publishYear || new Date().getFullYear(), [Validators.required, Validators.min(1000), Validators.max(new Date().getFullYear())]],
      totalCopies: [book?.totalCopies || 1, [Validators.required, Validators.min(1)]],
      availableCopies: [book?.availableCopies || book?.totalCopies || 1, [Validators.required, Validators.min(0)]],
      coverImageUrl: [book?.coverImageUrl || '']
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      const formValue = this.bookForm.value;
      
      // Ensure availableCopies doesn't exceed totalCopies
      if (formValue.availableCopies > formValue.totalCopies) {
        formValue.availableCopies = formValue.totalCopies;
      }
      
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
