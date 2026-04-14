import { openDB } from 'idb';

const DB_NAME = 'cinema-db';
const DB_VERSION = 2; // 🔥 bump version for upgrades

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {

      if (!db.objectStoreNames.contains('movies')) {
        db.createObjectStore('movies', { keyPath: 'imdbID' });
      }

      if (!db.objectStoreNames.contains('status')) {
        const store = db.createObjectStore('status', { keyPath: 'movieId' });

        // 🔥 index for faster filtering later
        store.createIndex('state', 'state');
      }

      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'movieId' });
      }
    },
  });
};

export const dbService = {

  // =========================
  // MOVIES
  // =========================
  async getMovie(id) {
    const db = await initDB();
    return db.get('movies', id);
  },

  async saveMovie(movie) {
    const db = await initDB();
    if (!movie?.imdbID) return;
    return db.put('movies', movie);
  },

  // =========================
  // STATUS (FIXED MODEL)
  // =========================
  async updateStatus(movieId, statusObj) {
    const db = await initDB();

    if (!movieId) return;

    const state = statusObj?.state || null;

    return db.put('status', {
      movieId,
      state, // watched | watchlist | skipped | null
      updated: Date.now()
    });
  },

  async getStatus(movieId) {
    const db = await initDB();
    const data = await db.get('status', movieId);

    // 🔥 Normalize EVERYTHING to new format
    if (!data) return { state: null };

    if (data.state) return data;

    // 🔥 migrate old data
    if (data.seen) return { state: 'watched' };
    if (data.watchlist) return { state: 'watchlist' };

    return { state: null };
  },

  // =========================
  // NOTES
  // =========================
  async saveNote(movieId, text) {
    const db = await initDB();

    if (!movieId) return;

    return db.put('notes', {
      movieId,
      text,
      timestamp: Date.now()
    });
  },

  async getNote(movieId) {
    const db = await initDB();
    return db.get('notes', movieId);
  },

  // =========================
  // LIBRARY MERGE (🔥 OPTIMIZED)
  // =========================
  async getAllLibraryData() {
    const db = await initDB();

    const [movies, statuses, notes] = await Promise.all([
      db.getAll('movies'),
      db.getAll('status'),
      db.getAll('notes')
    ]);

    // 🔥 O(1) lookups (BIG improvement)
    const statusMap = new Map();
    const notesMap = new Map();

    statuses.forEach(s => {
      if (s.state) {
        statusMap.set(s.movieId, s);
      } else if (s.seen) {
        statusMap.set(s.movieId, { state: 'watched' });
      } else if (s.watchlist) {
        statusMap.set(s.movieId, { state: 'watchlist' });
      }
    });

    notes.forEach(n => {
      notesMap.set(n.movieId, n);
    });

    return movies.map(movie => ({
      ...movie,
      status: statusMap.get(movie.imdbID) || { state: null },
      note: notesMap.get(movie.imdbID) || { text: '' }
    }));
  },

  // =========================
  // OPTIONAL (🔥 FAST FILTER API)
  // =========================
  async getMoviesByState(state) {
    const db = await initDB();

    const index = db.transaction('status')
      .store
      .index('state');

    const results = await index.getAll(state);

    return results;
  },

  // =========================
  // RESET
  // =========================
  async resetAllData() {
    const db = await initDB();

    const tx = db.transaction(['movies', 'status', 'notes'], 'readwrite');

    await Promise.all([
      tx.objectStore('movies').clear(),
      tx.objectStore('status').clear(),
      tx.objectStore('notes').clear(),
      tx.done
    ]);
  }
};