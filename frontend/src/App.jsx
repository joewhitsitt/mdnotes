import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [note, setNote] = useState('');

  function generateNoteId() {
  const now = new Date();
  // Zettelkasten-style ID.
  return now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
}

  if (isLoading) return <p>Loading...</p>;

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
    const noteId = generateNoteId();
    const payload = {
      id: noteId,
      userId: user.sub,
      title: "",
      content: note,
      createdAt: new Date().toISOString()
    };

    console.log('Saving note:', payload);

    axios.post('http://localhost:5000/notes', payload)
      .then(() => alert('Note saved!'))
      .catch(err => console.error('Save failed:', err));
  }}
  style={{ marginTop: '1rem' }}
>
  Save Note
</button>
      <h2>Preview</h2>
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note}</ReactMarkdown>
      </div>
    </div>
  );
}

export default App;
