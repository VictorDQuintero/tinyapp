const express = require("express");
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const app = express();
const bcrypt = require("bcryptjs");

const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers"); //helper functions
const PORT = 8080; // default port 8080

// configuration
app.set("view engine", "ejs");

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieSession({
  name: "session",
  keys: [ generateRandomString(10), generateRandomString(10)],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Databases
const urlDatabase = {};
const users = {};

app.get("/", (req, res) => { // register a handler on the root path

  const userId = req.session.user_id; // assigns the user_id cookie's value to userId
  if (!userId) { // if there is no user logged in redirects to login page
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => { // register a handler on /urls.json path

  res.json(urlDatabase);
});

app.get("/urls", (req, res) => { // register a handler on /urls path

  const userId = req.session.user_id;
  const userURL = urlsForUser(userId, urlDatabase); //  assigns the return value of urlsForUser to userURL
  const templateVars = { urls: userURL, user: users[userId]}; // defines the object that will be sent to urls_index
  if (!userId) { // if user not logged in
    return res.status(401).send("You must be logged in to view URLs."); 
  }
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) =>{ // register a urls/new route and responds with rendering urls_new template
  const userId = req.session.user_id;
  const templateVars = { user: users[userId]};
  if (!userId) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => { // register a "urls/:id" route
  
  const userId = req.session.user_id;
  const urlId = req.params.id;
  
  if (!urlDatabase[urlId]) {
    return res.status(400).send("Shortened URL does not exist");
  }

  if (!userId) { // if no user logged in
    return res.status(401).send("You must be logged in to edit URLs.");
  } else if (userId !== urlDatabase[urlId].userID) { // if the user logged in doesn't match the user that owns the url
    return res.status(401).send("Only URL owners can edit their URLs");
  }

  const templateVars = { id: urlId, longURL: urlDatabase[urlId].longURL, user: users[userId], visits: urlDatabase[urlId].visits, uniqueVisitors: urlDatabase[urlId].uniqueVisitors.length, visitTimestamps: urlDatabase[urlId].visitTimestamps}; // deconstructs the current values of urlDatabase and users databases and assigns them to templateVars

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => { // redirects to the website that the generated key pairs with
  const id = req.params.id;
  
  if (!urlDatabase[id]) { // if short url doesn't exist
    res.status(400).send('Shortened URL does not exist');
    return;
  }

  if (!req.session.visitor_id) { // if there is no visitor_id yet, generate a random string
    req.session.visitor_id = generateRandomString(8);    
  }

  const visitorId = req.session.visitor_id;

  if (!urlDatabase[id].uniqueVisitors.includes(visitorId)) { // if the visitorId is not in the uniqueVisitors property of the urlDatabase, adds it
    urlDatabase[id].uniqueVisitors.push(visitorId);
  }  

  urlDatabase[id].visitTimestamps.push(`${new Date().toLocaleString()} - ${visitorId}`); // push timestamp and visitor_id
 
  const longURL = urlDatabase[id].longURL;
  urlDatabase[id].visits += 1; // Increment the visit counter by 1
  res.redirect(longURL); //redirects to the website associated with the short url
});
 
// GET /register endpoint
app.get("/register", (req, res) => { // registers users

  const userId = req.session.user_id;
  const templateVars = { user: users[userId]};
  if (userId) { 
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// GET /login endpoint
app.get("/login", (req, res) => { // logs in users

  const userId = req.session.user_id;
  const templateVars = { user: users[userId]};
  if (userId) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.post("/register", (req, res) => { // Handler for POST form in /register

  const email = req.body.email;
  const password = req.body.password;
  
  // did they NOT provide an email and password
  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
    return;
  }

  // if function returns truthy  then the email provided is already in database
  let foundUser = getUserByEmail(email, users); 
  
  if (foundUser) {
    return res.status(400).send('That email is already in use');
  }

  const salt = bcrypt.genSaltSync(); // generates salt
  const hashedPassword = bcrypt.hashSync(password, salt); // hashes passwords
  const user = {id: generateRandomString(3), email: email, password: hashedPassword}; // creates new user object
  req.session.user_id = user.id; // creates cookie
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

  let foundUser = getUserByEmail(email, users);

  if (!foundUser ||  !bcrypt.compareSync(password, foundUser.password)) { // if getUserByEmail returns null or the hash of the password provided doesn't match to the hash in the database
    res.status(403).send('Authentication failed');
    return;
  }
  
  req.session.user_id = foundUser.id; // create cookie with the id of the logged in user as its value
  res.redirect('/urls');
  
});

app.post("/logout", (req, res) => { // handler for /logout

  req.session = null; // clears cookie
  res.redirect("/login");
});

app.post("/urls", (req, res) => { // handler to generate new URLs
  
  const userId = req.session.user_id;
  
  if (!userId) { // if cookie doesn't exist
    return res.status(401).send('You must be logged in to create URLs.');
  }

  // generates short id. populates urlDatabase[id] with key-value pairs
  const id = generateRandomString(6);
  const longURL = req.body.longURL;
  const visitCounter = 0;  
  urlDatabase[id] = {longURL: longURL, userID: userId, visits: visitCounter, uniqueVisitors: [], visitTimestamps: [] };
  res.redirect(`urls/${id}`);
});

app.delete('/urls/:id', (req, res) => { // handler to delete Urls
  
  const userId = req.session.user_id;
  const id = req.params.id;
  if (!userId) { 
    return res.status(401).send('You must be logged in to delete URLs.');
  } else if (!urlDatabase[id] && userId) { //if user logged in but no short url in the database
    return  res.status(401).send('URL does not exist');
  } else if (urlDatabase[id].userID !== userId) { // if user's id is not the same as the userId in the database
    return  res.status(401).send('This URL does not belong to you');
  }
  
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.put("/urls/:id", (req, res) => { // handler to edit URLs
  
  const userId = req.session.user_id;
  const id = req.params.id;
  if (!userId) {
    return res.status(401).send('You must be logged in to delete URLs.');
  } else if (!urlDatabase[id] && userId) {
    return  res.status(401).send('URL does not exist');
  } else if (urlDatabase[id].userID !== userId) {
    return  res.status(401).send('This URL does not belong to you');
  }
  
  urlDatabase[id].longURL = req.body.newURL; // assigns new provided url to longURL property
   
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}!`);
});