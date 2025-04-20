import { Book } from './book.model';
import { User } from './user.model';

export type BorrowStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

export interface BorrowRecord {
  id: number;
  user: User;
  book: Book;
  borrowDate: Date;
  dueDate?: Date;
  returnDate?: Date;
  status: BorrowStatus;
  renewCount: number;
}
