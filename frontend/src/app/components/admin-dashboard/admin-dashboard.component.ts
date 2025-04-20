import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BookService } from '../../services/book.service';
import { UserService } from '../../services/user.service';
import { BorrowService } from '../../services/borrow.service';
import { Book } from '../../models/book.model';
import { User } from '../../models/user.model';
import { BorrowRecord, BorrowStatus } from '../../models/borrow-record.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
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
  loadingUsers = false;
  userSearchQuery = '';

  constructor(
    private bookService: BookService,
    private userService: UserService,
    private borrowService: BorrowService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadBooks();
    this.loadBorrowRequests();
    this.loadUsers();
  }

  // Navigation methods
  setActiveSection(section: 'books' | 'requests' | 'users'): void {
    this.activeSection = section;
  }

  // Books section methods
  loadBooks(): void {
    this.loading = true;
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading books:', error);
        this.loading = false;
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
      error: (error: any) => {
        console.error('Error searching books:', error);
        this.loading = false;
      }
    });
  }

  openBookForm(book?: Book): void {
    // Implementation for book form dialog
    console.log('Open book form', book);
    // For now, we'll just reload books after a delay to simulate adding/editing
    setTimeout(() => this.loadBooks(), 1000);
  }

  editBook(book: Book): void {
    this.openBookForm(book);
  }

  deleteBook(bookId: number): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(bookId).subscribe({
        next: () => {
          this.books = this.books.filter(b => b.id !== bookId);
        },
        error: (error: any) => {
          console.error('Error deleting book:', error);
        }
      });
    }
  }

  // Requests section methods
  loadBorrowRequests(): void {
    this.loadingRequests = true;
    this.borrowService.getAllBorrowRecords().subscribe({
      next: (requests: BorrowRecord[]) => {
        this.borrowRequests = requests;
        this.filterRequests();
        this.loadingRequests = false;
      },
      error: (error: any) => {
        console.error('Error loading borrow requests:', error);
        this.loadingRequests = false;
      }
    });
  }

  setRequestFilter(filter: BorrowStatus | 'ALL'): void {
    this.requestFilter = filter;
    this.filterRequests();
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

  approveRequest(requestId: number): void {
    this.borrowService.approveBorrowRequest(requestId).subscribe({
      next: () => {
        // Update the status in our local array
        const request = this.borrowRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'APPROVED';
          this.filterRequests();
        }
      },
      error: (error: any) => {
        console.error('Error approving request:', error);
      }
    });
  }

  rejectRequest(requestId: number): void {
    this.borrowService.rejectBorrowRequest(requestId).subscribe({
      next: () => {
        // Update the status in our local array
        const request = this.borrowRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'REJECTED';
          this.filterRequests();
        }
      },
      error: (error: any) => {
        console.error('Error rejecting request:', error);
      }
    });
  }

  markAsReturned(requestId: number): void {
    this.borrowService.markAsReturned(requestId).subscribe({
      next: () => {
        // Update the status in our local array
        const request = this.borrowRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'RETURNED';
          this.filterRequests();
        }
      },
      error: (error: any) => {
        console.error('Error marking as returned:', error);
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
      next: (users: User[]) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
      }
    });
  }

  searchUsers(): void {
    if (!this.userSearchQuery.trim()) {
      this.loadUsers();
      return;
    }

    this.loadingUsers = true;
    this.userService.searchUsers(this.userSearchQuery).subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (error: any) => {
        console.error('Error searching users:', error);
        this.loadingUsers = false;
      }
    });
  }

  editUser(user: User): void {
    // Implementation for user edit dialog
    console.log('Edit user', user);
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.status = newStatus as 'ACTIVE' | 'INACTIVE';
      },
      error: (error: any) => {
        console.error('Error updating user status:', error);
      }
    });
  }
}
