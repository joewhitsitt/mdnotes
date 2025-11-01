const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

let notes = [];

app.post('/notes', (req, res) => {
  const note = req.body;
  if (!note || !note.id || !note.userId || !note.content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  notes.push(note);
  console.log(`Saved note for ${note.userId}: ${note.id}`);
  res.status(201).json({ message: 'Note saved' });
});