package com.elibrary.backend.controller;

import com.elibrary.backend.model.BorrowRecord;
import com.elibrary.backend.service.BorrowRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class BorrowRecordController {

    private final BorrowRecordService borrowRecordService;

    @GetMapping
    public ResponseEntity<List<BorrowRecord>> getAllBorrowRecords() {
        return ResponseEntity.ok(borrowRecordService.getAllBorrowRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowRecord> getBorrowRecordById(@PathVariable Long id) {
        return borrowRecordService.getBorrowRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BorrowRecord>> getBorrowRecordsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowRecordService.getBorrowRecordsByUserId(userId));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<BorrowRecord>> getBorrowRecordsByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(borrowRecordService.getBorrowRecordsByBookId(bookId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BorrowRecord>> getBorrowRecordsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(borrowRecordService.getBorrowRecordsByStatus(status));
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<BorrowRecord>> getActiveBorrowRecordsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowRecordService.getActiveBorrowRecordsByUserId(userId));
    }

    @PostMapping("/request")
    public ResponseEntity<BorrowRecord> requestToBorrowBook(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long bookId = request.get("bookId");
        
        return borrowRecordService.requestToBorrowBook(userId, bookId)
                .map(record -> ResponseEntity.status(HttpStatus.CREATED).body(record))
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<BorrowRecord> approveBorrowRequest(@PathVariable Long id) {
        return borrowRecordService.approveBorrowRequest(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<BorrowRecord> rejectBorrowRequest(@PathVariable Long id) {
        return borrowRecordService.rejectBorrowRequest(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<BorrowRecord> returnBook(@PathVariable Long id) {
        return borrowRecordService.returnBook(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().build());
    }
}
