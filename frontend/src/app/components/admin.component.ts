import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { User } from '../models/user.model';
import { Account } from '../models/account.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark mb-1">
            <i class="bi bi-shield-lock text-warning me-2"></i>Admin Management Console
          </h2>
          <p class="text-muted mb-0">System-wide customer verification and bank account administrative controls</p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 gap-2">
        <li class="nav-item">
          <button
            class="nav-link fw-semibold rounded-3"
            [ngClass]="activeTab === 'USERS' ? 'active bg-primary text-white' : 'bg-light text-dark'"
            (click)="activeTab = 'USERS'"
          >
            <i class="bi bi-people-fill me-1"></i> User Approvals & Customers ({{ users.length }})
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link fw-semibold rounded-3"
            [ngClass]="activeTab === 'ACCOUNTS' ? 'active bg-primary text-white' : 'bg-light text-dark'"
            (click)="activeTab = 'ACCOUNTS'"
          >
            <i class="bi bi-wallet-fill me-1"></i> All System Accounts ({{ allAccounts.length }})
          </button>
        </li>
      </ul>

      <!-- Users Tab Content -->
      <div *ngIf="activeTab === 'USERS'" class="card card-custom p-4">
        <h5 class="fw-bold mb-3">Registered Customers</h5>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name / Email</th>
                <th>Contact</th>
                <th>Identification</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td>
                  <span class="font-monospace fw-bold text-primary">#{{ u.userId }}</span>
                </td>
                <td>
                  <div class="fw-bold text-dark">
                    {{ u.userProfile?.firstName }} {{ u.userProfile?.lastName }}
                  </div>
                  <small class="text-muted">{{ u.emailId }}</small>
                </td>
                <td>{{ u.contactNo }}</td>
                <td>
                  <small class="font-monospace text-secondary text-truncate" style="max-width: 150px; display: inline-block;">
                    {{ u.identificationNumber || 'N/A' }}
                  </small>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-active': u.status === 'APPROVED',
                    'badge-pending': u.status === 'PENDING',
                    'badge-closed': u.status === 'REJECTED'
                  }">
                    {{ u.status }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button
                      *ngIf="u.status !== 'APPROVED'"
                      (click)="changeUserStatus(u.userId, 'APPROVED')"
                      class="btn btn-outline-success"
                      title="Approve User"
                    >
                      <i class="bi bi-check-lg me-1"></i> Approve
                    </button>
                    <button
                      *ngIf="u.status !== 'REJECTED'"
                      (click)="changeUserStatus(u.userId, 'REJECTED')"
                      class="btn btn-outline-danger"
                      title="Reject User"
                    >
                      <i class="bi bi-x-lg me-1"></i> Reject
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Accounts Tab Content -->
      <div *ngIf="activeTab === 'ACCOUNTS'" class="card card-custom p-4">
        <h5 class="fw-bold mb-3">All Customer Bank Accounts</h5>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Customer ID</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Status</th>
                <th class="text-end">Change Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let acc of allAccounts">
                <td>
                  <span class="font-monospace fw-bold text-dark">{{ acc.accountNumber }}</span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">User #{{ acc.userId }}</span>
                </td>
                <td>
                  <span class="badge bg-secondary bg-opacity-25 text-dark">{{ acc.accountType }}</span>
                </td>
                <td>
                  <strong class="text-success">₹ {{ acc.accountBalance | number:'1.2-2' }}</strong>
                </td>
                <td>
                  <span class="badge" [ngClass]="acc.accountStatus === 'ACTIVE' ? 'badge-active' : 'badge-pending'">
                    {{ acc.accountStatus }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button
                      *ngIf="acc.accountStatus !== 'ACTIVE'"
                      (click)="updateAccountStatus(acc.accountNumber, 'ACTIVE')"
                      class="btn btn-outline-success"
                    >
                      Activate
                    </button>
                    <button
                      *ngIf="acc.accountStatus !== 'INACTIVE'"
                      (click)="updateAccountStatus(acc.accountNumber, 'INACTIVE')"
                      class="btn btn-outline-warning"
                    >
                      Freeze
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  activeTab: 'USERS' | 'ACCOUNTS' = 'USERS';
  users: User[] = [];
  allAccounts: Account[] = [];

  constructor(
    private authService: AuthService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
      }
    });

    this.accountService.getAllAccounts().subscribe({
      next: (res) => {
        this.allAccounts = res;
      }
    });
  }

  changeUserStatus(userId: number, status: 'APPROVED' | 'PENDING' | 'REJECTED'): void {
    this.authService.updateUserStatus(userId, status).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        alert(err.error?.message || 'Status update failed');
      }
    });
  }

  updateAccountStatus(accountNumber: string, status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'): void {
    this.accountService.updateStatus(accountNumber, status).subscribe({
      next: () => {
        this.loadData();
      },
      error: (err) => {
        alert(err.error?.message || 'Account status update failed');
      }
    });
  }
}