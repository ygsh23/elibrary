package com.elibrary.backend.service;

import com.elibrary.backend.model.Book;
import com.elibrary.backend.model.BorrowRecord;
import com.elibrary.backend.model.User;
import com.elibrary.backend.repository.BookRepository;
import com.elibrary.backend.repository.BorrowRecordRepository;
import com.elibrary.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BorrowRecordService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookService bookService;

    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAll();
    }

    public Optional<BorrowRecord> getBorrowRecordById(Long id) {
        return borrowRecordRepository.findById(id);
    }

    public List<BorrowRecord> getBorrowRecordsByUserId(Long userId) {
        return borrowRecordRepository.findByUserId(userId);
    }

    public List<BorrowRecord> getBorrowRecordsByBookId(Long bookId) {
        return borrowRecordRepository.findByBookId(bookId);
    }

    public List<BorrowRecord> getBorrowRecordsByStatus(String status) {
        return borrowRecordRepository.findByStatus(status);
    }

    public List<BorrowRecord> getActiveBorrowRecordsByUserId(Long userId) {
        return borrowRecordRepository.findByUserIdAndStatus(userId, "APPROVED");
    }

    @Transactional
    public Optional<BorrowRecord> requestToBorrowBook(Long userId, Long bookId) {
        Optional<User> userOptional = userRepository.findById(userId);
        Optional<Book> bookOptional = bookRepository.findById(bookId);

        if (userOptional.isPresent() && bookOptional.isPresent()) {
            User user = userOptional.get();
            Book book = bookOptional.get();

            if (book.getAvailableCopies() > 0) {
                BorrowRecord borrowRecord = new BorrowRecord();
                borrowRecord.setUser(user);
                borrowRecord.setBook(book);
                borrowRecord.setBorrowDate(LocalDate.now());
                borrowRecord.setStatus("PENDING");

                return Optional.of(borrowRecordRepository.save(borrowRecord));
            }
        }
        return Optional.empty();
    }

    @Transactional
    public Optional<BorrowRecord> approveBorrowRequest(Long borrowRecordId) {
        return borrowRecordRepository.findById(borrowRecordId)
                .filter(record -> "PENDING".equals(record.getStatus()))
                .map(record -> {
                    Book book = record.getBook();
                    
                    if (book.getAvailableCopies() > 0) {
                        // Update borrow record
                        record.setStatus("APPROVED");
                        
                        // Decrement available copies
                        bookService.decrementAvailableCopies(book.getId());
                        
                        return borrowRecordRepository.save(record);
                    }
                    return null;
                });
    }

    @Transactional
    public Optional<BorrowRecord> rejectBorrowRequest(Long borrowRecordId) {
        return borrowRecordRepository.findById(borrowRecordId)
                .filter(record -> "PENDING".equals(record.getStatus()))
                .map(record -> {
                    record.setStatus("REJECTED");
                    return borrowRecordRepository.save(record);
                });
    }

    @Transactional
    public Optional<BorrowRecord> returnBook(Long borrowRecordId) {
        return borrowRecordRepository.findById(borrowRecordId)
                .filter(record -> "APPROVED".equals(record.getStatus()))
                .map(record -> {
                    // Update borrow record
                    record.setStatus("RETURNED");
                    record.setReturnDate(LocalDate.now());
                    
                    // Increment available copies
                    bookService.incrementAvailableCopies(record.getBook().getId());
                    
                    return borrowRecordRepository.save(record);
                });
    }
}
