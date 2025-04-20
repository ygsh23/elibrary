export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  borrowedCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
}
