import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BorrowRecord } from '../models/borrow-record.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BorrowRecordService {
  private apiUrl = `${environment.apiUrl}/borrow-records`;

  constructor(private http: HttpClient) { }

  getAllBorrowRecords(): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(this.apiUrl).pipe(
      catchError(this.handleError<BorrowRecord[]>('getAllBorrowRecords', []))
    );
  }

  getBorrowRecordById(id: number): Observable<BorrowRecord> {
    return this.http.get<BorrowRecord>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<BorrowRecord>('getBorrowRecordById'))
    );
  }

  getBorrowRecordsByUserId(userId: number): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(this.handleError<BorrowRecord[]>('getBorrowRecordsByUserId', []))
    );
  }

  getBorrowRecordsByBookId(bookId: number): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.apiUrl}/book/${bookId}`).pipe(
      catchError(this.handleError<BorrowRecord[]>('getBorrowRecordsByBookId', []))
    );
  }

  getBorrowRecordsByStatus(status: string): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.apiUrl}/status/${status}`).pipe(
      catchError(this.handleError<BorrowRecord[]>('getBorrowRecordsByStatus', []))
    );
  }

  getActiveBorrowRecordsByUserId(userId: number): Observable<BorrowRecord[]> {
    return this.http.get<BorrowRecord[]>(`${this.apiUrl}/user/${userId}/active`).pipe(
      catchError(this.handleError<BorrowRecord[]>('getActiveBorrowRecordsByUserId', []))
    );
  }

  requestToBorrowBook(userId: number, bookId: number): Observable<BorrowRecord> {
    return this.http.post<BorrowRecord>(`${this.apiUrl}/request`, { userId, bookId }).pipe(
      catchError(this.handleError<BorrowRecord>('requestToBorrowBook'))
    );
  }

  approveBorrowRequest(id: number): Observable<BorrowRecord> {
    return this.http.put<BorrowRecord>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      catchError(this.handleError<BorrowRecord>('approveBorrowRequest'))
    );
  }

  rejectBorrowRequest(id: number): Observable<BorrowRecord> {
    return this.http.put<BorrowRecord>(`${this.apiUrl}/${id}/reject`, {}).pipe(
      catchError(this.handleError<BorrowRecord>('rejectBorrowRequest'))
    );
  }

  returnBook(id: number): Observable<BorrowRecord> {
    return this.http.put<BorrowRecord>(`${this.apiUrl}/${id}/return`, {}).pipe(
      catchError(this.handleError<BorrowRecord>('returnBook'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}
