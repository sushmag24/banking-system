import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { Account } from '../models/account.model';
import { Transaction, TransactionSummary } from '../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <!-- Greeting & Top Banner -->
      <div class="row align-items-center mb-4">
        <div class="col-md-8">
          <h2 class="fw-bold text-dark mb-1">
            Welcome, {{ user?.firstName }} {{ user?.lastName }}! 👋
          </h2>
          <p class="text-muted mb-0">Here is your account activity and financial overview.</p>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
          <span class="badge badge-active fs-6 px-3 py-2">
            <i class="bi bi-shield-check me-1"></i> {{ user?.role }}
          </span>
        </div>
      </div>

      <!-- No Account Alert -->
      <div *ngIf="!primaryAccount && !isLoadingAccount" class="card card-custom p-4 mb-4 border-warning bg-warning bg-opacity-10">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 class="fw-bold text-dark mb-1"><i class="bi bi-info-circle-fill text-warning me-2"></i>No Active Bank Account Found</h5>
            <p class="text-muted mb-0 small">Create your first savings account with instant activation to start transferring money.</p>
          </div>
          <button (click)="openCreateAccountModal()" class="btn btn-primary-custom" data-bs-toggle="modal" data-bs-target="#createAccountModal">
            <i class="bi bi-plus-circle me-1"></i> Open Bank Account
          </button>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div *ngIf="primaryAccount" class="row g-4 mb-4">
        <!-- Hero Account Card -->
        <div class="col-lg-6">
          <div class="bank-card h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1 text-uppercase letter-spacing">
                  {{ primaryAccount.accountType }}
                </span>
                <span class="badge" [ngClass]="primaryAccount.accountStatus === 'ACTIVE' ? 'bg-success' : 'bg-warning'">
                  {{ primaryAccount.accountStatus }}
                </span>
              </div>
              <div class="small text-white-50 mb-1">Available Balance</div>
              <h1 class="fw-bolder text-white mb-3">
                ₹ {{ primaryAccount.accountBalance | number:'1.2-2' }}
              </h1>
            </div>

            <div>
              <div class="d-flex justify-content-between align-items-end">
                <div>
                  <div class="small text-white-50">Account Number</div>
                  <div class="fw-bold text-white fs-5 font-monospace tracking-wide">
                    {{ primaryAccount.accountNumber }}
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button (click)="copyAccountNumber(primaryAccount.accountNumber)" class="btn btn-sm btn-light bg-opacity-25 text-white border-0" title="Copy Account Number">
                    <i class="bi bi-clipboard"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-dark fw-semibold" data-bs-toggle="modal" data-bs-target="#quickActionModal">
                    <i class="bi bi-arrow-down-up me-1"></i> Deposit / Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Metrics & Stats -->
        <div class="col-lg-6">
          <div class="row g-3 h-100">
            <!-- Total Credited -->
            <div class="col-sm-6">
              <div class="card card-custom p-3 h-100 d-flex justify-content-between">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="text-muted small fw-semibold">Total Credited</span>
                  <div class="p-2 rounded-circle bg-success bg-opacity-10 text-success">
                    <i class="bi bi-arrow-down-left fs-5"></i>
                  </div>
                </div>
                <div>
                  <h4 class="fw-bold text-success mb-1">
                    + ₹ {{ (summary?.totalCredited || 0) | number:'1.2-2' }}
                  </h4>
                  <small class="text-muted">Inflow to this account</small>
                </div>
              </div>
            </div>

            <!-- Total Debited -->
            <div class="col-sm-6">
              <div class="card card-custom p-3 h-100 d-flex justify-content-between">
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <span class="text-muted small fw-semibold">Total Debited</span>
                  <div class="p-2 rounded-circle bg-danger bg-opacity-10 text-danger">
                    <i class="bi bi-arrow-up-right fs-5"></i>
                  </div>
                </div>
                <div>
                  <h4 class="fw-bold text-danger mb-1">
                    - ₹ {{ (summary?.totalDebited || 0) | number:'1.2-2' }}
                  </h4>
                  <small class="text-muted">Outflow / Transfers</small>
                </div>
              </div>
            </div>

            <!-- Total Transactions -->
            <div class="col-12">
              <div class="card card-custom p-3 d-flex flex-row align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-3">
                  <div class="p-3 rounded-3 bg-primary bg-opacity-10 text-primary">
                    <i class="bi bi-receipt fs-4"></i>
                  </div>
                  <div>
                    <h5 class="fw-bold mb-0">{{ summary?.totalTransactions || 0 }}</h5>
                    <small class="text-muted">Total Recorded Transactions</small>
                  </div>
                </div>
                <a routerLink="/transactions" class="btn btn-sm btn-outline-custom">
                  View Statement <i class="bi bi-chevron-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons Bar -->
      <div *ngIf="primaryAccount" class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <a routerLink="/transfer" class="card card-custom p-3 text-center text-decoration-none text-dark hover-action">
            <div class="p-3 rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-2" style="width: fit-content;">
              <i class="bi bi-send-fill fs-4"></i>
            </div>
            <div class="fw-bold small">Fund Transfer</div>
            <small class="text-muted">Send money instantly</small>
          </a>
        </div>
        <div class="col-6 col-md-3">
          <a routerLink="/beneficiaries" class="card card-custom p-3 text-center text-decoration-none text-dark hover-action">
            <div class="p-3 rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-2" style="width: fit-content;">
              <i class="bi bi-person-plus-fill fs-4"></i>
            </div>
            <div class="fw-bold small">Beneficiaries</div>
            <small class="text-muted">Manage payees</small>
          </a>
        </div>
        <div class="col-6 col-md-3">
          <a routerLink="/accounts" class="card card-custom p-3 text-center text-decoration-none text-dark hover-action">
            <div class="p-3 rounded-circle bg-info bg-opacity-10 text-info mx-auto mb-2" style="width: fit-content;">
              <i class="bi bi-credit-card-2-front-fill fs-4"></i>
            </div>
            <div class="fw-bold small">My Accounts</div>
            <small class="text-muted">View all accounts</small>
          </a>
        </div>
        <div class="col-6 col-md-3">
          <a routerLink="/transactions" class="card card-custom p-3 text-center text-decoration-none text-dark hover-action">
            <div class="p-3 rounded-circle bg-warning bg-opacity-10 text-warning mx-auto mb-2" style="width: fit-content;">
              <i class="bi bi-file-earmark-text-fill fs-4"></i>
            </div>
            <div class="fw-bold small">Statement</div>
            <small class="text-muted">Filter & export history</small>
          </a>
        </div>
      </div>

      <!-- Monthly Breakdown & Recent Transactions -->
      <div *ngIf="primaryAccount" class="row g-4">
        <!-- Recent Transactions -->
        <div class="col-lg-8">
          <div class="card card-custom p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0">Recent Transactions</h5>
              <a routerLink="/transactions" class="text-primary text-decoration-none small fw-semibold">
                See All <i class="bi bi-arrow-right"></i>
              </a>
            </div>

            <div *ngIf="recentTransactions.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-inbox fs-2 d-block mb-2"></i>
              No transactions recorded yet. Make a deposit or transfer to get started.
            </div>

            <div *ngIf="recentTransactions.length > 0" class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr>
                    <th>Type / Ref</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let txn of recentTransactions">
                    <td>
                      <div class="fw-semibold text-dark">{{ txn.transactionType }}</div>
                      <small class="text-muted font-monospace">{{ txn.referenceId }}</small>
                    </td>
                    <td>
                      <small class="text-secondary">{{ txn.localDateTime | date:'medium' }}</small>
                      <div *ngIf="txn.comments" class="small text-muted text-truncate" style="max-width: 180px;">
                        {{ txn.comments }}
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="txn.transactionStatus === 'COMPLETED' ? 'badge-active' : 'badge-pending'">
                        {{ txn.transactionStatus }}
                      </span>
                    </td>
                    <td class="text-end fw-bold" [ngClass]="txn.amount >= 0 ? 'text-success' : 'text-danger'">
                      {{ txn.amount >= 0 ? '+' : '' }} ₹ {{ txn.amount | number:'1.2-2' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Monthly Summary Breakdown -->
        <div class="col-lg-4">
          <div class="card card-custom p-4 h-100">
            <h5 class="fw-bold mb-3">Monthly Activity</h5>

            <div *ngIf="!summary?.monthlySummary || summary?.monthlySummary?.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-calendar-x fs-2 d-block mb-2"></i>
              No monthly activity recorded.
            </div>

            <div *ngIf="summary?.monthlySummary && summary?.monthlySummary?.length! > 0" class="d-flex flex-column gap-3">
              <div *ngFor="let m of summary?.monthlySummary" class="border rounded-3 p-3 bg-light bg-opacity-50">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold text-dark">{{ m.month }}</span>
                  <span class="badge bg-secondary rounded-pill small">{{ m.count }} txns</span>
                </div>
                <div class="d-flex justify-content-between small mb-1">
                  <span class="text-muted">Total In:</span>
                  <span class="text-success fw-semibold">+ ₹ {{ m.totalCredit | number:'1.2-2' }}</span>
                </div>
                <div class="d-flex justify-content-between small">
                  <span class="text-muted">Total Out:</span>
                  <span class="text-danger fw-semibold">- ₹ {{ m.totalDebit | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Account Modal -->
    <div class="modal fade" id="createAccountModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 card-custom p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Open New Bank Account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold small">Account Type</label>
              <select [(ngModel)]="newAccountType" class="form-select">
                <option value="SAVINGS">SAVINGS Account</option>
                <option value="CURRENT">CURRENT Account</option>
                <option value="FIXED_DEPOSIT">FIXED DEPOSIT Account</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold small">Initial Deposit Amount (₹)</label>
              <input type="number" [(ngModel)]="initialDeposit" min="0" class="form-control" placeholder="1000.00" />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button (click)="createAccount()" [disabled]="isSubmitting" class="btn btn-primary-custom" data-bs-dismiss="modal">
              Confirm & Open Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Deposit / Withdraw Modal -->
    <div class="modal fade" id="quickActionModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 card-custom p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Instant Deposit / Withdraw</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="btn-group w-100 mb-3" role="group">
              <button
                type="button"
                class="btn py-2"
                [ngClass]="quickTxnType === 'DEPOSIT' ? 'btn-success fw-bold' : 'btn-outline-secondary'"
                (click)="quickTxnType = 'DEPOSIT'"
              >
                <i class="bi bi-arrow-down-circle me-1"></i> Deposit Funds
              </button>
              <button
                type="button"
                class="btn py-2"
                [ngClass]="quickTxnType === 'WITHDRAWAL' ? 'btn-danger fw-bold' : 'btn-outline-secondary'"
                (click)="quickTxnType = 'WITHDRAWAL'"
              >
                <i class="bi bi-arrow-up-circle me-1"></i> Withdraw Funds
              </button>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Amount (₹)</label>
              <input type="number" [(ngModel)]="quickAmount" min="1" class="form-control fs-5" placeholder="1000.00" />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold small">Description / Remark</label>
              <input type="text" [(ngModel)]="quickRemarks" class="form-control" placeholder="Self Deposit / ATM Withdrawal" />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button
              (click)="executeQuickTransaction()"
              [disabled]="isSubmitting || quickAmount <= 0"
              class="btn"
              [ngClass]="quickTxnType === 'DEPOSIT' ? 'btn-success' : 'btn-danger'"
              data-bs-dismiss="modal"
            >
              Confirm {{ quickTxnType }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  user = this.authService.currentUser();
  primaryAccount: Account | null = null;
  summary: TransactionSummary | null = null;
  recentTransactions: Transaction[] = [];
  isLoadingAccount = true;
  isSubmitting = false;

  newAccountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT' = 'SAVINGS';
  initialDeposit = 1000;

  quickTxnType: 'DEPOSIT' | 'WITHDRAWAL' = 'DEPOSIT';
  quickAmount = 1000;
  quickRemarks = 'Self Deposit';

  ngOnInit(): void {
    this.loadAccountData();
  }

  loadAccountData(): void {
    this.user = this.authService.currentUser();
    if (!this.user) return;
    this.isLoadingAccount = true;

    this.accountService.getAccountsByUserId(this.user.userId).subscribe({
      next: (accounts) => {
        this.isLoadingAccount = false;
        if (accounts && accounts.length > 0) {
          this.primaryAccount = accounts[0];
          this.loadSummary(this.primaryAccount.accountNumber);
        } else {
          this.accountService.getAccountByUserId(this.user!.userId).subscribe({
            next: (acc) => {
              this.primaryAccount = acc;
              this.loadSummary(acc.accountNumber);
            },
            error: () => {
              this.primaryAccount = null;
            }
          });
        }
      },
      error: () => {
        this.accountService.getAccountByUserId(this.user!.userId).subscribe({
          next: (acc) => {
            this.isLoadingAccount = false;
            this.primaryAccount = acc;
            this.loadSummary(acc.accountNumber);
          },
          error: () => {
            this.isLoadingAccount = false;
            this.primaryAccount = null;
          }
        });
      }
    });
  }

  loadSummary(accountNumber: string): void {
    this.transactionService.getAccountSummary(accountNumber).subscribe({
      next: (sum) => {
        this.summary = sum;
        this.recentTransactions = sum.recentTransactions || [];
      },
      error: () => {
        this.transactionService.getTransactions(accountNumber).subscribe({
          next: (txns) => {
            this.recentTransactions = txns.slice(0, 5);
          }
        });
      }
    });
  }

  createAccount(): void {
    if (!this.user) return;
    this.isSubmitting = true;

    this.accountService.createAccount({
      userId: this.user.userId,
      accountType: this.newAccountType,
      accountBalance: this.initialDeposit,
      accountStatus: 'ACTIVE'
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.loadAccountData();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Account creation failed');
      }
    });
  }

  executeQuickTransaction(): void {
    if (!this.primaryAccount || this.quickAmount <= 0) return;
    this.isSubmitting = true;

    this.transactionService.addTransaction({
      accountId: this.primaryAccount.accountNumber,
      transactionType: this.quickTxnType,
      amount: this.quickAmount,
      description: this.quickRemarks || this.quickTxnType
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.loadAccountData();
      },
      error: (err) => {
        this.isSubmitting = false;
        alert(err.error?.message || 'Transaction failed');
      }
    });
  }

  openCreateAccountModal(): void {}

  copyAccountNumber(num: string): void {
    navigator.clipboard.writeText(num);
    alert('Account Number copied to clipboard: ' + num);
  }
}