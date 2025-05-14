import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BorrowRecord } from '../../models/borrow-record.model';
import { BorrowRecordService } from '../../services/borrow-record.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-borrow-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './borrow-list.component.html',
  styleUrls: ['./borrow-list.component.css']
})
export class BorrowListComponent implements OnInit {
  borrowRecords: BorrowRecord[] = [];
  filteredBorrowRecords: BorrowRecord[] = [];
  loading = false;
  userId: number | null = null;
  statusFilter = 'ALL';
  displayedColumns: string[] = ['book', 'author', 'borrowDate', 'dueDate', 'status', 'actions'];
  // displayedColumns: string[] = ['borrowDate', 'dueDate', 'status', 'actions'];
  // displayedColumns: string[] = ['book', 'author', 'borrowDate', 'returnDate', 'status', 'actions'];

  constructor(
    private borrowRecordService: BorrowRecordService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.id || null;
        this.loadBorrowRecords();
      }
    });
  }

  loadBorrowRecords(): void {
    if (!this.userId) return;
    
    this.loading = true;
    this.borrowRecordService.getBorrowRecordsByUserId(this.userId).subscribe({
      next: (records: BorrowRecord[]) => {
        this.borrowRecords = records;
        this.filterBorrowRecords();
        console.log(this.borrowRecords)
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading borrow records:', error);
        this.loading = false;
        this.snackBar.open('Failed to load borrow records. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  filterBorrowRecords(): void {
    if (this.statusFilter === 'ALL') {
      this.filteredBorrowRecords = [...this.borrowRecords];
      console.log('filtered borrow records', this.filteredBorrowRecords)
    } else {
      this.filteredBorrowRecords = this.borrowRecords.filter(record => record.status === this.statusFilter);
    }
  }

  returnBook(borrowRecordId: number): void {
    this.loading = true;
    this.borrowRecordService.returnBook(borrowRecordId).subscribe({
      next: () => {
        this.snackBar.open('Book returned successfully!', 'Close', { duration: 3000 });
        this.loadBorrowRecords();
      },
      error: (error: any) => {
        console.error('Error returning book:', error);
        this.loading = false;
        this.snackBar.open('Failed to return book. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
