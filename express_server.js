const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

require('dotenv').config();

const app = express();
const PORT = 8080;
const URLLENGTH = 6;

const urlDatabase = {
  // urlId: { longURL, userId},
};

const users = {
  // user_id: { user_id, email, password },
};

function findUser(field, string) {
  for (let userId in users) {
    if (users[userId][field] === string) {
      return users[userId];
    }
  }
  return false;
}

function urlsForUser(userId) {
  const urls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === userId) {
      urls[urlId] = urlDatabase[urlId];
    }
  }

  return urls;
}

function generateRandomString(x = '') {
  if (x.length >= URLLENGTH) return x;

  const alphaNumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const alphaNumericLength = alphaNumeric.length;
  const index = Math.floor(Math.random() * Math.max(alphaNumericLength));

  return generateRandomString(`${x}${alphaNumeric[index]}`);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieSession({ secret: process.env.SESSION_SECRET_KEY }));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/urls', (req, res) => {
  const loggedInUser = req.session.user_id;
  const templateVars = {
    urls: urlsForUser(loggedInUser),
    user: users[loggedInUser] || {},
  };
  res.render('urls-index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.session.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.session.user_id] || {},
    };
    res.render('new-url', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const loggedInUser = req.session.user_id;
  const { shortURL } = req.params;
  const userOwnsContent = urlDatabase[shortURL] && urlDatabase[shortURL].userId === loggedInUser;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL] && urlDatabase[shortURL].longURL,
    user: users[loggedInUser] || {},
    loggedIn: !!loggedInUser,
    userOwnsContent,
  };
  res.render('show-url', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  const postOwner = findUser('shortURL', shortURL);
  if (postOwner && postOwner.user_id === req.session.user_id) {
    urlDatabase[shortURL].longURL = longURL;
  } else {
    res.status(401);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const postOwner = findUser('shortURL', req.params.shortURL);
  if (postOwner && postOwner.user_id === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(401);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const urlObj = urlDatabase[req.params.shortURL];
  if (urlObj && urlObj.longURL) {
    res.redirect(`${urlObj.longURL}`);
  } else {
    res.status(404);
    res.redirect('/urls');
  }
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id] || {},
    error: '',
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const emailInUse = findUser('email', email);
  if (email && password && !emailInUse) {
    const userId = `user${generateRandomString()}`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userId] = {
      user_id: userId,
      email,
      password: hashedPassword,
    };

    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    res.status(400);
    const templateVars = {
      user: users[req.session.user_id] || {},
      error: emailInUse ? 'this email has already been used to create an account' : 'you must provide both an email and password',
    };
    res.render('register', templateVars);
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id] || {},
    error: '',
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUser('email', email);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.user_id;
    res.redirect('/urls');
  } else {
    res.status(403);
    const templateVars = {
      user: users[req.session.user_id] || {},
      error: 'incorrect login details provided',
    };
    res.render('login', templateVars);
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
