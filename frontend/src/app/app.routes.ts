import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookDetailsComponent } from './components/book-details/book-details.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { BorrowListComponent } from './components/borrow-list/borrow-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'books', component: BookListComponent },
  { path: 'books/:id', component: BookDetailsComponent },
  { path: 'my-books', component: BorrowListComponent },
  { path: 'admin/books', component: AdminDashboardComponent },
  { path: 'admin/books/add', component: BookFormComponent },
  { path: 'admin/books/edit/:id', component: BookFormComponent },
  { path: 'admin/borrow-requests', component: AdminDashboardComponent },
  { path: '**', redirectTo: '/dashboard' } // Wildcard route for 404
];
