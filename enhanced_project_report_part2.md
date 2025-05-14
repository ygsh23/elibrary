## 4. Technology Stack
### 4.1 Frontend
- **Framework**: Angular 15+
- **UI Components**: Angular Material
- **State Management**: RxJS
- **CSS Preprocessor**: SCSS
- **HTTP Client**: Angular HttpClient

**Angular Module Structure:**
```typescript
// app.module.ts
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    CoreModule,
    SharedModule,
    AuthModule,
    BookModule,
    UserModule,
    AdminModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

### 4.2 Backend
- **Framework**: Spring Boot 3.0+
- **API**: RESTful web services
- **Security**: Spring Security with JWT
- **Data Access**: Spring Data JPA
- **Build Tool**: Maven

**Spring Boot Controller Example:**
```java
// BookController.java
@RestController
@RequestMapping("/api/books")
public class BookController {
    
    private final BookService bookService;
    
    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }
    
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookService.getAllBooks();
        return ResponseEntity.ok(books);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        Book savedBook = bookService.saveBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedBook);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        if (!bookService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        book.setId(id);
        Book updatedBook = bookService.saveBook(book);
        return ResponseEntity.ok(updatedBook);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (!bookService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String query) {
        List<Book> books = bookService.searchBooks(query);
        return ResponseEntity.ok(books);
    }
}
```

### 4.3 Database
- **RDBMS**: MySQL/PostgreSQL
- **Migration**: Flyway

**Entity Example:**
```java
// Book.java
@Entity
@Table(name = "books")
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String author;
    
    @Column(unique = true, nullable = false)
    private String isbn;
    
    @Column(nullable = false)
    private String category;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "total_copies", nullable = false)
    private Integer totalCopies;
    
    @Column(name = "available_copies", nullable = false)
    private Integer availableCopies;
    
    @Column(name = "publish_year")
    private Integer publishYear;
    
    private String publisher;
    
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Getters and setters
}
```

### 4.4 Development Tools
- **IDE**: VS Code, IntelliJ IDEA
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Testing**: JUnit, Jasmine, Karma

## 5. Implementation Details
### 5.1 Frontend Implementation
The frontend is structured using Angular's component-based architecture:

**Book Model Implementation:**
```typescript
// book.model.ts
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  totalCopies: number;
  availableCopies: number;
  publishYear: number;
  publisher: string;
  coverImageUrl: string;
}
```

**Book Service Implementation:**
```typescript
// book.service.ts
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = `${environment.apiUrl}/books`;

  constructor(private http: HttpClient) { }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      catchError(this.handleError<Book[]>('getAllBooks', []))
    );
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<Book>('getBookById'))
    );
  }

  searchBooks(query: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/search?query=${query}`).pipe(
      catchError(this.handleError<Book[]>('searchBooks', []))
    );
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book).pipe(
      catchError(this.handleError<Book>('addBook'))
    );
  }

  updateBook(book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${book.id}`, book).pipe(
      catchError(this.handleError<Book>('updateBook'))
    );
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<void>('deleteBook'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
```

### 5.2 Backend Implementation
The backend follows a layered architecture:

**Service Implementation:**
```java
// BookServiceImpl.java
@Service
public class BookServiceImpl implements BookService {
    
    private final BookRepository bookRepository;
    
    @Autowired
    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
    
    @Override
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    @Override
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }
    
    @Override
    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }
    
    @Override
    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
    }
    
    @Override
    public boolean existsById(Long id) {
        return bookRepository.existsById(id);
    }
    
    @Override
    public List<Book> searchBooks(String query) {
        return bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            query, query, query);
    }
    
    @Override
    @Transactional
    public boolean updateBookAvailability(Long bookId, int change) {
        Optional<Book> optionalBook = bookRepository.findById(bookId);
        if (optionalBook.isPresent()) {
            Book book = optionalBook.get();
            int newAvailableCopies = book.getAvailableCopies() + change;
            
            if (newAvailableCopies >= 0 && newAvailableCopies <= book.getTotalCopies()) {
                book.setAvailableCopies(newAvailableCopies);
                bookRepository.save(book);
                return true;
            }
        }
        return false;
    }
}
```

**Repository Implementation:**
```java
// BookRepository.java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCase(
        String title, String author, String category);
    
    List<Book> findByCategory(String category);
    
    Optional<Book> findByIsbn(String isbn);
    
    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0")
    List<Book> findAvailableBooks();
}
```

### 5.3 Database Implementation
The database design follows normalization principles with:

**Database Configuration:**
```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/elibrary
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

