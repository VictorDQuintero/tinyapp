const { assert } = require('chai');

const { getUserByEmail, urlsForUser,  generateRandomString } = require('../helpers');

describe('getUserByEmail', function() {
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

// Describe block for generateRandomString function
describe('generateRandomString', () => {

  // Test case: Basic functionality
  it('should return a string of the specified length', () => {
    const length = 8; // Test with a length of 8 characters
    const result = generateRandomString(length);
    assert.isString(result);
    assert.lengthOf(result, length);
  });

  // Test case: Edge case - Minimum length (length <= 0 handled internally)
  it('should return a string of default length (3) for length <= 0', () => {
    const length = 0;
    const result = generateRandomString(length);
    assert.isString(result);
    assert.lengthOf(result, 3);
  });

  // Test case: Edge case - Very large length
  it('should return a string of the specified very large length', () => {
    const length = 1000; // Test with a very large length
    const result = generateRandomString(length);
    assert.isString(result);
    assert.lengthOf(result, length);
  });

  // Test case: Randomness check
  it('should return different strings on consecutive calls', () => {
    const length = 10;
    const result1 = generateRandomString(length);
    const result2 = generateRandomString(length);
    assert.notEqual(result1, result2);
  });

  // Test case: Character variety check
  it('should return a string containing characters from the charset', () => {
    const length = 12;
    const result = generateRandomString(length);
    assert.match(result, /^[a-zA-Z0-9]+$/); // Adjust regex based on charset
  });

  // Test case: Error handling - Negative length (should default to length 3)
  it('should return a string of default length (3) for negative length', () => {
    const length = -1;
    const result = generateRandomString(length);
    assert.isString(result);
    assert.lengthOf(result, 3);
  });

  // Test case: Error handling - Non-numeric input (should default to length 3)
  it('should return a string of default length (3) for non-numeric input', () => {
    const length = 'abc'; // Non-numeric input
    const result = generateRandomString(length);
    assert.isString(result);
    assert.lengthOf(result, 3);
  });

  // Add more specific error handling tests as needed

});