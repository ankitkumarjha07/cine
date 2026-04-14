import { openDB } from 'idb';

const DB_NAME = 'cinema-db';

export const initDB = async () => {
  try {
    return await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('movies')) {
          db.createObjectStore('movies', { keyPath: 'imdbID' });
        }
        if (!db.objectStoreNames.contains('status')) {
          db.createObjectStore('status', { keyPath: 'movieId' });
        }
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'movieId' });
        }
      },
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

export const dbService = {
  // GET single movie
  async getMovie(id) {
    const db = await initDB();
    return db.get('movies', id);
  },

  // SAVE movie
  async saveMovie(movie) {
    const db = await initDB();
    return db.put('movies', movie);
  },

  // STATUS (Seen / Watchlist)
  async updateStatus(movieId, statusObj) {
    const db = await initDB();
    // statusObj looks like: { seen: true, watchlist: false }
    return db.put('status', { 
      movieId, 
      ...statusObj, 
      updated: Date.now() 
    });
  },

  async getStatus(movieId) {
    const db = await initDB();
    const data = await db.get('status', movieId);
    return data || { seen: false, watchlist: false };
  },

  // NOTES (Aftertaste)
  async saveNote(movieId, text) {
    const db = await initDB();
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

  /**
   * NEW: Fetch all movies and join them with their status and notes.
   * This is what powers your Gallery Filters.
   */
  async getAllLibraryData() {
    const db = await initDB();
    
    // Fetch all data from all stores in parallel
    const [movies, statuses, notes] = await Promise.all([
      db.getAll('movies'),
      db.getAll('status'),
      db.getAll('notes')
    ]);

    // Merge the arrays into a single list of objects
    return movies.map(movie => {
      const status = statuses.find(s => s.movieId === movie.imdbID);
      const note = notes.find(n => n.movieId === movie.imdbID);
      
      return {
        ...movie,
        status: status || { seen: false, watchlist: false },
        note: note || { text: '' }
      };
    });
  },

  async resetAllData() {
    const db = await initDB();
    // Deleting all data from all stores
    const tx = db.transaction(['movies', 'status', 'notes'], 'readwrite');
    await Promise.all([
      tx.objectStore('movies').clear(),
      tx.objectStore('status').clear(),
      tx.objectStore('notes').clear(),
      tx.done
    ]);
  }
};