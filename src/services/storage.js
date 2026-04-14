import { openDB } from 'idb';

const DB_NAME = 'cinema-db';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore('movies', { keyPath: 'imdbID' });
      db.createObjectStore('status', { keyPath: 'movieId' });
      db.createObjectStore('notes', { keyPath: 'movieId' });
    },
  });
};

export const dbService = {
  // Movies
  async saveMovie(movie) {
    const db = await initDB();
    await db.put('movies', movie);
  },
  async getMovie(id) {
    const db = await initDB();
    return db.get('movies', id);
  },
  // Status (Watchlist/Watched/Skipped)
  async updateStatus(movieId, state) {
    const db = await initDB();
    await db.put('status', { movieId, state, updated: Date.now() });
  },
  async getStatus(movieId) {
    const db = await initDB();
    return db.get('status', movieId);
  },
  // Aftertaste Notes
  async saveNote(note) {
    const db = await initDB();
    await db.put('notes', { ...note, timestamp: Date.now() });
  },
  async getNote(movieId) {
    const db = await initDB();
    return db.get('notes', movieId);
  }
};