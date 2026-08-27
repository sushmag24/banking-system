import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav *ngIf="authService.isAuthenticated()" class="navbar navbar-expand-lg navbar-dark bg-gradient-dark py-2 px-3 shadow-sm sticky-top">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center fw-bold gap-2 text-white" routerLink="/dashboard">
          <i class="bi bi-bank2 fs-4 text-primary"></i>
          <span>APEX <span class="text-primary">BANK</span></span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            <li class="nav-item">
              <a class="nav-link px-3 rounded-3" routerLink="/dashboard" routerLinkActive="active bg-primary text-white">
                <i class="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-3" routerLink="/accounts" routerLinkActive="active bg-primary text-white">
                <i class="bi bi-wallet2 me-1"></i> Accounts
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-3" routerLink="/beneficiaries" routerLinkActive="active bg-primary text-white">
                <i class="bi bi-people-fill me-1"></i> Beneficiaries
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-3" routerLink="/transfer" routerLinkActive="active bg-primary text-white">
                <i class="bi bi-arrow-left-right me-1"></i> Fund Transfer
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 rounded-3" routerLink="/transactions" routerLinkActive="active bg-primary text-white">
                <i class="bi bi-clock-history me-1"></i> History
              </a>
            </li>
            <li *ngIf="authService.isAdmin()" class="nav-item">
              <a class="nav-link px-3 rounded-3 text-warning fw-semibold" routerLink="/admin" routerLinkActive="active bg-warning text-dark">
                <i class="bi bi-shield-lock-fill me-1"></i> Admin Portal
              </a>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-3">
            <div class="text-end d-none d-md-block text-white">
              <div class="fw-semibold">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</div>
              <small class="badge" [ngClass]="authService.isAdmin() ? 'bg-warning text-dark' : 'bg-info text-dark'">
                {{ authService.currentUser()?.role }}
              </small>
            </div>

            <a routerLink="/profile" class="btn btn-sm btn-outline-light rounded-pill px-3" title="View Profile">
              <i class="bi bi-person-circle"></i>
            </a>

            <button (click)="authService.logout()" class="btn btn-sm btn-danger rounded-pill px-3 d-flex align-items-center gap-1">
              <i class="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}
}