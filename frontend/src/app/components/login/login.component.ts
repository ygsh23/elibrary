import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  rememberMe = false;
  private isBrowser: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    
    // Check for saved credentials (only in browser context)
    if (this.isBrowser) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        this.loginForm.patchValue({
          email: savedEmail
        });
        this.rememberMe = true;
      }
    }
  }

  ngAfterViewInit(): void {
    // Initialize floating book animations with random positions
    this.initializeFloatingElements();
  }

  private initializeFloatingElements(): void {
    // Get floating books
    const floatingBooks = this.el.nativeElement.querySelectorAll('.floating-book');
    
    // Apply random positions and animations to books
    floatingBooks.forEach((book: HTMLElement) => {
      const randomX = Math.floor(Math.random() * 80);
      const randomY = Math.floor(Math.random() * 80);
      const randomDelay = Math.random() * 5;
      const randomDuration = 10 + Math.random() * 10;
      
      this.renderer.setStyle(book, 'left', `${randomX}%`);
      this.renderer.setStyle(book, 'top', `${randomY}%`);
      this.renderer.setStyle(book, 'animation-delay', `${randomDelay}s`);
      this.renderer.setStyle(book, 'animation-duration', `${randomDuration}s`);
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      
      // Handle remember me (only in browser context)
      if (this.isBrowser) {
        if (this.rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
      }
      
      this.authService.login(email, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Login successful!', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          this.snackBar.open('Login failed. Please check your credentials.', 'Close', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Trigger validation on all fields
      this.markFormGroupTouched(this.loginForm);
    }
  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  fillDemoAccount(type: string): void {
    if (type === 'user') {
      this.loginForm.setValue({
        email: 'user@example.com',
        password: 'password123'
      });
    } else if (type === 'admin') {
      this.loginForm.setValue({
        email: 'admin@example.com',
        password: 'admin123'
      });
    }
  }

  toggleRememberMe(): void {
    this.rememberMe = !this.rememberMe;
  }

  // Method for social login (placeholder for now)
  socialLogin(provider: string): void {
    this.snackBar.open(`${provider} login is not implemented yet.`, 'Close', { duration: 3000 });
  }
}
