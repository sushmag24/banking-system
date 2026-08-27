import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card card-custom p-4 p-md-5">
            <div class="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
              <div class="p-4 rounded-circle bg-primary bg-opacity-10 text-primary fs-1 fw-bold">
                {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
              </div>
              <div>
                <h3 class="fw-bold mb-1">{{ user?.firstName }} {{ user?.lastName }}</h3>
                <span class="badge" [ngClass]="user?.role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-primary'">
                  {{ user?.role }}
                </span>
                <span class="badge badge-active ms-2">{{ user?.status }}</span>
              </div>
            </div>

            <h5 class="fw-bold mb-3">Customer Profile Information</h5>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <div class="small text-muted">Email Address</div>
                  <div class="fw-semibold text-dark">{{ user?.emailId }}</div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <div class="small text-muted">Customer ID</div>
                  <div class="fw-semibold text-dark">{{ user?.userId }}</div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <div class="small text-muted">Identification Number</div>
                  <div class="fw-semibold font-monospace small text-dark">{{ user?.identificationNumber || 'ID-VERIFIED' }}</div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="p-3 bg-light rounded-3">
                  <div class="small text-muted">Keycloak Auth ID</div>
                  <div class="fw-semibold font-monospace small text-dark text-truncate">{{ user?.authId }}</div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
              <span class="text-muted small">Apex Global Bank Digital Security</span>
              <button (click)="authService.logout()" class="btn btn-outline-danger btn-sm">
                <i class="bi bi-box-arrow-right me-1"></i> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  public authService = inject(AuthService);
  user = this.authService.currentUser();
}