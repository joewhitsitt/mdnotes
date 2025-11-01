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

  const now = new Date().toISOString();

  // Check if note already exists
  const existingIndex = notes.findIndex((n) => n.id === note.id && n.userId === note.userId);

  if (existingIndex !== -1) {
    // Update: preserve createdAt from the stored note and set updatedAt to server time
    const existing = notes[existingIndex];
    const updatedNote = {
      ...existing,
      ...note,
      createdAt: existing.createdAt || note.createdAt || now,
      updatedAt: now,
    };
    notes[existingIndex] = updatedNote; // Overwrite existing note
    console.log(`Updated note for ${note.userId}: ${note.id}`);
    return res.status(200).json({ message: 'Note updated' });
  }

  // New note: ensure createdAt and updatedAt are set by server if missing
  const newNote = {
    ...note,
    createdAt: note.createdAt || now,
    updatedAt: now,
  };

  notes.push(newNote); // New note
  console.log(`Saved new note for ${note.userId}: ${note.id}`);
  res.status(201).json({ message: 'Note saved' });
});

app.get('/notes', (req, res) => {
  const { userId } = req.query;
  const userNotes = notes
    .filter((n) => n.userId === userId)
    .sort((a, b) => {
      // Sort primarily by updatedAt (newest first), then by createdAt (newest first)
      const updatedA = new Date(a.updatedAt).getTime();
      const updatedB = new Date(b.updatedAt).getTime();
      if (updatedA !== updatedB) return updatedB - updatedA;
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      return createdB - createdA;
    });
  res.json(userNotes);
});

app.delete('/notes/:id', (req, res) => {
  const { id } = req.params;
  notes = notes.filter((n) => n.id !== id);
  res.status(204).end();
});
