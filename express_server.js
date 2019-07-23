const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;
const URLLENGTH = 6;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

function generateRandomString(x = '') {
  if (x.length >= URLLENGTH) return x;

  const alphaNumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const alphaNumericLength = alphaNumeric.length;
  const index = Math.floor(Math.random() * Math.max(alphaNumericLength));

  return generateRandomString(`${x}${alphaNumeric[index]}`);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
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
  res.render('new-url');
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
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

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
