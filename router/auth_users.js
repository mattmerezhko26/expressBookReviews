const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];  // This will store registered users

// Function to check if the username is valid
const isValid = (username) => {
  // Check if the username already exists in the users array
  return users.some(user => user.username === username);
};

// Function to authenticate a user based on username and password
const authenticatedUser = (username, password) => {
  // Check if the user exists and if the password matches
  return users.some(user => user.username === username && user.password === password);
};

// Route for user login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Authenticate the user
  if (authenticatedUser(username, password)) {
    // Generate a JWT token for the user
    const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });

    // Send the token back in the response
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Route for adding a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { token } = req.headers; // Get token from headers
  const { review } = req.body;
  const { isbn } = req.params;

  // Verify the token
  if (!token) {
    return res.status(403).json({ message: "No token provided. Please log in." });
  }

  jwt.verify(token, 'your_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Find the book by ISBN
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add the review to the book's reviews
    if (!book.reviews) {
      book.reviews = [];
    }
    book.reviews.push(review);

    // Send success response
    return res.status(200).json({ message: "Review added successfully", book });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
