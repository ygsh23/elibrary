export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdDate: Date;
  borrowedCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
}
