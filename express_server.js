const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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

function filteredURLS(userId) {
  const filteredObj = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === userId) {
      filteredObj[urlId] = urlDatabase[urlId];
    }
  }

  return filteredObj;
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
  const loggedInUser = req.cookies.user_id;
  const templateVars = {
    urls: filteredURLS(loggedInUser),
    user: users[loggedInUser] || {},
  };
  res.render('urls-index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.cookies.user_id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user: users[req.cookies.user_id] || {},
    };
    res.render('new-url', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.cookies.user_id] || {},
  };
  res.render('show-url', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const { longURL } = req.body;
  urlDatabase[shortURL].longURL = longURL;
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
  if (email && password && !emailInUse) {
    const userId = `user${generateRandomString()}`;
    users[userId] = {
      user_id: userId,
      email,
      password,
    };
    res.cookie('user_id', userId);
    res.redirect('/urls');
  } else {
    res.status(400);
    const templateVars = {
      user: users[req.cookies.user_id] || {},
      error: emailInUse ? 'this email has already been used to create an account' : 'you must provide both an email and password',
    };
    res.render('register', templateVars);
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
