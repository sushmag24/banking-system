import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center align-items-center min-vh-75">
        <div class="col-md-6 col-lg-5">
          <div class="card card-custom p-4 p-md-5">
            <div class="text-center mb-4">
              <div class="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
                <i class="bi bi-shield-lock-fill fs-2"></i>
              </div>
              <h3 class="fw-bold text-dark mb-1">Apex Global Bank</h3>
              <p class="text-muted small">Sign in to your secure digital banking portal</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-circle-fill"></i>
              <div>{{ errorMessage }}</div>
              <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
            </div>

            <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
              <div class="mb-3">
                <label class="form-label fw-semibold small text-secondary">Email Address</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-envelope text-muted"></i></span>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="emailId"
                    name="emailId"
                    required
                    email
                    placeholder="name@example.com"
                    [disabled]="isLoading"
                  />
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-semibold small text-secondary">Password</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-key text-muted"></i></span>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    [disabled]="isLoading"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary-custom w-100 py-2 mb-3"
                [disabled]="!loginForm.form.valid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                <span>{{ isLoading ? 'Authenticating...' : 'Sign In' }}</span>
              </button>
            </form>

            <div class="border-top pt-3 mt-3">
              <p class="text-muted small text-center mb-2">Quick Demo Accounts:</p>
              <div class="d-flex gap-2">
                <button (click)="fillDemo('customer@banking.com', 'password123')" class="btn btn-sm btn-outline-custom flex-grow-1">
                  <i class="bi bi-person me-1"></i> Customer Demo
                </button>
                <button (click)="fillDemo('admin@banking.com', 'admin123')" class="btn btn-sm btn-outline-custom flex-grow-1">
                  <i class="bi bi-shield me-1"></i> Admin Demo
                </button>
              </div>
            </div>

            <div class="text-center mt-4 pt-2">
              <span class="text-muted small">Don't have an account? </span>
              <a routerLink="/register" class="text-primary fw-semibold small text-decoration-none">Open an Account</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  emailId = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  fillDemo(email: string, pass: string) {
    this.emailId = email;
    this.password = pass;
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ emailId: this.emailId, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your email and credentials.';
      }
    });
  }
}