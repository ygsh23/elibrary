package com.elibrary.backend.service;

import com.elibrary.backend.model.Book;
import com.elibrary.backend.model.BorrowRecord;
import com.elibrary.backend.model.User;
import com.elibrary.backend.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowRecordService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final UserService userService;
    private final BookService bookService;

    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAll();
    }

    public Optional<BorrowRecord> getBorrowRecordById(Long id) {
        return borrowRecordRepository.findById(id);
    }

    public List<BorrowRecord> getBorrowRecordsByUserId(Long userId) {
        return borrowRecordRepository.findByUser_Id(userId);
    }

    public List<BorrowRecord> getBorrowRecordsByBookId(Long bookId) {
        return borrowRecordRepository.findByBook_Id(bookId);
    }

    public List<BorrowRecord> getBorrowRecordsByStatus(String status) {
        return borrowRecordRepository.findByStatus(status);
    }

    public List<BorrowRecord> getActiveBorrowRecordsByUserId(Long userId) {
        return borrowRecordRepository.findByUser_Id(userId).stream()
                .filter(record -> record.getStatus().equals("APPROVED") || record.getStatus().equals("PENDING"))
                .collect(Collectors.toList());
    }

    public Optional<BorrowRecord> requestToBorrowBook(Long userId, Long bookId) {
        Optional<User> userOptional = userService.getUserById(userId);
        Optional<Book> bookOptional = bookService.getBookById(bookId);

        if (userOptional.isPresent() && bookOptional.isPresent()) {
            User user = userOptional.get();
            Book book = bookOptional.get();

            // Check if user already has an active borrow record for this book
            List<String> activeStatuses = List.of("PENDING", "APPROVED");
            List<BorrowRecord> activeRecords = borrowRecordRepository.findByUser_IdAndBook_IdAndStatusIn(userId, bookId, activeStatuses);
            
            if (!activeRecords.isEmpty()) {
                return Optional.empty(); // User already has an active borrow record for this book
            }

            // Check if book has available copies
            if (book.getAvailableCopies() > 0) {
                LocalDate borrowDate = LocalDate.now();
                BorrowRecord borrowRecord = new BorrowRecord();
                borrowRecord.setUser(user);
                borrowRecord.setBook(book);
                borrowRecord.setBorrowDate(borrowDate);
                // Set due date to one week (7 days) from borrow date
                borrowRecord.setDueDate(borrowDate.plusDays(7));
                borrowRecord.setStatus("PENDING");

                return Optional.of(borrowRecordRepository.save(borrowRecord));
            }
        }
        return Optional.empty();
    }

    public Optional<BorrowRecord> approveBorrowRequest(Long id) {
        return borrowRecordRepository.findById(id)
                .map(record -> {
                    if (record.getStatus().equals("PENDING")) {
                        Book book = record.getBook();
                        
                        // Set due date (21 days from approval)
                        LocalDate approvalDate = LocalDate.now();
                        record.setDueDate(approvalDate.plusDays(21));
                        
                        // Decrement available copies
                        boolean decremented = bookService.decrementAvailableCopies(book.getId());
                        
                        if (decremented) {
                            record.setStatus("APPROVED");
                            BorrowRecord savedRecord = borrowRecordRepository.save(record);
                            
                            // Update user's borrowedCount
                            userService.updateBorrowedCount(record.getUser().getId());
                            
                            return savedRecord;
                        }
                    }
                    return record;
                });
    }

    public Optional<BorrowRecord> rejectBorrowRequest(Long id) {
        return borrowRecordRepository.findById(id)
                .map(record -> {
                    record.setStatus("REJECTED");
                    // Clear the due date since the request is rejected
                    record.setDueDate(null);
                    BorrowRecord savedRecord = borrowRecordRepository.save(record);
                    
                    // Update user's borrowedCount (though it shouldn't change for rejections)
                    userService.updateBorrowedCount(record.getUser().getId());
                    
                    return savedRecord;
                });
    }

    public Optional<BorrowRecord> returnBook(Long id) {
        return borrowRecordRepository.findById(id)
                .map(record -> {
                    if (record.getStatus().equals("APPROVED")) {
                        // Set return date to today
                        LocalDate returnDate = LocalDate.now();
                        record.setStatus("RETURNED");
                        record.setReturnDate(returnDate);
                        
                        // Clear the due date since the book is returned
                        record.setDueDate(null);
                        
                        // Increment available copies
                        boolean incremented = bookService.incrementAvailableCopies(record.getBook().getId());
                        
                        if (incremented) {
                            BorrowRecord savedRecord = borrowRecordRepository.save(record);
                            
                            // Update user's borrowedCount since the book is no longer borrowed
                            userService.updateBorrowedCount(record.getUser().getId());
                            
                            return savedRecord;
                        }
                    }
                    return record;
                });
    }
    
    public Optional<BorrowRecord> renewBook(Long id) {
        return borrowRecordRepository.findById(id)
                .map(record -> {
                    if (record.getStatus().equals("APPROVED")) {
                        // Extend due date by 14 days from current due date
                        if (record.getDueDate() != null) {
                            record.setDueDate(record.getDueDate().plusDays(14));
                            // Increment renew count
                            record.setRenewCount(record.getRenewCount() + 1);
                            return borrowRecordRepository.save(record);
                        }
                    }
                    return record;
                });
    }
}