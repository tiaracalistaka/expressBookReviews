const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("No books found");
        }
      });
    };

    const bookList = await getBooks();
    res.status(200).send(JSON.stringify(bookList));
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  const getBookByIsbn = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  };

  try {
    const book = await getBookByIsbn(isbn);
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: error });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
  const author = req.params.author;

  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const result = {};
      for (let id in books) {
        if (books[id].author === author) {
          result[id] = books[id];
        }
      }

      if (Object.keys(result).length > 0) {
        resolve(result);
      } else {
        reject("Book not found");
      }
    });
  };

  try {
    const booksByAuthor = await getBooksByAuthor(author);
    res.status(200).json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //Write your code here
  const title = req.params.title;

  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const result = {};
      for (let id in books) {
        if (books[id].title === title) {
          result[id] = books[id];
        }
      }

      if (Object.keys(result).length > 0) {
        resolve(result);
      } else {
        reject("Book not found");
      }
    });
  };

  try {
    const booksByTitle = await getBooksByTitle(title);
    res.status(200).json(booksByTitle);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if (books[isbn] != null){
    return res.status(200).json(books[isbn].reviews)
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
