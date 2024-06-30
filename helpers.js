// TODO
// Comment functions purpose and any comments about their functioning

// Function to find and retrieve any user in the users database through the provided email. It takes a string; email, which represents the user's email, and an object; database, which represents the users database. When found, the function returns the user's object, when not found it returns null.
const getUserByEmail = function(email, database) {

  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) { // if the email provided matches an email in the users database
      return user;
    }
  }
  return null;
};

// Function to return the urls owned by the user in the urlDatabase. 
const urlsForUser = function(userId, database){

  let urls = {}; 
  for (const urlId in database ){    
    if(userId === database[urlId].userID){ // if the userId provided matched an userId in the urlDatabase
      urls[urlId] = database[urlId]; // copy the appropriate url object into the empty urls object
    }
  }
  return urls;
};

//Function to return a random string from the character set, defined in the function. Function takes a number that will determine the desired length of the generate string
const generateRandomString = function(length) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  if (length <= 0 || typeof length !== "number") {
    length = 3;
  } 

  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * 62)];
  }
  return result;

};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };