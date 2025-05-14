import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { BorrowRecordService } from '../../services/borrow-record.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  searchQuery = '';
  loading = false;
  isLoggedIn = false;
  isAdmin = false;
  userId: number | null = null;

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private borrowRecordService: BorrowRecordService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = !!user && user.role === 'ADMIN';
      this.userId = user?.id || null;
    });
    
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.loading = false;
        this.snackBar.open('Failed to load books. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  searchBooks(): void {
    if (!this.searchQuery.trim()) {
      this.loadBooks();
      return;
    }

    this.loading = true;
    this.bookService.searchBooks(this.searchQuery).subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching books:', error);
        this.loading = false;
        this.snackBar.open('Failed to search books. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  borrowBook(bookId: number): void {
    if (!this.isLoggedIn || !this.userId) {
      this.snackBar.open('You must be logged in to borrow books.', 'Close', { duration: 3000 });
      return;
    }

    console.log('Requesting to borrow book with ID:', bookId);
    
    this.borrowRecordService.requestToBorrowBook(this.userId, bookId).subscribe({
      next: (borrowRecord) => {
        console.log('Borrow record response:', borrowRecord);
        
        // Format the due date for display - handle both dueDate and returnDate
        let dueDate = 'one week';
        if (borrowRecord?.dueDate) {
          dueDate = new Date(borrowRecord.dueDate).toLocaleDateString();
        } else if (borrowRecord?.returnDate) {
          dueDate = new Date(borrowRecord.returnDate).toLocaleDateString();
        }
        
        this.snackBar.open(`Book borrow request submitted successfully! Due date: ${dueDate}`, 'Close', { duration: 5000 });
        this.loadBooks(); // Refresh to update availability
      },
      error: (error) => {
        console.error('Error borrowing book:', error);
        if (error.status === 400) {
          this.snackBar.open('You already have an active request or have borrowed this book.', 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to borrow book. Please try again.', 'Close', { duration: 3000 });
        }
      }
    });
  }
}
