export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  balance: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetreiveDataParams {
  symbol: string;
  intervals: string;
  from: string;
  to: string;
}

export interface Orders {
  userId: string;
  symbol: string;
  type: string;
  quantity: number;
  leverage: number;
  stopLoss?: number;
  openPrice?: number;
  openTime?: Date;
  closeTime?: Date;
  profitLoss?: number;
  closePrice?: number;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  margin?: string;
  status?: string;
  isActive?: boolean;
}