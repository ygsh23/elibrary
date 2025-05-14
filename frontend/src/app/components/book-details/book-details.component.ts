import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
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
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.css']
})
export class BookDetailsComponent implements OnInit {
  book: Book | null = null;
  loading = false;
  isLoggedIn = false;
  isAdmin = false;
  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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

    this.route.paramMap.subscribe(params => {
      const bookId = Number(params.get('id'));
      if (bookId) {
        this.loadBook(bookId);
      }
    });
  }

  loadBook(id: number): void {
    this.loading = true;
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.loading = false;
        this.snackBar.open('Failed to load book details. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  borrowBook(): void {
    if (!this.isLoggedIn || !this.userId || !this.book) {
      this.snackBar.open('You must be logged in to borrow books.', 'Close', { duration: 3000 });
      return;
    }

    console.log('Requesting to borrow book with ID:', this.book.id);
    
    this.borrowRecordService.requestToBorrowBook(this.userId, this.book.id).subscribe({
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
        
        // Refresh book to update availability
        this.loadBook(this.book!.id);
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
