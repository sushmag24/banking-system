import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CreateUserRequest } from '../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center align-items-center">
        <div class="col-md-8 col-lg-6">
          <div class="card card-custom p-4 p-md-5">
            <div class="text-center mb-4">
              <div class="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
                <i class="bi bi-person-plus-fill fs-2"></i>
              </div>
              <h3 class="fw-bold text-dark mb-1">Create an Account</h3>
              <p class="text-muted small">Join Apex Global Bank in minutes</p>
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
              <i class="bi bi-exclamation-circle-fill"></i>
              <div>{{ errorMessage }}</div>
              <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
            </div>

            <div *ngIf="successMessage" class="alert alert-success d-flex flex-column gap-2" role="alert">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-check-circle-fill fs-5"></i>
                <strong>Registration Successful!</strong>
              </div>
              <p class="mb-0 small">{{ successMessage }}</p>
              <a routerLink="/login" class="btn btn-sm btn-success mt-2 align-self-start">Proceed to Sign In</a>
            </div>

            <form *ngIf="!successMessage" (ngSubmit)="onSubmit()" #registerForm="ngForm">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small text-secondary">First Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="request.firstName"
                    name="firstName"
                    required
                    minlength="2"
                    placeholder="John"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small text-secondary">Last Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="request.lastName"
                    name="lastName"
                    required
                    minlength="2"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small text-secondary">Email Address</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-envelope text-muted"></i></span>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="request.emailId"
                    name="emailId"
                    required
                    email
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small text-secondary">Contact Number</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-telephone text-muted"></i></span>
                  <input
                    type="tel"
                    class="form-control"
                    [(ngModel)]="request.contactNumber"
                    name="contactNumber"
                    required
                    placeholder="+1 (555) 000-1234"
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
                    [(ngModel)]="request.password"
                    name="password"
                    required
                    minlength="6"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary-custom w-100 py-2 mb-3"
                [disabled]="!registerForm.form.valid || isLoading"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                <span>{{ isLoading ? 'Registering...' : 'Complete Registration' }}</span>
              </button>
            </form>

            <div class="text-center mt-3 pt-2">
              <span class="text-muted small">Already have an account? </span>
              <a routerLink="/login" class="text-primary fw-semibold small text-decoration-none">Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  request: CreateUserRequest = {
    firstName: '',
    lastName: '',
    emailId: '',
    contactNumber: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.request).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Your customer account has been created successfully. You can now sign in.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.responseMessage || err.error?.message || err.error?.detail || 'Registration failed. Please verify your details.';
      }
    });
  }
}