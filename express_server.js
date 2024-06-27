const generateRandomString = function(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * 62)];
  }
  
  return result;

};

const findUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) { // user trying to register with an email already in database
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id){

  let urls = {};
  
  for (const key in urlDatabase ){
    if(id === urlDatabase[key].userID){
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

// configuration

app.set("view engine", "ejs");

// middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 

const urlDatabase = {
  b2xVn2: {longURL: "http://www.lighthouselabs.ca", userID: "abc" },
  "9sm5xK": {longURL: "http://www.google.com", userID: "def"},
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

app.get("/urls", (req, res) => { // register a handler on /urls path

  const userId = req.cookies["user_id"];
  const userURL = urlsForUser(userId);
  const templateVars = { urls: userURL, user: users[userId]};
  if (!userId) {
    return res.status(401).send('You must be logged in to view URLs.');
  }
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) =>{ // register a urls/new route and responds with rendering urls_new template
  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId]};
  if (!userId) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // register a "urls/:id" route 
  const userId = req.cookies["user_id"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[userId]};
  if (!userId) {
    return res.status(401).send('You must be logged in to edit URLs.');
  }
  if(userId !== urlDatabase[req.params.id].userID){
    return res.status(401).send('Only URL owners can edit their URLs')
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => { // redirects to the website that the generated key pairs with
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (!longURL) {    
    res.status(400).send('Shortened URL does not exist');
    return;
  }
  res.redirect(longURL);
});

// GET /register endpoint
app.get("/register", (req, res) => {

  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId]};
  if(userId){
    res.redirect("/urls");
  } else {
  res.render("register", templateVars);}
});

// GET /login endpoint
app.get("/login", (req, res) => {

  const userId = req.cookies["user_id"];
  const templateVars = { user: users[userId]};
  if(userId){
    res.redirect("/urls");
  } else {
  res.render("login", templateVars);}
});

app.post("/register", (req, res) => { // Handler for POST form in /register

  const email = req.body.email;
  const password = req.body.password;
  
  // did they NOT provide an email and password
  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
    return;
  }

  let foundUser = findUserByEmail(email, users); // if function returns truthy then the email provided is already in database
  
  if (foundUser) {
    return res.status(400).send('That email is already in use');
  }

  const user = {id: generateRandomString(3), email: email, password: password}; // creates new user object
  res.cookie("user_id", user.id); // creates cookie
  users[user.id] = user; // adds new user object to users database
  res.redirect("/urls");

});

app.post("/login", (req, res) => { //Add endpoint to handle a POST to /login
  
  const email = req.body.email;
  const password = req.body.password;  
 
  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
    return;
  }

  let foundUser = findUserByEmail(email, users);
  
  if (!foundUser || password !== foundUser.password) { // if findUserByEmail returns null or password is not equal to the password in database reply with 403 status
    res.status(403).send('Authentication failed');
    return;
  }
  
  res.cookie("user_id", foundUser.id); // create cookie with the id of the logged in user as its value
  res.redirect('/urls');  
  
});

// Implement the /logout endpoint so that it clears the user_id cookie and redirects the user back to the /login page.
app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/urls", (req, res) => { // handler to generate new URLs
  
  const userId = req.cookies.user_id; 
  if (!userId) { // if cookie doesn't exist
    return res.status(401).send('You must be logged in to create URLs.');
  }
  const id = generateRandomString(6);
  console.log(urlDatabase);
  urlDatabase[id] = {longURL: req.body.longURL, userID: userId}; 
  console.log(urlDatabase);
  res.redirect(`urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => { // handler to delete Urls

  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send('You must be logged in to delete URLs.');
  }
  const id = req.params.id;
  //maybe check if the user_id deleting is the same as the user_ID in database
  delete urlDatabase[id]; 
  res.redirect('/urls');
});

app.post("/urls/:id/edit", (req, res) => { // handler to edit URLs
  
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send('You must be logged in to edit URLs.');
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.newURL;
   
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});