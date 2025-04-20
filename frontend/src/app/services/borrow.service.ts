import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BorrowRecord } from '../models/borrow-record.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BorrowService {
  private apiUrl = `${environment.apiUrl}/borrows`;

  constructor(private http: HttpClient) { }

  getAllBorrowRecords(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching borrow records:', error);
        return of([]);
      })
    );
  }

  getBorrowRecordById(id: number): Observable<BorrowRecord | null> {
    return this.http.get<BorrowRecord>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching borrow record ${id}:`, error);
        return of(null);
      })
    );
  }

  getUserBorrowRecords(userId: number): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(error => {
        console.error(`Error fetching user ${userId} borrow records:`, error);
        return of([]);
      })
    );
  }

  createBorrowRequest(bookId: number): Observable<BorrowRecord | null> {
    return this.http.post<BorrowRecord>(this.apiUrl, { bookId }).pipe(
      catchError(error => {
        console.error('Error creating borrow request:', error);
        return of(null);
      })
    );
  }

  approveBorrowRequest(id: number): Observable<boolean> {
    return this.http.patch<BorrowRecord>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error approving borrow request ${id}:`, error);
        return of(false);
      })
    );
  }

  rejectBorrowRequest(id: number): Observable<boolean> {
    return this.http.patch<BorrowRecord>(`${this.apiUrl}/${id}/reject`, {}).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error rejecting borrow request ${id}:`, error);
        return of(false);
      })
    );
  }

  markAsReturned(id: number): Observable<boolean> {
    return this.http.patch<BorrowRecord>(`${this.apiUrl}/${id}/return`, {}).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error marking borrow record ${id} as returned:`, error);
        return of(false);
      })
    );
  }

  renewBorrow(id: number): Observable<boolean> {
    return this.http.patch<BorrowRecord>(`${this.apiUrl}/${id}/renew`, {}).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error renewing borrow record ${id}:`, error);
        return of(false);
      })
    );
  }
}
