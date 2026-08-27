import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { Account } from '../models/account.model';
import { Transaction } from '../models/transaction.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 class="fw-bold text-dark mb-1">Transaction Statement</h2>
          <p class="text-muted mb-0">Complete history and filterable audit trail of all transactions</p>
        </div>
        <button (click)="exportCSV()" [disabled]="filteredTransactions.length === 0" class="btn btn-outline-custom d-flex align-items-center gap-2 align-self-start align-self-md-auto">
          <i class="bi bi-file-earmark-spreadsheet"></i>
          <span>Export to CSV</span>
        </button>
      </div>

      <!-- Filters Card -->
      <div class="card card-custom p-4 mb-4">
        <div class="row g-3 align-items-end">
          <!-- Account Selection -->
          <div class="col-md-3">
            <label class="form-label fw-semibold small text-secondary">Bank Account</label>
            <select [(ngModel)]="selectedAccount" (change)="onFilterChange()" class="form-select">
              <option *ngFor="let acc of userAccounts" [value]="acc.accountNumber">
                {{ acc.accountNumber }} ({{ acc.accountType }})
              </option>
            </select>
          </div>

          <!-- Start Date -->
          <div class="col-md-2 col-6">
            <label class="form-label fw-semibold small text-secondary">Start Date</label>
            <input type="date" [(ngModel)]="startDate" (change)="onFilterChange()" class="form-control" />
          </div>

          <!-- End Date -->
          <div class="col-md-2 col-6">
            <label class="form-label fw-semibold small text-secondary">End Date</label>
            <input type="date" [(ngModel)]="endDate" (change)="onFilterChange()" class="form-control" />
          </div>

          <!-- Type Filter -->
          <div class="col-md-2 col-6">
            <label class="form-label fw-semibold small text-secondary">Type</label>
            <select [(ngModel)]="selectedType" (change)="onFilterChange()" class="form-select">
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">DEPOSIT</option>
              <option value="WITHDRAWAL">WITHDRAWAL</option>
              <option value="INTERNAL_TRANSFER">INTERNAL_TRANSFER</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="col-md-2 col-6">
            <label class="form-label fw-semibold small text-secondary">Status</label>
            <select [(ngModel)]="selectedStatus" (change)="onFilterChange()" class="form-select">
              <option value="ALL">All Status</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <!-- Reset Filter Button -->
          <div class="col-md-1 col-12">
            <button (click)="resetFilters()" class="btn btn-light w-100" title="Reset Filters">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="mt-3 pt-3 border-top">
          <div class="input-group">
            <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
            <input
              type="text"
              class="form-control border-0 bg-light"
              [(ngModel)]="searchKeyword"
              placeholder="Search by Reference ID, comments or description..."
            />
          </div>
        </div>
      </div>

      <!-- Transactions Table Card -->
      <div class="card card-custom p-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="fw-bold text-dark">
            Showing {{ filteredTransactions.length }} of {{ transactions.length }} Transactions
          </span>
        </div>

        <div *ngIf="filteredTransactions.length === 0 && !isLoading" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
          <h5>No Transactions Found</h5>
          <p class="small text-muted">No records match your selected filters.</p>
        </div>

        <div *ngIf="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="small text-muted mt-2">Loading transactions...</p>
        </div>

        <div *ngIf="filteredTransactions.length > 0 && !isLoading" class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Description / Notes</th>
                <th>Status</th>
                <th class="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let txn of filteredTransactions">
                <td>
                  <span class="font-monospace fw-semibold text-primary">{{ txn.referenceId }}</span>
                </td>
                <td>
                  <small class="text-secondary">{{ txn.localDateTime | date:'medium' }}</small>
                </td>
                <td>
                  <span class="badge" [ngClass]="txn.amount >= 0 ? 'badge-credit' : 'badge-debit'">
                    {{ txn.transactionType }}
                  </span>
                </td>
                <td>
                  <span class="text-dark small">{{ txn.comments || 'Direct Transaction' }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="txn.transactionStatus === 'COMPLETED' ? 'badge-active' : 'badge-pending'">
                    {{ txn.transactionStatus }}
                  </span>
                </td>
                <td class="text-end fw-bold fs-6" [ngClass]="txn.amount >= 0 ? 'text-success' : 'text-danger'">
                  {{ txn.amount >= 0 ? '+' : '' }} ₹ {{ txn.amount | number:'1.2-2' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent implements OnInit {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  user = this.authService.currentUser();
  userAccounts: Account[] = [];
  selectedAccount = '';
  transactions: Transaction[] = [];

  startDate = '';
  endDate = '';
  selectedType = 'ALL';
  selectedStatus = 'ALL';
  searchKeyword = '';

  isLoading = true;

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    this.loadAccounts();
  }

  get filteredTransactions(): Transaction[] {
    if (!this.searchKeyword) return this.transactions;
    const term = this.searchKeyword.toLowerCase();
    return this.transactions.filter(t =>
      t.referenceId.toLowerCase().includes(term) ||
      (t.comments && t.comments.toLowerCase().includes(term)) ||
      t.transactionType.toLowerCase().includes(term)
    );
  }

  loadAccounts(): void {
    if (!this.user) return;
    this.accountService.getAccountsByUserId(this.user.userId).subscribe({
      next: (accs) => {
        this.userAccounts = accs;
        if (accs.length > 0) {
          this.selectedAccount = accs[0].accountNumber;
          this.loadTransactions();
        }
      },
      error: () => {
        this.accountService.getAccountByUserId(this.user!.userId).subscribe({
          next: (acc) => {
            this.userAccounts = [acc];
            this.selectedAccount = acc.accountNumber;
            this.loadTransactions();
          }
        });
      }
    });
  }

  loadTransactions(): void {
    if (!this.selectedAccount) return;
    this.isLoading = true;

    this.transactionService.filterTransactions(
      this.selectedAccount,
      this.startDate,
      this.endDate,
      this.selectedType,
      this.selectedStatus
    ).subscribe({
      next: (txns) => {
        this.isLoading = false;
        this.transactions = txns;
      },
      error: () => {
        this.isLoading = false;
        this.transactions = [];
      }
    });
  }

  onFilterChange(): void {
    this.loadTransactions();
  }

  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.selectedType = 'ALL';
    this.selectedStatus = 'ALL';
    this.searchKeyword = '';
    this.loadTransactions();
  }

  exportCSV(): void {
    if (this.transactions.length === 0) return;
    const headers = ['Reference ID', 'Date Time', 'Type', 'Amount', 'Status', 'Description'];
    const rows = this.transactions.map(t => [
      t.referenceId,
      t.localDateTime || '',
      t.transactionType,
      t.amount,
      t.transactionStatus,
      `"${(t.comments || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statement_${this.selectedAccount}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}