package com.elibrary.backend.repository;

import com.elibrary.backend.model.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUser_Id(Long userId);
    List<BorrowRecord> findByBook_Id(Long bookId);
    List<BorrowRecord> findByStatus(String status);
    List<BorrowRecord> findByUser_IdAndStatus(Long userId, String status);
    List<BorrowRecord> findByUser_IdAndBook_IdAndStatusIn(Long userId, Long bookId, List<String> statuses);
    
    int countByUser_IdAndStatus(Long userId, String status);
}
