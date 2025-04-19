import { Book } from './book.model';
import { User } from './user.model';

export interface BorrowRecord {
  id: number;
  user: User;
  book: Book;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: BorrowStatus;
  notes?: string;
}

export enum BorrowStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  RETURNED = 'RETURNED'
}
