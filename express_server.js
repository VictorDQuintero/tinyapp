// TODO, create findUserByEmail(email), returns user object if found, null if not found

const generateRandomString = function(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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

const findUserByEmail = function(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) { // user trying to register with an email already in database
      return user;
    }
  }

  return null;


};

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

// configuration

app.set("view engine", "ejs");

// middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // middleware which will translate, or parse the body of the POST request
// Express's built-in middleware function urlencoded will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.
// the data in the input field will be avaialbe to us in the req.body.longURL variable, which we can store in our urlDatabase object

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  abc: {
    id: "abc",
    email: "a@a.com",
    password: "1234",
  },
  def: {
    id: "def",
    email: "b@b.com",
    password: "5678",
  },
};

app.get("/", (req, res) => { // register a handler on the root path
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => { // register a handler on /urls.json path
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) =>{ // register a urls/new route and responds with rendering urls_new template
  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId]};
  if (!userId) {
    return res.status(401).send('You must be logged in to create URLs.');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // register a "urls/:id route" :id means that the value in this part of the url will be available in req.params object
  const userId = req.cookies["user_id"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[userId]};
  if (!userId) {
    return res.status(401).send('You must be logged in to edit URLs.');
  }
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

// GET /register endpoint
app.get("/register", (req, res) => {
  res.render("register");
});

// GET /login endpoint
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  
  // did they NOT provide an email and password
  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
    return;
  }

  let foundUser = findUserByEmail(email);
  
  if (foundUser) {
    return res.status(400).send('That email is already in use');
  }

  const user = {id: generateRandomString(3), email: req.body.email, password: req.body.password};
  res.cookie("user_id", user.id);
  users[user.id] = user;
  res.redirect("/urls");

});

app.post("/login", (req, res) => { //Add endpoint to handle a POST to /login
  
  const email = req.body.email;
 
  if (!email) {
    res.status(400).send('email is required.');
    return;
  }
 
  for (const userId in users) {
    const user = users[userId];
    if (email === user.email) {
      res.cookie("user_id", user.id);
      res.redirect('/urls');
    }
  }
});

// Implement the /logout endpoint so that it clears the username cookie and redirects the user back to the /urls page.
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send('You must be logged in to create URLs.');
  }
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {

  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send('You must be logged in to delete URLs.');
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {
  
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send('You must be logged in to edit URLs.');
  }
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});