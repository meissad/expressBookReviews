const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const session = require('express-session');
const regd_users = express.Router();

let users = [
    {username: "harry", password: "pwd123"},
    {username: "Ron", password: "hermione"}
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  req.session.username = username;
  return res.status(200).send("User successfully logged in: "+req.session.username);
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const usr = req.session.username;
  let review = req.body.review;
  let filtered_owner = books[isbn].reviews.filter(review =>{
    return (review.owner === usr)
  })
  if( review ){
    if(filtered_owner.length > 0){
        books[isbn].reviews.forEach(thereview =>{
            if(thereview.owner === usr){
                thereview.content = review;
                return (res.status(200).json({"Review modified": thereview},null,4))
            }
        });
    }else{
        books[isbn].reviews.push({owner: usr, content: review});
        return (res.status(200).json({"Review added": {"owner": usr, "content": review}},null,4))
    }
  }else{
  return res.status(208).json({message: "No review to add! Try again"});}
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let usr = req.session.username
    let isbn = req.params.isbn;
    let filtered_owner = books[isbn].reviews.filter(review =>{
        return (review.owner === usr)
      });
    if(filtered_owner.length > 0){
        let myreviews = books[isbn].reviews; 
        myreviews = myreviews.filter(review =>{
            return(review.owner != usr)
        });
        books[isbn].reviews = myreviews;

        return ( res.status(200).json({"One review has been deleted: Updated reviews here ->": books[isbn].reviews}, null,4) )
        

    }else{
        return ( res.status(208).json({message: "You have no review here"}) )
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users; 
