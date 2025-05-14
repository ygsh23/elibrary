package com.elibrary.backend.service;

import com.elibrary.backend.model.Book;
import com.elibrary.backend.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    @PostConstruct
    public void init() {
        // Add some sample books if the database is empty
        if (bookRepository.count() == 0) {
            // Sample book 1
            Book book1 = new Book();
            book1.setTitle("To Kill a Mockingbird");
            book1.setAuthor("Harper Lee");
            book1.setCategory("Fiction");
            book1.setDescription("A novel about racial inequality through the eyes of a young girl in Alabama.");
            book1.setTotalCopies(5);
            book1.setAvailableCopies(5);
            book1.setIsbn("9780061120084");
            book1.setPublishYear("1960");
            book1.setPublisher("Harper Collins");
            book1.setCoverImageUrl("");
            bookRepository.save(book1);

            // Sample book 2
            Book book2 = new Book();
            book2.setTitle("1984");
            book2.setAuthor("George Orwell");
            book2.setCategory("Dystopian Fiction");
            book2.setDescription("A dystopian novel about a totalitarian regime and surveillance.");
            book2.setTotalCopies(3);
            book2.setAvailableCopies(3);
            book2.setIsbn("9780451524935");
            book2.setPublishYear("1949");
            book2.setPublisher("Penguin Books");
            book2.setCoverImageUrl("");
            bookRepository.save(book2);

            // Sample book 3
            Book book3 = new Book();
            book3.setTitle("The Great Gatsby");
            book3.setAuthor("F. Scott Fitzgerald");
            book3.setCategory("Classic");
            book3.setDescription("A novel about the American Dream in the 1920s.");
            book3.setTotalCopies(4);
            book3.setAvailableCopies(4);
            book3.setIsbn("9780743273565");
            book3.setPublishYear("1925");
            book3.setPublisher("Scribner");
            book3.setCoverImageUrl("");
            bookRepository.save(book3);
        }
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public Book createBook(Book book) {
        // Set available copies equal to total copies for a new book
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        return bookRepository.save(book);
    }

    public Optional<Book> updateBook(Long id, Book bookDetails) {
        return bookRepository.findById(id)
                .map(existingBook -> {
                    existingBook.setTitle(bookDetails.getTitle());
                    existingBook.setAuthor(bookDetails.getAuthor());
                    existingBook.setCategory(bookDetails.getCategory());
                    existingBook.setDescription(bookDetails.getDescription());
                    existingBook.setIsbn(bookDetails.getIsbn());
                    existingBook.setPublishYear(bookDetails.getPublishYear());
                    existingBook.setPublisher(bookDetails.getPublisher());
                    existingBook.setCoverImageUrl(bookDetails.getCoverImageUrl());
                    
                    // Update total copies and recalculate available copies
                    int oldTotalCopies = existingBook.getTotalCopies();
                    int newTotalCopies = bookDetails.getTotalCopies();
                    int borrowedCopies = oldTotalCopies - existingBook.getAvailableCopies();
                    
                    existingBook.setTotalCopies(newTotalCopies);
                    // Make sure available copies don't go negative
                    existingBook.setAvailableCopies(Math.max(0, newTotalCopies - borrowedCopies));
                    
                    return bookRepository.save(existingBook);
                });
    }

    public boolean deleteBook(Long id) {
        return bookRepository.findById(id)
                .map(book -> {
                    bookRepository.delete(book);
                    return true;
                })
                .orElse(false);
    }

    public List<Book> searchBooks(String searchTerm) {
        return bookRepository.searchBooks(searchTerm);
    }

    public List<Book> findByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Book> findByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }

    public List<Book> findByCategory(String category) {
        return bookRepository.findByCategoryContainingIgnoreCase(category);
    }

    public boolean decrementAvailableCopies(Long bookId) {
        return bookRepository.findById(bookId)
                .map(book -> {
                    if (book.getAvailableCopies() > 0) {
                        book.setAvailableCopies(book.getAvailableCopies() - 1);
                        bookRepository.save(book);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }

    public boolean incrementAvailableCopies(Long bookId) {
        return bookRepository.findById(bookId)
                .map(book -> {
                    if (book.getAvailableCopies() < book.getTotalCopies()) {
                        book.setAvailableCopies(book.getAvailableCopies() + 1);
                        bookRepository.save(book);
                        return true;
                    }
                    return false;
                })
                .orElse(false);
    }
}
