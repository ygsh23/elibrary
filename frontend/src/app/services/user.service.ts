import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  getUserById(userId: number): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`).pipe(
      catchError(error => {
        console.error(`Error fetching user ${userId}:`, error);
        return of(null);
      })
    );
  }

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?query=${query}`).pipe(
      catchError(error => {
        console.error('Error searching users:', error);
        return of([]);
      })
    );
  }

  updateUserStatus(userId: number, status: string): Observable<boolean> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/status`, { status }).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error updating user ${userId} status:`, error);
        return of(false);
      })
    );
  }

  // Mock data for development
  private mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      createdAt: new Date('2023-01-15'),
      borrowedCount: 3,
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'ADMIN',
      createdAt: new Date('2023-01-10'),
      borrowedCount: 0,
      status: 'ACTIVE'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'USER',
      createdAt: new Date('2023-02-05'),
      borrowedCount: 5,
      status: 'INACTIVE'
    }
  ];
}
