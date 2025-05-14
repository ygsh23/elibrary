package com.elibrary.backend.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "borrow_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @Column(nullable = false)
    private LocalDate borrowDate;
    
    private LocalDate dueDate;
    
    private LocalDate returnDate;
    
    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED, RETURNED
    
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer renewCount = 0;
}
