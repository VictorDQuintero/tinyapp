const generateRandomString = function() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * 62)];
  }
  
  return result;

};
/* 
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
} */

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true })); // middleware which will translate, or parse the body of the POST request
// Express's built-in middleware function urlencoded will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.
// the data in the input field will be avaialbe to us in the req.body.longURL variable, which we can store in our urlDatabase object

app.get("/", (req, res) => { // register a handler on the root path
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => { // register a handler on /urls.json path
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) =>{ // register a urls/new route and responds with rendering urls_new template
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // register a "urls/:id route" :id means that the value in this part of the url will be available in req.params object
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    
    res.status(400).send('Bad Request');
    
  }
  res.redirect(longURL);
});

app.post("/login", (req, res) => { //Add endpoint to handle a POST to /login
  const username = req.body.username;
 /*  res.cookie("username", username);
  res.redirect("/urls"); */
  if (username) {
    res.cookie('username', username);
    res.redirect('/urls');
  } else {
    res.status(400).send('Username is required.');
  }
});

app.post("/urls", (req, res) => {
   
  // const username = req.cookies.username;
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  // if (!username) {
  //   return res.status(401).send('You must be logged in to create URLs.');
  // }

  // const id = generateRandomString();
  // urlDatabase[id] = {
  //   longURL: req.body.longURL,
  //   userID: username
  // };
 
  res.redirect(`urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {

  /* const username = req.cookies.username;
  if (!username) {
    return res.status(401).send('You must be logged in to delete URLs.');
  } */
  const id = req.params.id
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
/* 
  const username = req.cookies.username;
  if (!username) {
    return res.status(401).send('You must be logged in to edit URLs.');
  } */
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});