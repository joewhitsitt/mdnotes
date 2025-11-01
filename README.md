# mdnotes

A markdown notes app with Node.js/Express backend and React/Vite frontend. Notes are stored in a local SQLite database.

## Prerequisites

- Node.js (v18+ recommended)
- npm

## Setup

### 1. Backend

```
cd backend
npm install
```

- The SQLite database file (`notes.db`) will be created automatically and stored in `backend/`. It is git-ignored.
- You can use a VS Code extension like **SQLite** to inspect the database.

### 2. Frontend

```
cd ../frontend
npm install
```

- Create a `.env` file in `frontend/` with your Auth0 credentials:
  ```
  VITE_AUTH0_DOMAIN=your-auth0-domain
  VITE_AUTH0_CLIENT_ID=your-auth0-client-id
  ```

## Development

### Start Backend

```
cd backend
npm start
```

### Start Frontend

```
cd frontend
npm run dev
```

- The frontend will run on http://localhost:5173 (default Vite port).
- The backend will run on http://localhost:5000 (default).

## Production

1. Build the frontend:

   ```
   cd frontend
   npm run build
   ```

   This outputs static files to `frontend/dist`.

2. Serve the backend (you may want to use a process manager like pm2 or run with Node):

   ```
   cd backend
   npm start
   ```

3. (Optional) Serve the frontend static files with a production server or configure the backend to serve them.

## Linting & Formatting

- Run `npm run lint` in `frontend/` to check code style.
- Prettier and ESLint are configured for the frontend.
