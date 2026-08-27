import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TransferService } from '../services/transfer.service';
import { AccountService } from '../services/account.service';
import { BeneficiaryService } from '../services/beneficiary.service';
import { Account } from '../models/account.model';
import { Beneficiary } from '../models/beneficiary.model';
import { FundTransferRequest, FundTransferResponse } from '../models/transfer.model';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 class="fw-bold text-dark mb-1">Fund Transfer</h2>
              <p class="text-muted mb-0">Instant & secure electronic fund transfers</p>
            </div>
            <a routerLink="/beneficiaries" class="btn btn-outline-custom d-flex align-items-center gap-1">
              <i class="bi bi-people"></i>
              <span>Manage Payees</span>
            </a>
          </div>

          <!-- Transfer Receipt View (When Success) -->
          <div *ngIf="successResponse" class="card card-custom p-4 p-md-5 text-center mb-4 border-top border-4 border-success animate-fadeIn">
            <div class="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3">
              <i class="bi bi-check-circle-fill fs-1"></i>
            </div>
            <h3 class="fw-bold text-dark mb-1">Transfer Completed!</h3>
            <p class="text-muted small mb-4">{{ successResponse.message }}</p>

            <div class="p-4 bg-light rounded-4 mb-4 text-start font-monospace">
              <div class="d-flex justify-content-between border-bottom py-2">
                <span class="text-muted font-sans">Transaction Reference:</span>
                <strong class="text-primary">{{ successResponse.transactionId }}</strong>
              </div>
              <div class="d-flex justify-content-between border-bottom py-2">
                <span class="text-muted font-sans">Transferred Amount:</span>
                <strong class="text-success fs-5">₹ {{ request.amount | number:'1.2-2' }}</strong>
              </div>
              <div class="d-flex justify-content-between border-bottom py-2">
                <span class="text-muted font-sans">From Account:</span>
                <span>{{ request.fromAccount }}</span>
              </div>
              <div class="d-flex justify-content-between border-bottom py-2">
                <span class="text-muted font-sans">To Account:</span>
                <span>{{ request.toAccount }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span class="text-muted font-sans">Timestamp:</span>
                <span>{{ receiptDate | date:'medium' }}</span>
              </div>
            </div>

            <div class="d-flex justify-content-center gap-3">
              <button (click)="printReceipt()" class="btn btn-outline-custom d-flex align-items-center gap-2">
                <i class="bi bi-printer"></i> Print Receipt
              </button>
              <button (click)="resetForm()" class="btn btn-primary-custom d-flex align-items-center gap-2">
                <i class="bi bi-arrow-repeat"></i> Another Transfer
              </button>
            </div>
          </div>

          <!-- Transfer Form View -->
          <div *ngIf="!successResponse" class="card card-custom p-4 p-md-5">
            <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <div>{{ errorMessage }}</div>
              <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
            </div>

            <form (ngSubmit)="openConfirmation()" #transferForm="ngForm">
              <!-- Source Account Selection -->
              <div class="mb-4">
                <label class="form-label fw-semibold small text-secondary">1. Source Bank Account</label>
                <select
                  [(ngModel)]="request.fromAccount"
                  name="fromAccount"
                  (change)="onSourceAccountChange()"
                  class="form-select form-select-lg"
                  required
                >
                  <option value="" disabled selected>-- Select source account --</option>
                  <option *ngFor="let acc of userAccounts" [value]="acc.accountNumber">
                    {{ acc.accountNumber }} ({{ acc.accountType }}) - Available Balance: ₹ {{ acc.accountBalance | number:'1.2-2' }}
                  </option>
                </select>
                <div *ngIf="selectedSourceAccount" class="mt-2 small text-muted">
                  Current Balance: <strong class="text-success">₹ {{ selectedSourceAccount.accountBalance | number:'1.2-2' }}</strong>
                </div>
              </div>

              <!-- Destination Mode Toggle -->
              <div class="mb-3">
                <label class="form-label fw-semibold small text-secondary">2. Transfer To</label>
                <div class="btn-group w-100 mb-3" role="group">
                  <button
                    type="button"
                    class="btn py-2"
                    [ngClass]="destinationMode === 'BENEFICIARY' ? 'btn-primary-custom' : 'btn-outline-custom'"
                    (click)="destinationMode = 'BENEFICIARY'"
                  >
                    <i class="bi bi-person-check me-1"></i> Saved Beneficiary
                  </button>
                  <button
                    type="button"
                    class="btn py-2"
                    [ngClass]="destinationMode === 'DIRECT' ? 'btn-primary-custom' : 'btn-outline-custom'"
                    (click)="destinationMode = 'DIRECT'"
                  >
                    <i class="bi bi-input-cursor-text me-1"></i> Enter Account Number
                  </button>
                </div>

                <!-- Saved Beneficiary Dropdown -->
                <div *ngIf="destinationMode === 'BENEFICIARY'">
                  <div *ngIf="beneficiaries.length === 0" class="p-3 bg-light rounded-3 text-muted small d-flex justify-content-between align-items-center">
                    <span>No saved beneficiaries found.</span>
                    <a routerLink="/beneficiaries" class="btn btn-sm btn-link text-primary p-0">Add Payee</a>
                  </div>
                  <select
                    *ngIf="beneficiaries.length > 0"
                    [(ngModel)]="selectedBeneficiaryId"
                    name="beneficiarySelect"
                    (change)="onBeneficiarySelect()"
                    class="form-select form-select-lg"
                  >
                    <option value="" disabled selected>-- Select a registered beneficiary --</option>
                    <option *ngFor="let b of beneficiaries" [value]="b.id">
                      {{ b.beneficiaryName }} ({{ b.beneficiaryAccountNumber }}) - {{ b.bankName || 'Apex Bank' }}
                    </option>
                  </select>
                </div>

                <!-- Direct Account Input -->
                <div *ngIf="destinationMode === 'DIRECT'" class="row g-3">
                  <div class="col-md-12">
                    <input
                      type="text"
                      class="form-control form-control-lg font-monospace"
                      [(ngModel)]="request.toAccount"
                      name="toAccount"
                      required
                      placeholder="Destination Account Number (e.g. ACC1000002)"
                    />
                  </div>
                </div>
              </div>

              <!-- Amount Input with Quick Chips -->
              <div class="mb-4">
                <label class="form-label fw-semibold small text-secondary">3. Amount to Transfer (₹)</label>
                <div class="input-group input-group-lg">
                  <span class="input-group-text bg-light fw-bold text-secondary">₹</span>
                  <input
                    type="number"
                    class="form-control fs-4 fw-bold text-dark"
                    [(ngModel)]="request.amount"
                    name="amount"
                    min="1"
                    required
                    placeholder="0.00"
                  />
                </div>

                <div class="d-flex flex-wrap gap-2 mt-2">
                  <button type="button" (click)="setQuickAmount(500)" class="btn btn-sm btn-outline-secondary">₹ 500</button>
                  <button type="button" (click)="setQuickAmount(1000)" class="btn btn-sm btn-outline-secondary">₹ 1,000</button>
                  <button type="button" (click)="setQuickAmount(2500)" class="btn btn-sm btn-outline-secondary">₹ 2,500</button>
                  <button type="button" (click)="setQuickAmount(5000)" class="btn btn-sm btn-outline-secondary">₹ 5,000</button>
                  <button type="button" (click)="setQuickAmount(10000)" class="btn btn-sm btn-outline-secondary">₹ 10,000</button>
                </div>

                <div *ngIf="selectedSourceAccount && request.amount > selectedSourceAccount.accountBalance" class="text-danger small mt-2">
                  <i class="bi bi-exclamation-circle-fill me-1"></i> Transfer amount exceeds available balance.
                </div>
              </div>

              <!-- Submit / Review Button -->
              <button
                type="button"
                (click)="openConfirmation()"
                class="btn btn-primary-custom w-100 py-3 fs-5"
                [disabled]="!isFormValid() || isLoading"
                data-bs-toggle="modal"
                data-bs-target="#confirmModal"
              >
                <i class="bi bi-send-check me-2"></i> Review & Confirm Transfer
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div class="modal fade" id="confirmModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 card-custom p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Confirm Fund Transfer</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body py-4">
            <div class="text-center mb-4">
              <div class="small text-muted">Total Transfer Amount</div>
              <h2 class="fw-bolder text-primary mb-0">₹ {{ request.amount | number:'1.2-2' }}</h2>
            </div>

            <div class="p-3 bg-light rounded-3 font-monospace small">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Debit Account:</span>
                <strong class="text-dark">{{ request.fromAccount }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Credit Account:</span>
                <strong class="text-dark">{{ request.toAccount }}</strong>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Transfer Type:</span>
                <strong class="text-dark">Instant Internal Transfer</strong>
              </div>
              <div class="d-flex justify-content-between pt-2 border-top" *ngIf="selectedSourceAccount">
                <span class="text-muted">Remaining Balance:</span>
                <strong class="text-success">₹ {{ (selectedSourceAccount.accountBalance - request.amount) | number:'1.2-2' }}</strong>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button (click)="executeTransfer()" [disabled]="isLoading" class="btn btn-primary-custom" data-bs-dismiss="modal">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              <span>{{ isLoading ? 'Processing...' : 'Authorize Transfer' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TransferComponent implements OnInit {
  private authService = inject(AuthService);
  private transferService = inject(TransferService);
  private accountService = inject(AccountService);
  private beneficiaryService = inject(BeneficiaryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user = this.authService.currentUser();
  userAccounts: Account[] = [];
  beneficiaries: Beneficiary[] = [];
  selectedSourceAccount: Account | null = null;

  destinationMode: 'BENEFICIARY' | 'DIRECT' = 'BENEFICIARY';
  selectedBeneficiaryId: string | number = '';

  request: FundTransferRequest = {
    fromAccount: '',
    toAccount: '',
    amount: 1000
  };

  isLoading = false;
  errorMessage = '';
  successResponse: FundTransferResponse | null = null;
  receiptDate = new Date();

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    if (this.user) {
      this.loadUserAccounts();
      this.loadBeneficiaries();
    }
  }

  loadUserAccounts(): void {
    if (!this.user) return;
    this.accountService.getAccountsByUserId(this.user.userId).subscribe({
      next: (accs) => {
        this.userAccounts = accs;
        this.applyQueryParams();
      },
      error: () => {
        this.accountService.getAccountByUserId(this.user!.userId).subscribe({
          next: (acc) => {
            this.userAccounts = [acc];
            this.applyQueryParams();
          }
        });
      }
    });
  }

  loadBeneficiaries(): void {
    if (!this.user) return;
    this.beneficiaryService.getBeneficiariesByUser(this.user.userId).subscribe({
      next: (list) => {
        this.beneficiaries = list;
        this.applyQueryParams();
      }
    });
  }

  applyQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['from']) {
        this.request.fromAccount = params['from'];
        this.onSourceAccountChange();
      } else if (this.userAccounts.length > 0 && !this.request.fromAccount) {
        this.request.fromAccount = this.userAccounts[0].accountNumber;
        this.onSourceAccountChange();
      }

      if (params['to']) {
        this.request.toAccount = params['to'];
        this.destinationMode = 'DIRECT';
        const matchingBen = this.beneficiaries.find(b => b.beneficiaryAccountNumber === params['to']);
        if (matchingBen) {
          this.destinationMode = 'BENEFICIARY';
          this.selectedBeneficiaryId = matchingBen.id;
        }
      }
    });
  }

  onSourceAccountChange(): void {
    this.selectedSourceAccount = this.userAccounts.find(a => a.accountNumber === this.request.fromAccount) || null;
  }

  onBeneficiarySelect(): void {
    const ben = this.beneficiaries.find(b => b.id.toString() === this.selectedBeneficiaryId.toString());
    if (ben) {
      this.request.toAccount = ben.beneficiaryAccountNumber;
    }
  }

  setQuickAmount(val: number): void {
    this.request.amount = val;
  }

  isFormValid(): boolean {
    return (
      !!this.request.fromAccount &&
      !!this.request.toAccount &&
      this.request.amount > 0 &&
      this.request.fromAccount !== this.request.toAccount &&
      (!this.selectedSourceAccount || this.request.amount <= this.selectedSourceAccount.accountBalance)
    );
  }

  openConfirmation(): void {
    this.errorMessage = '';
    if (this.request.fromAccount === this.request.toAccount) {
      this.errorMessage = 'Source account and destination account cannot be identical.';
    }
  }

  executeTransfer(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.transferService.fundTransfer(this.request).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successResponse = res;
        this.receiptDate = new Date();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Transfer failed. Please check balance and account details.';
      }
    });
  }

  resetForm(): void {
    this.successResponse = null;
    this.request = {
      fromAccount: this.userAccounts.length > 0 ? this.userAccounts[0].accountNumber : '',
      toAccount: '',
      amount: 1000
    };
    this.loadUserAccounts();
  }

  printReceipt(): void {
    window.print();
  }
}