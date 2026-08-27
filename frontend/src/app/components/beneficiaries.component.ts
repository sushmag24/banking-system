import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BeneficiaryService } from '../services/beneficiary.service';
import { AccountService } from '../services/account.service';
import { Beneficiary, CreateBeneficiaryRequest } from '../models/beneficiary.model';
import { Account } from '../models/account.model';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 class="fw-bold text-dark mb-1">Beneficiary Management</h2>
          <p class="text-muted mb-0">Register and manage verified payees for fast fund transfers</p>
        </div>
        <button class="btn btn-primary-custom d-flex align-items-center gap-2 align-self-start align-self-md-auto"
                data-bs-toggle="modal" data-bs-target="#addBeneficiaryModal">
          <i class="bi bi-person-plus-fill"></i>
          <span>Add Beneficiary</span>
        </button>
      </div>

      <!-- Search and Filter Bar -->
      <div class="card card-custom p-3 mb-4">
        <div class="input-group">
          <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
          <input
            type="text"
            class="form-control border-0 bg-light"
            [(ngModel)]="searchTerm"
            placeholder="Search beneficiaries by name, account number or bank..."
          />
        </div>
      </div>

      <!-- Beneficiaries Grid / Table -->
      <div *ngIf="filteredBeneficiaries.length === 0 && !isLoading" class="card card-custom p-5 text-center text-muted">
        <i class="bi bi-people fs-1 d-block mb-3 text-secondary"></i>
        <h5>No Beneficiaries Added</h5>
        <p class="small text-muted mb-3">Add your friends, family or merchants to make rapid fund transfers.</p>
        <button class="btn btn-primary-custom mx-auto" data-bs-toggle="modal" data-bs-target="#addBeneficiaryModal">
          Add Payee Now
        </button>
      </div>

      <div class="row g-4" *ngIf="filteredBeneficiaries.length > 0">
        <div class="col-md-6 col-lg-4" *ngFor="let b of filteredBeneficiaries">
          <div class="card card-custom p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-3 rounded-circle bg-primary bg-opacity-10 text-primary fw-bold fs-5">
                    {{ b.beneficiaryName.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-dark">{{ b.beneficiaryName }}</h6>
                    <small class="text-muted">{{ b.bankName || 'Apex Bank' }}</small>
                  </div>
                </div>
                <button (click)="deleteBeneficiary(b.id)" class="btn btn-sm btn-outline-danger border-0 rounded-circle" title="Delete Beneficiary">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>

              <div class="p-3 bg-light rounded-3 mb-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Account Number:</span>
                  <span class="font-monospace fw-bold text-dark">{{ b.beneficiaryAccountNumber }}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>IFSC / Code:</span>
                  <span class="text-dark">{{ b.ifscCode || 'APEX0001001' }}</span>
                </div>
                <div class="d-flex justify-content-between small text-muted">
                  <span>Account Type:</span>
                  <span class="badge bg-secondary bg-opacity-25 text-dark">{{ b.accountType || 'SAVINGS' }}</span>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 pt-2 border-top">
              <button (click)="transferTo(b)" class="btn btn-primary-custom flex-grow-1 d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-send-fill"></i>
                <span>Transfer Money</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Beneficiary Modal -->
    <div class="modal fade" id="addBeneficiaryModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 card-custom p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Register New Beneficiary</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="errorMessage" class="alert alert-danger py-2 small mb-3">
              {{ errorMessage }}
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Source Account (Linked To)</label>
              <select [(ngModel)]="newBen.sourceAccountNumber" class="form-select">
                <option *ngFor="let acc of userAccounts" [value]="acc.accountNumber">
                  {{ acc.accountNumber }} ({{ acc.accountType }}) - ₹ {{ acc.accountBalance | number:'1.2-2' }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Beneficiary Full Name</label>
              <input type="text" [(ngModel)]="newBen.beneficiaryName" class="form-control" placeholder="e.g. Alice Smith" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Beneficiary Account Number</label>
              <input type="text" [(ngModel)]="newBen.beneficiaryAccountNumber" class="form-control font-monospace" placeholder="e.g. ACC1000001" />
              <small class="text-muted">Must not be your own account number.</small>
            </div>

            <div class="row g-2 mb-3">
              <div class="col-6">
                <label class="form-label fw-semibold small">Bank Name</label>
                <input type="text" [(ngModel)]="newBen.bankName" class="form-control" placeholder="Apex Global Bank" />
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold small">IFSC / Routing</label>
                <input type="text" [(ngModel)]="newBen.ifscCode" class="form-control font-monospace" placeholder="APEX0001001" />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Beneficiary Email (Optional)</label>
              <input type="email" [(ngModel)]="newBen.email" class="form-control" placeholder="alice@example.com" />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button (click)="submitBeneficiary()" [disabled]="isSubmitting || !newBen.beneficiaryName || !newBen.beneficiaryAccountNumber" class="btn btn-primary-custom">
              Save Beneficiary
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BeneficiariesComponent implements OnInit {
  private authService = inject(AuthService);
  private beneficiaryService = inject(BeneficiaryService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  user = this.authService.currentUser();
  beneficiaries: Beneficiary[] = [];
  userAccounts: Account[] = [];
  searchTerm = '';
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  newBen: CreateBeneficiaryRequest = {
    userId: 0,
    sourceAccountNumber: '',
    beneficiaryAccountNumber: '',
    beneficiaryName: '',
    bankName: 'Apex Global Bank',
    ifscCode: 'APEX0001001',
    accountType: 'SAVINGS',
    email: ''
  };

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.newBen.userId = this.user.userId;
      this.loadUserAccounts();
      this.loadBeneficiaries();
    }
  }

  get filteredBeneficiaries(): Beneficiary[] {
    if (!this.searchTerm) return this.beneficiaries;
    const term = this.searchTerm.toLowerCase();
    return this.beneficiaries.filter(b =>
      b.beneficiaryName.toLowerCase().includes(term) ||
      b.beneficiaryAccountNumber.toLowerCase().includes(term) ||
      (b.bankName && b.bankName.toLowerCase().includes(term))
    );
  }

  loadUserAccounts(): void {
    if (!this.user) return;
    this.accountService.getAccountsByUserId(this.user.userId).subscribe({
      next: (accs) => {
        this.userAccounts = accs;
        if (accs.length > 0 && !this.newBen.sourceAccountNumber) {
          this.newBen.sourceAccountNumber = accs[0].accountNumber;
        }
      },
      error: () => {
        this.accountService.getAccountByUserId(this.user!.userId).subscribe({
          next: (acc) => {
            this.userAccounts = [acc];
            this.newBen.sourceAccountNumber = acc.accountNumber;
          }
        });
      }
    });
  }

  loadBeneficiaries(): void {
    if (!this.user) return;
    this.isLoading = true;

    this.beneficiaryService.getBeneficiariesByUser(this.user.userId).subscribe({
      next: (list) => {
        this.isLoading = false;
        this.beneficiaries = list;
      },
      error: () => {
        this.isLoading = false;
        this.beneficiaries = [];
      }
    });
  }

  submitBeneficiary(): void {
    if (!this.user) return;
    this.errorMessage = '';

    if (this.newBen.sourceAccountNumber === this.newBen.beneficiaryAccountNumber) {
      this.errorMessage = 'Source account and beneficiary account cannot be identical.';
      return;
    }

    this.isSubmitting = true;
    this.newBen.userId = this.user.userId;

    this.beneficiaryService.addBeneficiary(this.newBen).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.loadBeneficiaries();
        const closeBtn = document.querySelector('#addBeneficiaryModal .btn-close') as HTMLElement;
        if (closeBtn) closeBtn.click();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to add beneficiary. Please verify details.';
      }
    });
  }

  deleteBeneficiary(id: number): void {
    if (!confirm('Are you sure you want to remove this beneficiary?')) return;
    if (!this.user) return;

    this.beneficiaryService.deleteBeneficiary(id, this.user.userId).subscribe({
      next: () => {
        this.loadBeneficiaries();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete beneficiary');
      }
    });
  }

  transferTo(b: Beneficiary): void {
    this.router.navigate(['/transfer'], {
      queryParams: {
        from: b.sourceAccountNumber,
        to: b.beneficiaryAccountNumber,
        name: b.beneficiaryName
      }
    });
  }
}