import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { Account } from '../models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="fw-bold text-dark mb-1">My Bank Accounts</h2>
          <p class="text-muted mb-0">Manage all your deposit and savings accounts</p>
        </div>
        <button class="btn btn-primary-custom d-flex align-items-center gap-2" data-bs-toggle="modal" data-bs-target="#newAccountModal">
          <i class="bi bi-plus-lg"></i>
          <span>Open Account</span>
        </button>
      </div>

      <div *ngIf="accounts.length === 0 && !isLoading" class="card card-custom p-5 text-center text-muted">
        <i class="bi bi-wallet2 fs-1 d-block mb-3 text-secondary"></i>
        <h4>No Accounts Found</h4>
        <p class="small text-muted mb-3">Open your first bank account to begin depositing and transferring funds.</p>
        <button class="btn btn-primary-custom mx-auto" data-bs-toggle="modal" data-bs-target="#newAccountModal">
          Open an Account
        </button>
      </div>

      <div class="row g-4" *ngIf="accounts.length > 0">
        <div class="col-md-6 col-lg-4" *ngFor="let acc of accounts">
          <div class="card card-custom p-4 h-100 d-flex flex-column justify-content-between border-top border-4"
               [ngClass]="acc.accountStatus === 'ACTIVE' ? 'border-primary' : 'border-warning'">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-light text-dark fw-bold border">{{ acc.accountType }}</span>
                <span class="badge" [ngClass]="acc.accountStatus === 'ACTIVE' ? 'badge-active' : 'badge-pending'">
                  {{ acc.accountStatus }}
                </span>
              </div>

              <div class="small text-muted mb-1">Available Balance</div>
              <h3 class="fw-bold text-dark mb-3">
                ₹ {{ acc.accountBalance | number:'1.2-2' }}
              </h3>

              <div class="p-3 bg-light rounded-3 mb-3">
                <div class="small text-muted">Account Number</div>
                <div class="fw-bold font-monospace text-dark fs-6 d-flex justify-content-between align-items-center">
                  <span>{{ acc.accountNumber }}</span>
                  <button (click)="copyNumber(acc.accountNumber)" class="btn btn-sm btn-link text-secondary p-0" title="Copy">
                    <i class="bi bi-clipboard"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="d-flex flex-column gap-2 pt-2 border-top">
              <div class="d-flex gap-2">
                <button (click)="prepareTxn(acc, 'DEPOSIT')" class="btn btn-sm btn-outline-success flex-grow-1" data-bs-toggle="modal" data-bs-target="#actionModal">
                  <i class="bi bi-arrow-down-circle me-1"></i> Deposit
                </button>
                <button (click)="prepareTxn(acc, 'WITHDRAWAL')" class="btn btn-sm btn-outline-danger flex-grow-1" data-bs-toggle="modal" data-bs-target="#actionModal">
                  <i class="bi bi-arrow-up-circle me-1"></i> Withdraw
                </button>
              </div>
              <a [routerLink]="['/transfer']" [queryParams]="{ from: acc.accountNumber }" class="btn btn-sm btn-outline-primary w-100">
                <i class="bi bi-send me-1"></i> Send From This Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Account Modal -->
    <div class="modal fade" id="newAccountModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 card-custom p-3">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Open a New Bank Account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold small">Select Account Type</label>
              <select [(ngModel)]="newAccountType" class="form-select">
                <option value="SAVINGS">SAVINGS Account (Standard Interest)</option>
                <option value="CURRENT">CURRENT Account (High Limit Business)</option>
                <option value="FIXED_DEPOSIT">FIXED DEPOSIT Account (Term Deposit)</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold small">Initial Funding Amount (₹)</label>
              <input type="number" [(ngModel)]="initialDeposit" min="0" class="form-control" placeholder="1000.00" />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button (click)="createAccount()" class="btn btn-primary-custom" data-bs-dismiss="modal">
              Open Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposit/Withdraw Modal -->
    <div class="modal fade" id="actionModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 card-custom p-3" *ngIf="selectedAcc">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ selectedTxnType }} Funds</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="small text-muted">
              Account: <strong class="font-monospace text-dark">{{ selectedAcc.accountNumber }}</strong>
              (Current Balance: ₹ {{ selectedAcc.accountBalance | number:'1.2-2' }})
            </p>
            <div class="mb-3">
              <label class="form-label fw-semibold small">Amount (₹)</label>
              <input type="number" [(ngModel)]="amount" min="1" class="form-control fs-5" placeholder="1000.00" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold small">Notes</label>
              <input type="text" [(ngModel)]="remarks" class="form-control" placeholder="Self Funding / Cash" />
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
            <button (click)="submitTransaction()" [disabled]="amount <= 0" class="btn"
                    [ngClass]="selectedTxnType === 'DEPOSIT' ? 'btn-success' : 'btn-danger'" data-bs-dismiss="modal">
              Execute {{ selectedTxnType }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccountsComponent implements OnInit {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  user = this.authService.currentUser();
  accounts: Account[] = [];
  isLoading = true;

  newAccountType: 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT' = 'SAVINGS';
  initialDeposit = 1000;

  selectedAcc: Account | null = null;
  selectedTxnType: 'DEPOSIT' | 'WITHDRAWAL' = 'DEPOSIT';
  amount = 1000;
  remarks = '';

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.user = this.authService.currentUser();
    if (!this.user) return;
    this.isLoading = true;

    this.accountService.getAccountsByUserId(this.user.userId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.accounts = res;
      },
      error: () => {
        this.accountService.getAccountByUserId(this.user!.userId).subscribe({
          next: (acc) => {
            this.isLoading = false;
            this.accounts = [acc];
          },
          error: () => {
            this.isLoading = false;
            this.accounts = [];
          }
        });
      }
    });
  }

  createAccount(): void {
    if (!this.user) return;

    this.accountService.createAccount({
      userId: this.user.userId,
      accountType: this.newAccountType,
      accountBalance: this.initialDeposit,
      accountStatus: 'ACTIVE'
    }).subscribe({
      next: () => {
        this.loadAccounts();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create account');
      }
    });
  }

  prepareTxn(acc: Account, type: 'DEPOSIT' | 'WITHDRAWAL'): void {
    this.selectedAcc = acc;
    this.selectedTxnType = type;
    this.amount = 1000;
    this.remarks = type === 'DEPOSIT' ? 'Deposit to ' + acc.accountType : 'Withdrawal from ' + acc.accountType;
  }

  submitTransaction(): void {
    if (!this.selectedAcc || this.amount <= 0) return;

    this.transactionService.addTransaction({
      accountId: this.selectedAcc.accountNumber,
      transactionType: this.selectedTxnType,
      amount: this.amount,
      description: this.remarks
    }).subscribe({
      next: () => {
        this.loadAccounts();
      },
      error: (err) => {
        alert(err.error?.message || 'Transaction failed');
      }
    });
  }

  copyNumber(num: string): void {
    navigator.clipboard.writeText(num);
    alert('Copied account number: ' + num);
  }
}