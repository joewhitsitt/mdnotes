import React from 'react';
import Masonry from 'react-masonry-css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const breakpointColumnsObj = {
  default: 3,
  1100: 2,
  700: 1,
};

export default function NoteGrid({ notes, onEdit, onDelete }) {
  return (
    <Masonry
      key={notes.map((n) => n.id).join(',')} // forces re-render when notes change
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {notes.map((note) => (
        <div key={note.id} className="note-card">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
          <button onClick={() => onEdit(note)}>Edit</button>
          <button onClick={() => onDelete(note.id)}>Delete</button>
        </div>
      ))}
    </Masonry>
  );
}
