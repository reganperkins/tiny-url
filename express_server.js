const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // longURL: req.params.longURL,
  };
  res.render('urls-index', templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body)
  res.send('okay');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// should be post
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

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
