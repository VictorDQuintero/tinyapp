const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user object when provided with an email that exists in the database', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user, testUsers[expectedUserID]);
  });
  it('should return null  when provided with an email that doesn\'t exist in the database', function(){
    const user = getUserByEmail("a@example.com", testUsers);
    assert.strictEqual(user, null);
  });
});


describe('urlsForUser', () => {
  const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
    "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
    "4B2rQF": { longURL: "http://www.example.com", userID: "user1" },
    "6u7YpG": { longURL: "http://www.facebook.com", userID: "user3" },
    "2ds5eR": { longURL: "http://www.github.com", userID: "user4" },
    "3pu8Vx": { longURL: "http://www.reddit.com", userID: "user2" },
    "5gH9fD": { longURL: "http://www.twitter.com", userID: "user5" }
  };

  it('should return urls that belong to the specified user (user1)', () => {
    const userId = "user1";
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
      "4B2rQF": { longURL: "http://www.example.com", userID: "user1" }
    };

    const result = urlsForUser(userId, urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the urlDatabase does not contain any urls that belong to the specified user (user6)', () => {
    const userId = "user6";
    const expectedOutput = {};

    const result = urlsForUser(userId, urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the urlDatabase is empty', () => {
    const userId = "user1";
    const emptyUrlDatabase = {};
    const expectedOutput = {};

    const result = urlsForUser(userId, emptyUrlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should not return any urls that do not belong to the specified user', () => {
    const userId = "user2";
    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
      "3pu8Vx": { longURL: "http://www.reddit.com", userID: "user2" }
    };

    const result = urlsForUser(userId, urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });
});