const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const db = new sqlite3.Database('db/database.db');
const app = express();

const generateDB = false;

if (generateDB == true) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phonenumber TEXT,
      password TEXT NOT NULL
    )
  `);
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/test', (req, res) => {
  res.send({ some: 'Hello frasfoddm gus!' });
});

app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      res.status(500).send({ error: 'Internal Server Error' });
    } else {
      res.send(rows);
    }
  });
});

app.post('/api/users', (req, res) => {
  const { firstname, lastname, email, phonenumber, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  const insertQuery = `
    INSERT INTO users (firstname, lastname, email, phonenumber, password)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(
    insertQuery,
    [firstname, lastname, email, phonenumber, password],
    function (err) {
      if (err) {
        if (err.errno === 19) {
          // Unique constraint violation (email already exists)
          res.status(400).send({ error: 'Email address already in use' });
        } else {
          res.status(500).send({ error: 'Internal Server Error' });
        }
      } else {
        res
          .status(201)
          .send({ id: this.lastID, message: 'User created successfully' });
      }
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}/`);
});
