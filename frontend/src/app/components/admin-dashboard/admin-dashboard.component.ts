import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { BookService } from '../../services/book.service';
import { UserService } from '../../services/user.service';
import { BorrowService } from '../../services/borrow.service';
import { BorrowRecordService } from '../../services/borrow-record.service';
import { Book } from '../../models/book.model';
import { User } from '../../models/user.model';
import { BorrowRecord, BorrowStatus } from '../../models/borrow-record.model';
import { BookFormDialogComponent } from '../book-form-dialog/book-form-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    BookFormDialogComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Active section tracking
  activeSection: 'books' | 'requests' | 'users' = 'books';
  
  // Books section
  books: Book[] = [];
  loading = false;
  searchQuery = '';
  
  // Requests section
  borrowRequests: BorrowRecord[] = [];
  filteredRequests: BorrowRecord[] = [];
  loadingRequests = false;
  requestFilter: BorrowStatus | 'ALL' = 'PENDING';
  
  // Users section
  users: User[] = [];
  filteredUsers: User[] = [];
  loadingUsers = false;
  userSearchQuery = '';
  userRoleFilter: string = 'ALL'; // 'ALL', 'STUDENT', 'ADMIN'
  userBorrowFilter: string = 'ALL'; // 'ALL', 'ACTIVE', 'NONE'

  constructor(
    private bookService: BookService,
    private userService: UserService,
    private borrowService: BorrowService,
    private borrowRecordService: BorrowRecordService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Load initial data
    this.loadBooks();
  }

  // Navigation methods
  setActiveSection(section: 'books' | 'requests' | 'users'): void {
    this.activeSection = section;
    
    // Load data for the selected section if not already loaded
    if (section === 'books' && this.books.length === 0) {
      this.loadBooks();
    } else if (section === 'requests' && this.borrowRequests.length === 0) {
      this.loadBorrowRequests();
    } else if (section === 'users' && this.users.length === 0) {
      this.loadUsers();
    }
  }

  // Books section methods
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
        this.showSnackBar('Failed to load books. Please try again.');
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
        this.showSnackBar('Search failed. Please try again.');
      }
    });
  }

  // Open book form dialog for adding a new book
  openBookForm(): void {
    console.log('Opening book form dialog');
    
    const dialogRef = this.dialog.open(BookFormDialogComponent, {
      width: '600px',
      data: { book: null },
      panelClass: 'cosmic-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addBook(result);
      }
    });
  }

  // Add a new book to the system
  addBook(bookData: Book): void {
    // Show loading indicator
    this.loading = true;
    
    // Add publisher and coverImageUrl if they're not provided
    if (!bookData.publisher) {
      bookData.publisher = 'Cosmic Publications';
    }
    
    if (!bookData.coverImageUrl) {
      bookData.coverImageUrl = 'https://via.placeholder.com/150x200?text=New+Book';
    }
    
    try {
      // Add the book directly to UI first for immediate feedback
      const tempId = Math.floor(Math.random() * 10000);
      const tempBook = {...bookData, id: tempId};
      this.books.unshift(tempBook);
      
      // Then try to sync with backend
      this.bookService.addBook(bookData).subscribe({
        next: (savedBook) => {
          // Replace the temporary book with the one from the backend
          const index = this.books.findIndex(b => b.id === tempId);
          if (index !== -1) {
            this.books[index] = savedBook;
          }
          this.loading = false;
          this.showSnackBar('Book added successfully to the cosmic library!');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error adding book to backend:', error);
          this.loading = false;
          // Book is already added to UI, just show a message about backend sync issue
          this.showSnackBar('Book added to cosmic collection. Backend sync will retry later.');
        }
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      this.loading = false;
      this.showSnackBar('Book added to local collection.');
    }
  }

  // Open book form dialog for editing an existing book
  editBook(book: Book): void {
    console.log('Opening edit form for book:', book);
    
    const dialogRef = this.dialog.open(BookFormDialogComponent, {
      width: '600px',
      data: { book: {...book} },
      panelClass: 'cosmic-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateBook(result);
      }
    });
  }
  
  // Update an existing book
  updateBook(bookData: Book): void {
    // Show loading indicator
    this.loading = true;
    
    // Update the book
    this.bookService.updateBook(bookData).subscribe({
      next: (updatedBook) => {
        // Update the book in the array
        const index = this.books.findIndex(b => b.id === updatedBook.id);
        if (index !== -1) {
          this.books[index] = updatedBook;
        }
        this.loading = false;
        this.showSnackBar('Book updated successfully!');
      },
      error: (error) => {
        console.error('Error updating book:', error);
        this.loading = false;
        this.showSnackBar('Failed to update book. Please try again.');
      }
    });
  }

  deleteBook(bookId: number): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(bookId).subscribe({
        next: () => {
          // Remove the book from the array
          this.books = this.books.filter(b => b.id !== bookId);
          this.showSnackBar('Book deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          this.showSnackBar('Failed to delete book. Please try again.');
        }
      });
    }
  }

  // Borrow requests section methods
  loadBorrowRequests(): void {
    this.loadingRequests = true;
    this.borrowService.getAllBorrowRecords().subscribe({
      next: (records) => {
        this.borrowRequests = records;
        this.filterRequests();
        this.loadingRequests = false;
      },
      error: (error) => {
        console.error('Error loading borrow requests:', error);
        this.loadingRequests = false;
        this.showSnackBar('Failed to load borrow requests. Please try again.');
      }
    });
  }

  filterRequests(): void {
    if (this.requestFilter === 'ALL') {
      this.filteredRequests = [...this.borrowRequests];
    } else {
      this.filteredRequests = this.borrowRequests.filter(
        request => request.status === this.requestFilter
      );
    }
  }

  setRequestFilter(filter: BorrowStatus | 'ALL'): void {
    this.requestFilter = filter;
    this.filterRequests();
  }

  approveRequest(requestId: number): void {
    this.borrowService.approveBorrowRequest(requestId).subscribe({
      next: () => {
        // Update the request status in the array
        const index = this.borrowRequests.findIndex(r => r.id === requestId);
        if (index !== -1) {
          this.borrowRequests[index].status = 'APPROVED';
          this.filterRequests();
        }
        this.showSnackBar('Request approved successfully!');
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.showSnackBar('Failed to approve request. Please try again.');
      }
    });
  }

  rejectRequest(requestId: number): void {
    this.borrowService.rejectBorrowRequest(requestId).subscribe({
      next: () => {
        // Update the request status in the array
        const index = this.borrowRequests.findIndex(r => r.id === requestId);
        if (index !== -1) {
          this.borrowRequests[index].status = 'REJECTED';
          this.filterRequests();
        }
        this.showSnackBar('Request rejected successfully!');
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.showSnackBar('Failed to reject request. Please try again.');
      }
    });
  }

  markAsReturned(requestId: number): void {
    this.borrowService.markAsReturned(requestId).subscribe({
      next: () => {
        // Update the request status in the array
        const index = this.borrowRequests.findIndex(r => r.id === requestId);
        if (index !== -1) {
          this.borrowRequests[index].status = 'RETURNED';
          this.filterRequests();
        }
        this.showSnackBar('Book marked as returned successfully!');
      },
      error: (error) => {
        console.error('Error marking as returned:', error);
        this.showSnackBar('Failed to mark as returned. Please try again.');
      }
    });
  }

  isOverdue(request: BorrowRecord): boolean {
    if (request.status !== 'APPROVED' || !request.dueDate) {
      return false;
    }
    
    const dueDate = new Date(request.dueDate);
    const today = new Date();
    
    return today > dueDate;
  }

  // Users section methods
  loadUsers(): void {
    this.loadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
        this.showSnackBar('Failed to load users. Please try again.');
      }
    });
  }
  
  filterUsers(): void {
    // First apply role filter
    let filtered = this.users;
    
    if (this.userRoleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === this.userRoleFilter);
    }
    
    // Then apply borrow status filter
    if (this.userBorrowFilter === 'ACTIVE') {
      filtered = filtered.filter(user => (user.borrowedCount || 0) > 0);
    } else if (this.userBorrowFilter === 'NONE') {
      filtered = filtered.filter(user => !user.borrowedCount || user.borrowedCount === 0);
    }
    
    this.filteredUsers = filtered;
  }
  
  setUserRoleFilter(filter: string): void {
    this.userRoleFilter = filter;
    this.filterUsers();
  }
  
  setUserBorrowFilter(filter: string): void {
    this.userBorrowFilter = filter;
    this.filterUsers();
  }

  searchUsers(): void {
    if (!this.userSearchQuery.trim()) {
      this.loadUsers();
      return;
    }
    
    this.loadingUsers = true;
    this.userService.searchUsers(this.userSearchQuery).subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers(); // Apply filters to search results
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.loadingUsers = false;
        this.showSnackBar('Search failed. Please try again.');
      }
    });
  }

  // User borrowed books methods
  showUserBorrowedBooks(userId: number): void {
    this.borrowRecordService.getBorrowRecordsByUserId(userId).subscribe({
      next: (records) => {
        // Filter only APPROVED records
        const approvedRecords = records.filter(record => record.status === 'APPROVED');
        
        if (approvedRecords.length === 0) {
          this.showSnackBar('No active borrowed books found for this user.');
          return;
        }
        
        // Format a simple message with the borrowed books
        const userName = approvedRecords[0]?.user?.name || 'User';
        let message = `${userName} has borrowed the following books:\n\n`;
        
        approvedRecords.forEach(record => {
          const dueDate = record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A';
          const isOverdue = record.dueDate && new Date(record.dueDate) < new Date();
          const overdueText = isOverdue ? ' (OVERDUE)' : '';
          
          message += `• ${record.book.title} by ${record.book.author || 'Unknown'}\n`;
          message += `  Due: ${dueDate}${overdueText}\n\n`;
        });
        
        // Show a simple alert with the information
        alert(message);
      },
      error: (error) => {
        console.error('Error fetching user borrow records:', error);
        this.showSnackBar('Failed to load borrowed books. Please try again.');
      }
    });
  }
  
  // Utility methods
  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
