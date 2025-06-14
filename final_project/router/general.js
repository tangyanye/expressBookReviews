const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const userExists = users.some((user) => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists." });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.json(books);

});

const axios = require('axios');

public_users.get('/books', (req, res) => {
    res.json(books);
});

public_users.get('/promise-books', (req, res) => {
    axios.get('https://tangyanye-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books') 
        .then((response) => {
            res.json(response.data);
        })
        .catch((error) => {
            res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.json(book);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
 });

public_users.get('/promise-isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    axios.get(`https://tangyanye-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/isbn/${isbn}`)
        .then((response) => {
            res.json(response.data);
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                res.status(404).json({ message: "Book not found (via Axios)" });
            } else {
                res.status(500).json({ message: "Error fetching book details", error: error.message });
            }
        });
});

  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];
    
    for (const isbn in books) {
        if (books[isbn].author === author) {
            matchingBooks.push({ isbn, ...books[isbn] });
        }
    }

    if (matchingBooks.length > 0) {
        res.send(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found for this author" });
    }
});

public_users.get('/promise-author/:author', (req, res) => {
    const author = req.params.author;
    axios.get(`https://tangyanye-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/author/${author}`)
        .then((response) => {
            res.json(response.data);
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                res.status(404).json({ message: "No books found for this author (via Axios)" });
            } else {
                res.status(500).json({ message: "Error fetching books by author", error: error.message });
            }
        });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];
  
    for (const isbn in books) {
      if (books[isbn].title === title) {
        matchingBooks.push({ isbn, ...books[isbn] });
      }
    }
  
    if (matchingBooks.length > 0) {
      res.send(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
});

public_users.get('/promise-title/:title', (req, res) => {
    const title = req.params.title;
    axios.get(`https://tangyanye-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/title/${title}`)
        .then((response) => {
            res.json(response.data);
        })
        .catch((error) => {
            if (error.response && error.response.status === 404) {
                res.status(404).json({ message: "No books found with this title (via Axios)" });
            } else {
                res.status(500).json({ message: "Error fetching books by title", error: error.message });
            }
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
  
    if (book) {
      res.send(book.reviews);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
