export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  publishYear: number;
  publisher?: string;
  coverImageUrl?: string;
}
