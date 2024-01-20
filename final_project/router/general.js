const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."}); 
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  new Promise((resolve, reject) =>{
    if(books){
        resolve(JSON.stringify({books},null,4));}
    else{
        reject("The library is empty");
    }
  })
  .then(result =>{
    res.status(300).send(result);
  })
  .catch(error =>{
    reject(error)
  })
   
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  new Promise((resolve,reject) =>{
    if(isbn){
        resolve(books[isbn])
    }else{
        reject("ISBN not valid")
    }
  })
  .then(result =>{
    res.status(300).json(result);
  })
  .catch(error =>{
    reject(error)
  })
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  new Promise((resolve,reject) =>{
  let keys = Object.keys(books);
  let filtered_author = keys.filter(key => books[key].author === author);
  let newbooks = [];
  filtered_author.forEach(key =>{
    newbooks.push(books[key]);
  });
  resolve(newbooks,null,4)
  })
  .then(result =>{
    res.status(300).send(result);
  })
  .catch(error =>{
    reject(error)
  })

  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  new Promise((resolve,reject)=>{
    let title = req.params.title;
    if(title){
        let filtered_title = Object.keys(books).filter(key => books[key].title === title);
        let booktitle = [];
        filtered_title.forEach(key =>{
          booktitle.push(books[key]);
        });
        if(booktitle.length > 0){
            resolve(booktitle,null,4)
        }else{
            reject("No book for this title")
        }
    };
  })
  .then(result =>{res.status(300).send(result)})
  .catch(error =>{res.status(500).send(error)})
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  return res.status(300).send(books[isbn].reviews, null, 4);
});

module.exports.general = public_users;
