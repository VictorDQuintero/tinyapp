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

module.exports = { getUserByEmail, urlsForUser };