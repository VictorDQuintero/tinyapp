function generateRandomString() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let result = "";

  for (let i=0; i<length;i++){    
    result += charset[Math.floor(Math.random() * 62)];
  }
  
  return result; 

}

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true })); // middleware which will translate, or parse the body of the POST request
// Express's built-in middleware function urlencoded will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.
// the data in the input field will be avaialbe to us in the req.body.longURL variable, which we can store in our urlDatabase object

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const templateVars = { id: generateRandomString(), longURL: req.body.longURL}; 
  console.log(templateVars);
  
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/", (req, res) => { // register a handler on the root path
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => { // register a handler on /urls.json path
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) =>{ // register a urls/new route and responds with rendering urls_new template
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { // register a "urls/:id route" :id means that the value in this part of the url will be available in req.params object
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}; 
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});