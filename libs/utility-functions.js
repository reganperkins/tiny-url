const { usersDatabase, urlDatabase } = require('./database');

const URL_LENGTH = 6;

function getUserFromMatchingField(field, string) {
  for (let userId in usersDatabase) {
    if (usersDatabase[userId][field] === string) {
      return usersDatabase[userId];
    }
  }
  return false;
}

function getURLOwnerId(shortURL) {
  for (let urlId in urlDatabase) {
    if (urlId === shortURL) {
      return urlDatabase[urlId].userId;
    }
  }
  return false;
}

function getUrlsObjectForUser(userId) {
  const urls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === userId) {
      urls[urlId] = urlDatabase[urlId];
    }
  }

  return urls;
}

function generateRandomString(generatedString = '') {
  if (generatedString.length >= URL_LENGTH) return generatedString;

  const alphaNumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const alphaNumericLength = alphaNumeric.length;
  const index = Math.floor(Math.random() * Math.max(alphaNumericLength));

  return generateRandomString(`${generatedString}${alphaNumeric[index]}`);
}

module.exports = {
  getUserFromMatchingField,
  getURLOwnerId,
  getUrlsObjectForUser,
  generateRandomString,
};
