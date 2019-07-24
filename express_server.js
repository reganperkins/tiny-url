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

const users = {};

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
    urls: urlDatabase,
    username: req.cookies.username,
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
    username: req.cookies.username,
  };
  res.render('new-url', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    username: req.cookies.username,
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
  res.render('register');
});

app.post('/register', (req, res) => {
  // console.log(req, res);
  const { email, password } = req.body;
  const id = `user${generateRandomString()}`;
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie('user_id', id);
  console.log(users)
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
