const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) { // user trying to register with an email already in database
      return user;
    }
  }
  return null;
};

module.exports = {getUserByEmail};