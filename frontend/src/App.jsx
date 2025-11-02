import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import NoteGrid from './NoteGrid.jsx';


function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { getAccessTokenSilently } = useAuth0();

  const authRequest = useCallback(
    async (method, url, data = null) => {
      const token = await getAccessTokenSilently();
      return axios({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    },
    [getAccessTokenSilently]
  );

  const filteredNotes = notes.filter((n) =>
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      authRequest('get', `${import.meta.env.VITE_API_BASE}/notes`)
        .then((res) => setNotes(res.data))
        .catch((err) => console.error('Failed to fetch notes:', err));
    }
  }, [isLoading, isAuthenticated, user, authRequest]);

  function generateNoteId() {
    const now = new Date();
    return now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
  }

  const handleEdit = (note) => {
    setNote(note.content);
    setEditingNote(note);
  };

  const handleDelete = (id) => {
    authRequest('delete', `${import.meta.env.VITE_API_BASE}/notes/${id}`)
      .then(() => authRequest('get', `${import.meta.env.VITE_API_BASE}/notes`))
      .then((res) => setNotes(res.data))
      .catch((err) => console.error('Delete failed:', err));
  };

  if (isLoading && import.meta.env.MODE !== 'development') return <p>Loading...</p>;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>mdnotes</h1>
        <button onClick={() => loginWithRedirect()}>Log In</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>mdnotes</h1>
      <p>Welcome, {user.name}</p>
      <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
        Log Out
      </button>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your markdown here..."
        rows={10}
        style={{ width: '100%', fontSize: '1rem', marginTop: '1rem' }}
      />
      <button
        onClick={() => {
          const now = new Date().toISOString();

          const isUpdating = editingNote !== null;

          const payload = {
            id: isUpdating ? editingNote.id : generateNoteId(),
            content: note,
            createdAt: isUpdating ? editingNote.createdAt : now,
            updatedAt: now,
          };

          authRequest('post', `${import.meta.env.VITE_API_BASE}/notes`, payload)
            .then(() => {
              alert(isUpdating ? 'Note updated!' : 'Note saved!');
              setNote('');
              setEditingNote(null);
              return authRequest('get', `${import.meta.env.VITE_API_BASE}/notes`);
            })
            .then((res) => setNotes(res.data))
            .catch((err) => console.error('Save failed:', err));
        }}
        style={{ marginTop: '1rem' }}
      >
        Save Note
      </button>

      <h2>Preview</h2>
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note}</ReactMarkdown>
      </div>

      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: '1rem', width: '100%', fontSize: '1rem' }}
      />

      <NoteGrid notes={filteredNotes} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default App;
