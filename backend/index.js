const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

app.use(cors());
app.use(express.json());
app.use('/notes', checkJwt);

// Initialize SQLite DB
const dbPath = path.join(__dirname, 'notes.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite:', err);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id TEXT NOT NULL,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    PRIMARY KEY (id, userId)
  )`);
});

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// CREATE or UPDATE note
app.post('/notes', (req, res) => {
  const note = req.body;
  const userId = req.auth.sub;
  if (!note || !note.id || !note.content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const now = new Date().toISOString();
  // Check if note exists
  db.get('SELECT * FROM notes WHERE id = ? AND userId = ?', [note.id, userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (row) {
      // Update
      const createdAt = row.createdAt || note.createdAt || now;
      db.run(
        'UPDATE notes SET content = ?, createdAt = ?, updatedAt = ? WHERE id = ? AND userId = ?',
        [note.content, createdAt, now, note.id, userId],
        (err2) => {
          if (err2) return res.status(500).json({ error: 'DB error' });
          console.log(`Updated note for ${userId}: ${note.id}`);
          res.status(200).json({ message: 'Note updated' });
        }
      );
    } else {
      // Insert
      db.run(
        'INSERT INTO notes (id, userId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [note.id, userId, note.content, note.createdAt || now, now],
        (err2) => {
          if (err2) return res.status(500).json({ error: 'DB error' });
          console.log(`Saved new note for ${userId}: ${note.id}`);
          res.status(201).json({ message: 'Note saved' });
        }
      );
    }
  });
});

// READ notes for user
app.get('/notes', (req, res) => {
  const userId = req.auth.sub;
  db.all(
    'SELECT * FROM notes WHERE userId = ? ORDER BY updatedAt DESC, createdAt DESC',
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    }
  );
});

// DELETE note
app.delete('/notes/:id', checkJwt, (req, res) => {
  const { id } = req.params;
  const userId = req.auth.sub;
  db.run('DELETE FROM notes WHERE id = ? AND userId = ?', [id, userId], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.status(204).end();
  });
});
