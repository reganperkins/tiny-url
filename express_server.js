const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
const URLLENGTH = 6;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

// users obj follows this pattern
// {
//   user_id: { user_id, email, password }
// }
const users = {};

function findUser(field, string) {
  for (let userId in users) {
    if (users[userId][field] === string) {
      return users[userId];
    }
  }

  return false;
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
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    // ...users[req.cookies.user_id],
    urls: urlDatabase,
    user: users[req.cookies.user_id] || {},
    // username: req.cookies.username,
  };
  res.render('urls-index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    // username: req.cookies.username,
    user: users[req.cookies.user_id] || {},
  };
  res.render('new-url', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    // username: req.cookies.username,
    user: users[req.cookies.user_id] || {},
  };
  res.render('show-url', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(`${urlDatabase[req.params.shortURL]}`);
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] || {},
    error: '',
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const emailInUse = findUser('email', email);
  if (!email || !password) {
    res.status(400);
    const templateVars = {
      user: users[req.cookies.user_id] || {},
      error: 'you must provide both an email and password',
    };
    res.render('register', templateVars);
  } else if (emailInUse) {
    res.status(400);
    const templateVars = {
      user: users[req.cookies.user_id] || {},
      error: 'this email has already been used to create an account',
    };
    res.render('register', templateVars);
  } else {
    const userId = `user${generateRandomString()}`;
    users[userId] = {
      user_id: userId,
      email,
      password,
    };
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id] || {},
    error: '',
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUser('email', email);
  if (user && user.password === password) {
    // email and password match
    res.cookie('user_id', user.user_id);
    res.redirect('/urls');
  } else {
    // error message
    res.status(403);
    const templateVars = {
      user: users[req.cookies.user_id] || {},
      error: 'incorrect login details provided',
    };
    res.render('login', templateVars);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
