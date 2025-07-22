// Core user types
export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  type: 'income' | 'expense' | 'transfer';
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>; 