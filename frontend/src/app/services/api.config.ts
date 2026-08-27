const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://2ab00731451f08.lhr.life';
  }
  return 'http://localhost:8080';
};

const baseUrl = getApiBaseUrl();

export const API_CONFIG = {
  baseUrl,
  users: `${baseUrl}/api/users`,
  accounts: `${baseUrl}/accounts`,
  transfers: `${baseUrl}/fund-transfers`,
  beneficiaries: `${baseUrl}/fund-transfers/beneficiaries`,
  transactions: `${baseUrl}/transactions`,
};