## 6. User Interface Design
### 6.1 Design Philosophy
The UI design follows a cosmic/universe theme with:
- Dark background resembling space
- Animated stars and nebula effects
- Orbital navigation system with glowing planets
- Book planets that orbit in 3D space
- Glassmorphism UI elements with purple/blue gradient accents

**Cosmic Background CSS Implementation:**
```css
/* cosmic-background.css */
.cosmic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(to bottom, #0b0d2a 0%, #1a1b46 50%, #2c1e4f 100%);
  overflow: hidden;
}

.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 90px 40px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 160px 120px, #ffffff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: twinkle 5s infinite;
}

.twinkling {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/assets/images/twinkling.png');
  background-size: 1000px 1000px;
  opacity: 0.3;
  animation: move-twink-back 200s linear infinite;
}

.nebula-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(74, 25, 122, 0.2) 0%, rgba(0, 0, 0, 0) 70%);
  animation: pulse 15s infinite alternate;
}

@keyframes twinkle {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

@keyframes move-twink-back {
  from { background-position: 0 0; }
  to { background-position: -10000px 5000px; }
}

@keyframes pulse {
  0% { opacity: 0.2; }
  50% { opacity: 0.5; }
  100% { opacity: 0.2; }
}
```

### 6.2 Key UI Components
**Admin Dashboard HTML Implementation:**
```html
<!-- admin-dashboard.component.html -->
<div class="cosmic-admin-dashboard">
  <!-- Cosmic Background -->
  <div class="cosmic-background">
    <div class="stars"></div>
    <div class="twinkling"></div>
    <div class="nebula-glow"></div>
  </div>

  <!-- Admin Universe Header -->
  <div class="universe-header">
    <h1 class="universe-title">Admin Command Center</h1>
    <div class="cosmic-divider"></div>
  </div>

  <!-- Galactic Navigation -->
  <div class="galactic-navigation">
    <div class="nav-constellation" (click)="setActiveSection('books')" [class.active]="activeSection === 'books'">
      <div class="constellation-icon">
        <mat-icon>auto_stories</mat-icon>
      </div>
      <div class="constellation-line"></div>
      <span class="constellation-label">Books</span>
    </div>
    
    <div class="nav-constellation" (click)="setActiveSection('requests')" [class.active]="activeSection === 'requests'">
      <div class="constellation-icon">
        <mat-icon>swap_horiz</mat-icon>
      </div>
      <div class="constellation-line"></div>
      <span class="constellation-label">Requests</span>
    </div>
    
    <div class="nav-constellation" (click)="setActiveSection('users')" [class.active]="activeSection === 'users'">
      <div class="constellation-icon">
        <mat-icon>people</mat-icon>
      </div>
      <div class="constellation-line"></div>
      <span class="constellation-label">Users</span>
    </div>
  </div>

  <!-- Content Galaxy -->
  <div class="content-galaxy">
    <!-- Books Management Section -->
    <section class="galaxy-section" *ngIf="activeSection === 'books'">
      <div class="section-header">
        <h2>Manage Books Catalog</h2>
        <button class="cosmic-button add-button" (click)="openBookForm()">
          <div class="button-glow"></div>
          <mat-icon>add</mat-icon>
          <span>Add New Book</span>
        </button>
      </div>
      
      <!-- Book management content -->
    </section>
    
    <!-- Other sections -->
  </div>
</div>
```
