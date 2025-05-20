const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { username }, 
    "access",
    { expiresIn: '1h' }
  );

  req.session.authenticated = { accessToken };
  
  return res.status(200).json({ message: "Login successful" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!req.session.authenticated || !req.session.authenticated.accessToken) {
    return res.status(401).json({ message: "You must be logged in to post a review" });
  }

  let username;
  try {
    const decoded = jwt.verify(req.session.authenticated.accessToken, "access");
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required in query string" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ 
    message: "Review successfully added/updated",
    reviews: books[isbn].reviews 
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!req.session.authenticated || !req.session.authenticated.accessToken) {
    return res.status(401).json({ message: "You must be logged in to delete a review" });
  }

  let username;
  try {
    const decoded = jwt.verify(req.session.authenticated.accessToken, "access");
    username = decoded.username;
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const userReviews = books[isbn].reviews;

  if (!userReviews[username]) {
    return res.status(404).json({ message: "Your review for this book does not exist" });
  }

  delete userReviews[username];

  return res.status(200).json({ 
    message: "Your review has been successfully deleted",
    reviews: userReviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
