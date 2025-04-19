import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Book } from '../../models/book.model';
import { BorrowRecord } from '../../models/borrow-record.model';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';
import { BorrowRecordService } from '../../services/borrow-record.service';

@Component({
  selector: 'app-user-dashboard',
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
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  books: Book[] = [];
  borrowRecords: BorrowRecord[] = [];
  searchQuery = '';
  loading = false;
  loadingBorrowRecords = false;
  userId: number | null = null;
  userName = '';
  displayedColumns: string[] = ['book', 'author', 'borrowDate', 'status', 'actions'];

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private borrowRecordService: BorrowRecordService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id || null;
        this.userName = user.name;
        this.loadBooks();
        this.loadBorrowRecords();
      }
    });
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

  loadBorrowRecords(): void {
    if (!this.userId) return;
    
    this.loadingBorrowRecords = true;
    this.borrowRecordService.getBorrowRecordsByUserId(this.userId).subscribe({
      next: (records) => {
        this.borrowRecords = records;
        this.loadingBorrowRecords = false;
      },
      error: (error) => {
        console.error('Error loading borrow records:', error);
        this.loadingBorrowRecords = false;
        this.snackBar.open('Failed to load borrow records. Please try again.', 'Close', { duration: 3000 });
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
    if (!this.userId) {
      this.snackBar.open('You must be logged in to borrow books.', 'Close', { duration: 3000 });
      return;
    }

    this.borrowRecordService.requestToBorrowBook(this.userId, bookId).subscribe({
      next: () => {
        this.snackBar.open('Book borrow request submitted successfully!', 'Close', { duration: 3000 });
        this.loadBorrowRecords();
        this.loadBooks();
      },
      error: (error) => {
        console.error('Error borrowing book:', error);
        this.snackBar.open('Failed to borrow book. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  returnBook(borrowRecordId: number): void {
    this.borrowRecordService.returnBook(borrowRecordId).subscribe({
      next: () => {
        this.snackBar.open('Book returned successfully!', 'Close', { duration: 3000 });
        this.loadBorrowRecords();
        this.loadBooks();
      },
      error: (error) => {
        console.error('Error returning book:', error);
        this.snackBar.open('Failed to return book. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
