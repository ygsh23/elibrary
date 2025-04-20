import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  userName = '';
  userInitials = '';
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userName = user.name || '';
        this.isAdmin = user.role === 'ADMIN';
        this.userInitials = this.getInitials(this.userName);
      } else {
        this.userName = '';
        this.isAdmin = false;
        this.userInitials = '';
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '';
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    
    // If menu is opened, add a click event listener to close it when clicking outside
    if (this.isMenuOpen) {
      setTimeout(() => {
        document.addEventListener('click', this.closeMenuOnClickOutside);
      }, 0);
    } else {
      document.removeEventListener('click', this.closeMenuOnClickOutside);
    }
  }
  
  closeMenu(): void {
    this.isMenuOpen = false;
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  }
  
  closeMenuOnClickOutside = (event: MouseEvent) => {
    const drawer = document.querySelector('.mobile-nav-drawer');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (drawer && menuToggle && 
        !drawer.contains(event.target as Node) && 
        !menuToggle.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
