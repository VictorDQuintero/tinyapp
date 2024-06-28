const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) { // user trying to register with an email already in database
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id){

  let urls = {};
  
  for (const urlId in urlDatabase ){
    if(id === urlDatabase[urlId].userID){
      urls[urlId] = urlDatabase[urlId];
    }
  }
  return urls;
};

module.exports = { getUserByEmail, urlsForUser };