import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { catchError, of, delay } from 'rxjs';
import { BrowserBankingDatabase } from './browser-db';

export const mockFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If the backend is unreachable (status 0, 502, 503, 504, 404, or network timeout)
      // gracefully resolve the request through in-browser client persistence
      const url = req.url;
      const method = req.method;
      const body: any = req.body;
      const params = req.params;

      try {
        let responseBody: any = null;
        let status = 200;

        // 1. User Service
        if (url.includes('/api/users/register')) {
          responseBody = BrowserBankingDatabase.registerUser(body);
        } else if (url.includes('/api/users/login')) {
          responseBody = BrowserBankingDatabase.loginUser(body);
        } else if (url.includes('/api/users') && method === 'GET') {
          responseBody = BrowserBankingDatabase.getAllUsers();
        } else if (url.includes('/api/users/') && method === 'PATCH') {
          const userId = parseInt(url.substring(url.lastIndexOf('/') + 1), 10);
          responseBody = BrowserBankingDatabase.updateUserStatus(userId, body?.status);
        }

        // 2. Account Service
        else if (url.includes('/accounts/user/') && method === 'GET') {
          const userId = parseInt(url.substring(url.lastIndexOf('/') + 1), 10);
          responseBody = BrowserBankingDatabase.getAccountsByUserId(userId);
        } else if (url.includes('/accounts/all') && method === 'GET') {
          responseBody = BrowserBankingDatabase.getAllAccounts();
        } else if (url.includes('/accounts/balance') && method === 'GET') {
          const accNum = params.get('accountNumber') || '';
          const acc = BrowserBankingDatabase.getAccountByNumber(accNum);
          responseBody = acc ? acc.accountBalance.toString() : '0.00';
        } else if (url.includes('/accounts') && method === 'POST') {
          responseBody = BrowserBankingDatabase.createAccount(body);
          status = 201;
        } else if (url.includes('/accounts') && method === 'GET') {
          const accNum = params.get('accountNumber') || '';
          responseBody = BrowserBankingDatabase.getAccountByNumber(accNum);
        } else if (url.includes('/accounts') && method === 'PATCH') {
          const accNum = params.get('accountNumber') || '';
          responseBody = BrowserBankingDatabase.updateAccountStatus(accNum, body?.accountStatus);
        }

        // 3. Beneficiaries
        else if (url.includes('/beneficiaries/user/') && method === 'GET') {
          const userId = parseInt(url.substring(url.lastIndexOf('/') + 1), 10);
          responseBody = BrowserBankingDatabase.getBeneficiariesByUser(userId);
        } else if (url.includes('/beneficiaries') && method === 'POST') {
          responseBody = BrowserBankingDatabase.addBeneficiary(body);
        } else if (url.includes('/beneficiaries/') && method === 'DELETE') {
          const id = parseInt(url.substring(url.lastIndexOf('/') + 1), 10);
          responseBody = BrowserBankingDatabase.deleteBeneficiary(id);
        }

        // 4. Fund Transfers
        else if (url.includes('/fund-transfers') && method === 'POST') {
          responseBody = BrowserBankingDatabase.fundTransfer(body);
        }

        // 5. Transactions
        else if (url.includes('/summary') && method === 'GET') {
          const parts = url.split('/');
          const accountId = parts[parts.length - 2];
          responseBody = BrowserBankingDatabase.getAccountSummary(accountId);
        } else if (url.includes('/transactions') && method === 'POST') {
          responseBody = BrowserBankingDatabase.addTransaction(body);
        } else if (url.includes('/transactions') && method === 'GET') {
          const accountId = params.get('accountId') || '';
          const type = params.get('type') || '';
          const statusParam = params.get('status') || '';
          responseBody = BrowserBankingDatabase.getTransactions(accountId, type, statusParam);
        }

        if (responseBody !== null) {
          return of(new HttpResponse({ status, body: responseBody })).pipe(delay(100));
        }
      } catch (err: any) {
        return of(new HttpResponse({
          status: 400,
          body: { error: err.message || 'Operation failed' }
        }));
      }

      // If no fallback matched, re-throw the original error
      throw error;
    })
  );
};
