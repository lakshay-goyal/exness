export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetreiveDataParams {
  symbol: string;
  intervals: string;
  from: string;
  to: string;
}