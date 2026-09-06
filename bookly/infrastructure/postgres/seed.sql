-- Seed data for catalog_db
\c catalog_db;

-- Create the books table (matches Prisma schema with @@map("books"))
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    genre TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    "coverUrl" TEXT,
    "pdfUrl" TEXT,
    price DECIMAL(10, 2) NOT NULL,
    "availableCopies" INTEGER NOT NULL DEFAULT 0,
    "totalCopies" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Grant permissions to catalog_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO catalog_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO catalog_user;
ALTER TABLE books OWNER TO catalog_user;

INSERT INTO books (title, author, genre, isbn, description, price, "availableCopies", "totalCopies", "createdAt", "updatedAt") VALUES
('Dune', 'Frank Herbert', 'science-fiction', '9780441013593', 'A science fiction masterpiece about politics, religion, and ecology.', 12.99, 10, 10, NOW(), NOW()),
('Foundation', 'Isaac Asimov', 'science-fiction', '9780553293357', 'The first novel in Asimov''s epic Foundation series.', 11.99, 8, 8, NOW(), NOW()),
('Clean Code', 'Robert C. Martin', 'programming', '9780132350884', 'A handbook of agile software craftsmanship.', 14.99, 5, 5, NOW(), NOW()),
('The Pragmatic Programmer', 'Andrew Hunt', 'programming', '9780135957059', 'Your journey to mastery in software development.', 15.99, 6, 6, NOW(), NOW()),
('1984', 'George Orwell', 'dystopian', '9780451524935', 'A dystopian social science fiction novel.', 9.99, 12, 12, NOW(), NOW()),
('The Hobbit', 'J.R.R. Tolkien', 'fantasy', '9780547928227', 'A fantasy novel about the adventures of Bilbo Baggins.', 10.99, 7, 7, NOW(), NOW()),
('Brave New World', 'Aldous Huxley', 'dystopian', '9780060850524', 'A dystopian novel about a futuristic totalitarian society.', 11.50, 9, 9, NOW(), NOW()),
('Neuromancer', 'William Gibson', 'science-fiction', '9780441569595', 'The seminal cyberpunk novel about a washed-up computer hacker.', 13.99, 5, 5, NOW(), NOW()),
('The Name of the Wind', 'Patrick Rothfuss', 'fantasy', '9780756404741', 'The tale of Kvothe, an orphan turned legend.', 12.99, 4, 4, NOW(), NOW()),
('Designing Data-Intensive Applications', 'Martin Kleppmann', 'programming', '9781449373320', 'The big ideas behind reliable, scalable, and maintainable systems.', 24.99, 3, 3, NOW(), NOW()),
('The Girl with the Dragon Tattoo', 'Stieg Larsson', 'mystery', '9780307454546', 'A hacker and a journalist investigate a decades-old disappearance.', 10.99, 6, 6, NOW(), NOW()),
('The Da Vinci Code', 'Dan Brown', 'mystery', '9780307474278', 'A symbologist races to solve a murder tied to a religious secret.', 9.99, 8, 8, NOW(), NOW()),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'non-fiction', '9780062316097', 'A sweeping narrative of humanity''s creation and evolution.', 14.99, 10, 10, NOW(), NOW()),
('The Martian', 'Andy Weir', 'science-fiction', '9780553418026', 'An astronaut is stranded on Mars and must survive.', 11.99, 7, 7, NOW(), NOW()),
('The Fellowship of the Ring', 'J.R.R. Tolkien', 'fantasy', '9780547928210', 'The first volume of The Lord of the Rings.', 11.99, 6, 6, NOW(), NOW()),
('Animal Farm', 'George Orwell', 'dystopian', '9780451526342', 'A satirical fable about a group of farm animals.', 8.99, 11, 11, NOW(), NOW()),
('A Game of Thrones', 'George R.R. Martin', 'fantasy', '9780553593716', 'Noble families fight for control of the Iron Throne.', 13.99, 5, 5, NOW(), NOW()),
('The Selfish Gene', 'Richard Dawkins', 'non-fiction', '9780198788607', 'The gene-centered view of evolution explained.', 12.99, 4, 4, NOW(), NOW());
