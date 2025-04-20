import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { BorrowRecord, BorrowStatus } from '../../models/borrow-record.model';
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
export class UserDashboardComponent implements OnInit, AfterViewInit {
  books: Book[] = [];
  borrowRecords: BorrowRecord[] = [];
  borrowedBooks: BorrowRecord[] = [];
  searchQuery = '';
  loading = false;
  loadingBorrowRecords = false;
  loadingBorrowed = false;
  userId: number | null = null;
  userName = '';
  displayedColumns: string[] = ['book', 'author', 'borrowDate', 'status', 'actions'];
  
  // Add missing properties for dashboard stats
  totalBooks = 0;
  borrowedBooksCount = 0;
  dueSoonBooks = 0;
  
  // Add properties for recommendations
  recommendedBooks: Book[] = [];
  featuredBooks: Book[] = [];
  
  // Add properties for reading history
  readingHistory: BorrowRecord[] = [];
  loadingHistory = false;

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
        this.loadReadingHistory();
        this.loadFeaturedBooks();
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialize the orbital navigation
    this.initializeNavigation();
  }
  
  // Initialize the orbital navigation system
  private initializeNavigation(): void {
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Get the target section
        const targetSection = item.getAttribute('data-section');
        
        // Remove active class from all nav items and sections
        navItems.forEach(navItem => navItem.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked nav item and corresponding section
        item.classList.add('active');
        document.getElementById(targetSection!)?.classList.add('active');
      });
    });
  }

  loadBooks(): void {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.totalBooks = books.length;
        this.updateRecommendations(books);
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
        this.borrowedBooks = records.filter(record => 
          record.status === 'APPROVED' || record.status === 'PENDING'
        );
        this.borrowedBooksCount = this.borrowedBooks.length;
        
        // Calculate books due soon (within 3 days)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        
        this.dueSoonBooks = records.filter(record => {
          if (record.status !== 'APPROVED') return false;
          if (!record.dueDate) return false;
          const dueDate = new Date(record.dueDate);
          return dueDate <= threeDaysFromNow && dueDate >= new Date();
        }).length;
        
        this.loadingBorrowRecords = false;
      },
      error: (error) => {
        console.error('Error loading borrow records:', error);
        this.loadingBorrowRecords = false;
        this.snackBar.open('Failed to load borrow records. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
  
  // Load reading history (past borrowed and returned books)
  loadReadingHistory(): void {
    if (!this.userId) return;
    
    this.loadingHistory = true;
    this.borrowRecordService.getBorrowRecordsByUserId(this.userId).subscribe({
      next: (records) => {
        // Filter only returned books for reading history
        this.readingHistory = records.filter(record => 
          record.status === 'RETURNED'
        ).sort((a, b) => {
          // Sort by return date, most recent first
          const dateA = new Date(a.returnDate || new Date());
          const dateB = new Date(b.returnDate || new Date());
          return dateB.getTime() - dateA.getTime();
        });
        this.loadingHistory = false;
      },
      error: (error) => {
        console.error('Error loading reading history:', error);
        this.loadingHistory = false;
        this.snackBar.open('Failed to load reading history. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
  
  // Load featured books
  loadFeaturedBooks(): void {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        // Get a random selection of books to feature
        this.featuredBooks = this.getRandomBooks(books, 5);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading featured books:', error);
        this.loading = false;
        this.snackBar.open('Failed to load featured books. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
  
  // Get random selection of books
  getRandomBooks(books: Book[], count: number): Book[] {
    const shuffled = [...books].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  // Add method to generate personalized recommendations
  updateRecommendations(allBooks: Book[]): void {
    // Simple recommendation algorithm based on available books
    // In a real app, this would use user preferences, reading history, etc.
    if (allBooks.length === 0) {
      this.recommendedBooks = [];
      return;
    }
    
    // Get a random selection of books (up to 4) as recommendations
    const availableBooks = allBooks.filter(book => book.availableCopies > 0);
    this.recommendedBooks = this.getRandomSample(availableBooks, 4);
  }
  
  // Helper method to get random sample from array
  private getRandomSample<T>(array: T[], size: number): T[] {
    if (array.length <= size) return [...array];
    
    const result: T[] = [];
    const copyArray = [...array];
    
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(Math.random() * copyArray.length);
      result.push(copyArray[randomIndex]);
      copyArray.splice(randomIndex, 1);
    }
    
    return result;
  }
  
  // Calculate duration between two dates in days
  getDurationDays(startDate: Date, endDate: Date | undefined): number {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  // Check if a book is due soon (within 3 days)
  isDueSoon(borrowRecord: BorrowRecord): boolean {
    if (borrowRecord.status !== 'APPROVED') return false;
    if (!borrowRecord.dueDate) return false;
    
    const dueDate = new Date(borrowRecord.dueDate);
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return dueDate <= threeDaysFromNow && dueDate >= today;
  }
  
  // Check if a book is overdue
  isOverdue(borrowRecord: BorrowRecord): boolean {
    if (borrowRecord.status !== 'APPROVED') return false;
    if (!borrowRecord.dueDate) return false;
    
    const dueDate = new Date(borrowRecord.dueDate);
    const today = new Date();
    
    return dueDate < today;
  }
  
  // Renew a borrowed book
  renewBook(borrowRecordId: number): void {
    this.borrowRecordService.renewBook(borrowRecordId).subscribe({
      next: () => {
        this.snackBar.open('Book renewed successfully!', 'Close', { duration: 3000 });
        this.loadBorrowRecords();
      },
      error: (error: any) => {
        console.error('Error renewing book:', error);
        this.snackBar.open('Failed to renew book. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
  
  // Generate random gradient colors for book covers
  getRandomGradient(): string {
    const gradients = [
      '#7e57c2, #5e35b1',
      '#5c6bc0, #3949ab',
      '#26a69a, #00897b',
      '#66bb6a, #43a047',
      '#ec407a, #d81b60',
      '#8d6e63, #6d4c41',
      '#ff7043, #e64a19',
      '#ffca28, #ffb300'
    ];
    
    return gradients[Math.floor(Math.random() * gradients.length)];
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

  // Add method to return a book
  returnBook(borrowRecordId: number): void {
    this.borrowRecordService.returnBook(borrowRecordId).subscribe({
      next: () => {
        this.snackBar.open('Book returned successfully!', 'Close', { duration: 3000 });
        this.loadBorrowRecords();
        this.loadReadingHistory();
      },
      error: (error: any) => {
        console.error('Error returning book:', error);
        this.snackBar.open('Failed to return book. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
  
  // Add method to borrow a book
  borrowBook(bookId: number): void {
    if (!this.userId) {
      this.snackBar.open('Please log in to borrow books.', 'Close', { duration: 3000 });
      return;
    }
    
    this.borrowRecordService.requestToBorrowBook(this.userId, bookId).subscribe({
      next: () => {
        this.snackBar.open('Book borrow request submitted successfully!', 'Close', { duration: 3000 });
        this.loadBorrowRecords();
      },
      error: (error: any) => {
        console.error('Error borrowing book:', error);
        this.snackBar.open('Failed to borrow book. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
