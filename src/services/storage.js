import { openDB } from 'idb';

const DB_NAME = 'CinemaVault';
const STORE_NAME = 'movies';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'imdbID' });
        store.createIndex('status', 'status'); // 'watchlist', 'stayed', 'faded'
      }
    },
  });
};

export const movieStorage = {
  async save(movie) {
    const db = await initDB();
    return db.put(STORE_NAME, movie);
  },
  async getAll() {
    const db = await initDB();
    return db.getAll(STORE_NAME);
  },
  async delete(id) {
    const db = await initDB();
    return db.delete(STORE_NAME, id);
  }
};