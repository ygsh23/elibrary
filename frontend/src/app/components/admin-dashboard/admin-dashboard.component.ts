import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Book } from '../../models/book.model';
import { User } from '../../models/user.model';
import { BorrowRecord } from '../../models/borrow-record.model';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { BorrowRecordService } from '../../services/borrow-record.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Books
  books: Book[] = [];
  searchQuery = '';
  loading = false;
  bookColumns: string[] = ['title', 'author', 'category', 'copies', 'actions'];

  // Borrow Requests
  borrowRequests: BorrowRecord[] = [];
  filteredBorrowRequests: BorrowRecord[] = [];
  requestFilter = 'PENDING';
  loadingRequests = false;
  requestColumns: string[] = ['user', 'book', 'borrowDate', 'returnDate', 'status', 'actions'];

  // Users
  users: User[] = [];
  loadingUsers = false;
  userColumns: string[] = ['name', 'email', 'role', 'actions'];

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private borrowRecordService: BorrowRecordService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadBooks();
    this.loadBorrowRequests();
    this.loadUsers();
  }

  // Books methods
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

  openBookForm(book?: Book): void {
    // This would typically open a dialog with a book form
    // For now, we'll just show a message
    this.snackBar.open('Book form would open here', 'Close', { duration: 3000 });
  }

  editBook(book: Book): void {
    this.openBookForm(book);
  }

  deleteBook(bookId: number): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(bookId).subscribe({
        next: () => {
          this.snackBar.open('Book deleted successfully!', 'Close', { duration: 3000 });
          this.loadBooks();
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          this.snackBar.open('Failed to delete book. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  // Borrow Requests methods
  loadBorrowRequests(): void {
    this.loadingRequests = true;
    this.borrowRecordService.getAllBorrowRecords().subscribe({
      next: (records) => {
        this.borrowRequests = records;
        this.filterRequests();
        this.loadingRequests = false;
      },
      error: (error) => {
        console.error('Error loading borrow requests:', error);
        this.loadingRequests = false;
        this.snackBar.open('Failed to load borrow requests. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  filterRequests(): void {
    if (this.requestFilter === 'ALL') {
      this.filteredBorrowRequests = this.borrowRequests;
    } else {
      this.filteredBorrowRequests = this.borrowRequests.filter(
        request => request.status === this.requestFilter
      );
    }
  }

  approveBorrowRequest(requestId: number): void {
    this.borrowRecordService.approveBorrowRequest(requestId).subscribe({
      next: () => {
        this.snackBar.open('Borrow request approved!', 'Close', { duration: 3000 });
        this.loadBorrowRequests();
        this.loadBooks(); // Refresh books to update available copies
      },
      error: (error) => {
        console.error('Error approving borrow request:', error);
        this.snackBar.open('Failed to approve borrow request. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  rejectBorrowRequest(requestId: number): void {
    this.borrowRecordService.rejectBorrowRequest(requestId).subscribe({
      next: () => {
        this.snackBar.open('Borrow request rejected!', 'Close', { duration: 3000 });
        this.loadBorrowRequests();
      },
      error: (error) => {
        console.error('Error rejecting borrow request:', error);
        this.snackBar.open('Failed to reject borrow request. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  // Users methods
  loadUsers(): void {
    this.loadingUsers = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
        this.snackBar.open('Failed to load users. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  viewUserBorrowHistory(userId: number): void {
    // This would typically open a dialog showing the user's borrow history
    // For now, we'll just show a message
    this.snackBar.open('User borrow history would show here', 'Close', { duration: 3000 });
  }
}
