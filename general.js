const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
// Get the book list available in the shop using an async callback
public_users.get('/', async (req, res) => {
  try {
    // Simulate fetching books as an async operation
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(books); // Resolve with the list of books
        }, 500); // Simulate a delay of 500ms
      });
    };

    // Await the books data
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;

  // Simulate a Promise-based asynchronous operation
  const findBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const book = Object.values(books).find((b) => b.isbn === isbn);
        if (book) {
          resolve(book);
        } else {
          reject(new Error("Book not found"));
        }
      }, 500); // Simulate a delay of 500ms
    });
  };

  // Use the Promise
  findBookByISBN(isbn)
    .then((book) => res.status(200).json(book)) // If resolved, return the book
    .catch((error) => res.status(404).json({ message: error.message })); // If rejected, return an error
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = Object.values(books).filter(b => b.author.toLowerCase() === author);

  return booksByAuthor.length > 0
    ? res.status(200).json(booksByAuthor)
    : res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const booksByTitle = Object.values(books).filter(b => b.title.toLowerCase().includes(title));

  return booksByTitle.length > 0
    ? res.status(200).json(booksByTitle)
    : res.status(404).json({ message: "No books found with this title" });
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = Object.values(books).find(b => b.isbn === isbn);

  return book && book.reviews
    ? res.status(200).json(book.reviews)
    : res.status(404).json({ message: "No reviews found for this book" });
});

// Add or modify a book review
public_users.put('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const { username, review } = req.body;

  if (!username || !review) {
    return res.status(400).json({ message: "Username and review are required" });
  }

  const book = Object.values(books).find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

module.exports.general = public_users;
