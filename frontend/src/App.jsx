import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [note, setNote] = useState('');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>mdnotes</h1>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your markdown here..."
        rows={10}
        style={{ width: '100%', fontSize: '1rem' }}
      />
      <h2>Preview</h2>
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note}</ReactMarkdown>
      </div>
    </div>
  );
}

export default App;