# E-Library Management System

A web-based application that allows users to search, borrow, and manage books online.

## Project Overview

The E-Library Management System is built with:
- Frontend: Angular with Material UI
- Backend: Spring Boot
- Database: PostgreSQL

## Features

### User (Student) Features
- Signup & Login
- View Available Books
- Search for Books by Title, Author, or Category
- Request to Borrow a Book
- Return a Book
- View Borrowing History

### Admin (Library Staff) Features
- Manage Books (CRUD operations)
- Approve/Deny Borrow Requests
- View All Users and Their Borrowing History

## Project Structure
- `/frontend` - Angular application
- `/backend` - Spring Boot application

## Setup Instructions

### Prerequisites
- Node.js and npm
- Angular CLI
- Java 11+
- Maven
- PostgreSQL

### Running the Frontend
```bash
cd frontend
npm install
ng serve
```

### Running the Backend
```bash
cd backend
mvn spring-boot:run
```

### Database Setup
The application uses PostgreSQL. Make sure to create a database named `elibrary` and update the database configuration in `application.properties` if needed.
