import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  registerForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  selectedRole = 'STUDENT'; // Default role

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  ngAfterViewInit(): void {
    // Initialize floating element animations with random positions
    this.initializeFloatingElements();
  }

  private initializeFloatingElements(): void {
    // Get floating elements
    const floatingElements = this.el.nativeElement.querySelectorAll('.floating-element');
    
    // Apply random positions and animations to elements
    floatingElements.forEach((element: HTMLElement) => {
      const randomX = Math.floor(Math.random() * 80);
      const randomY = Math.floor(Math.random() * 80);
      const randomDelay = Math.random() * 5;
      const randomDuration = 10 + Math.random() * 10;
      
      this.renderer.setStyle(element, 'left', `${randomX}%`);
      this.renderer.setStyle(element, 'top', `${randomY}%`);
      this.renderer.setStyle(element, 'animation-delay', `${randomDelay}s`);
      this.renderer.setStyle(element, 'animation-duration', `${randomDuration}s`);
    });
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    
    // Add a highlight animation to the selected role
    const selectedOption = this.el.nativeElement.querySelector(`.role-option.selected`);
    if (selectedOption) {
      this.renderer.addClass(selectedOption, 'highlight-animation');
      setTimeout(() => {
        this.renderer.removeClass(selectedOption, 'highlight-animation');
      }, 1000);
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const user = {
        ...this.registerForm.value,
        role: this.selectedRole
      };
      
      // Remove termsAccepted as it's not needed for the backend
      delete user.termsAccepted;
      
      this.authService.register(user).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Registration successful! Please log in.', 'Close', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          let errorMessage = 'Registration failed. Please try again.';
          
          // Handle specific error cases
          if (error.status === 409) {
            errorMessage = 'Email already exists. Please use a different email.';
          }
          
          this.snackBar.open(errorMessage, 'Close', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Trigger validation on all fields
      this.markFormGroupTouched(this.registerForm);
    }
  }

  // Helper method to mark all controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
