// TODO
// Comment functions purpose and any comments about their functioning

const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) { // user trying to register with an email already in database
      return user;
    }
  }
  return null;
};

const urlsForUser = function(userId, database){

  let urls = {};
  for (const urlId in database ){    
    if(userId === database[urlId].userID){
      urls[urlId] = database[urlId];
    }
  }
  return urls;
};

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