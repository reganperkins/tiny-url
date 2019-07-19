const express = require('express');

const app = express();
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello World');
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };
  res.render('urls-index', templateVars);
});
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
  };
  res.render('show-url', templateVars);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
