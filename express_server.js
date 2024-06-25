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
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) =>{ // register a urls/new route and responds with rendering urls_new template
  const templateVars = { user: users[req.cookies["user_id"]]};
  if (!req.cookies["user_id"]) {
    return res.status(401).send('You must be logged in to create URLs.');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // register a "urls/:id route" :id means that the value in this part of the url will be available in req.params object
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]};
  if(!req.cookies["user_id"]){
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

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register", (req, res) => {

  // 1. To generate a random user ID
  // 2. After adding user, set a user_id cookie containing the user's newly gen ID
  // 3. Redirect the user to /urls page
  // 4. Test that the users object is properly being appended to.
  const email = req.body.email;
  const password = req.body.password;
  
  // did they NOT provide an email and password
  if(!email || !password) {
    res.status(400).send('Please provide an email and password');
    return;
  }

  const user = {id: generateRandomString(3), email: req.body.email, password: req.body.password};  
  res.cookie("user_id", user.id);
  users[user.id] = user;  
  res.redirect("/urls");

});

app.post("/login", (req, res) => { //Add endpoint to handle a POST to /login
  
  const email = req.body.email;
 //TODO fix this if statement, make it if(!email)
 if (!email){
  res.status(400).send('email is required.');
  return;
 } 
 
 for (const user in users){ 
  if(email === users[user].email){    
    res.cookie("user_id", users[user].id);    
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
  
  if (!req.cookies) {
    return res.status(401).send('You must be logged in to create URLs.');
  }
  const id = generateRandomString(6);
  urlDatabase[id] = req.body.longURL; 
  res.redirect(`urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {

  
  if (!req.cookies) {
    return res.status(401).send('You must be logged in to delete URLs.');
  }
  const id = req.params.id
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => {

  
  if (!req.cookies) {
    return res.status(401).send('You must be logged in to edit URLs.');
  }
  const id = req.params.id;
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});