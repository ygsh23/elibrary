package com.elibrary.backend.service;

import com.elibrary.backend.model.User;
import com.elibrary.backend.repository.BorrowRecordRepository;
import com.elibrary.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @PostConstruct
    public void init() {
        // Create admin user if it doesn't exist
        if (!userRepository.existsByEmail("admin@elibrary.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@elibrary.com");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }
        
        // Create a test student user if it doesn't exist
        if (!userRepository.existsByEmail("student@elibrary.com")) {
            User student = new User();
            student.setName("Student");
            student.setEmail("student@elibrary.com");
            student.setPassword("student123");
            student.setRole("STUDENT");
            userRepository.save(student);
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User createUser(User user) {
        // Set default role to STUDENT for new users
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("STUDENT");
        }
        return userRepository.save(user);
    }

    public Optional<User> updateUser(Long id, User userDetails) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    existingUser.setName(userDetails.getName());
                    existingUser.setEmail(userDetails.getEmail());
                    // Only update password if it's provided
                    if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                        existingUser.setPassword(userDetails.getPassword());
                    }
                    return userRepository.save(existingUser);
                });
    }

    public boolean deleteUser(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return true;
                })
                .orElse(false);
    }

    public Optional<User> authenticateUser(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> user.getPassword().equals(password));
    }
    
    /**
     * Search for users by name or email containing the given query
     * @param query The search query
     * @return List of users matching the search criteria
     */
    public List<User> searchUsers(String query) {
        return userRepository.searchByNameOrEmail(query);
    }
    
    /**
     * Updates the borrowedCount for a specific user based on their approved borrow records
     *
     * @param userId The ID of the user to update
     */
    @Transactional
    public void updateBorrowedCount(Long userId) {
        userRepository.findById(userId)
                .map(user -> {
                    int approvedCount = borrowRecordRepository.countByUser_IdAndStatus(userId, "APPROVED");
                    user.setBorrowedCount(approvedCount);
                    return userRepository.save(user);
                });
    }
    
    /**
     * Updates the borrowedCount for all users based on their approved borrow records
     * @return The number of users updated
     */
    @Transactional
    public int updateAllUsersBorrowedCount() {
        List<User> allUsers = userRepository.findAll();
        int updatedCount = 0;
        
        for (User user : allUsers) {
            int approvedCount = borrowRecordRepository.countByUser_IdAndStatus(user.getId(), "APPROVED");
            user.setBorrowedCount(approvedCount);
            userRepository.save(user);
            updatedCount++;
        }
        
        return updatedCount;
    }
}
