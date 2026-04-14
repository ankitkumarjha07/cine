const API_KEYS = ["b3d67077", "3437a7e5", "d809239d"];
let keyIndex = 0;
const TMDB_KEY = 'fbd22d95e28bebc1680a5792e47a1d92';
const BASE_URL = 'https://api.themoviedb.org/3';
const TRAKT_CLIENT_ID = "994000f1a909e6cc9a4f79d7cb59337ba11769f5ed29147d532fd7ebd2bb51f5";

const TRAKT_HEADERS = {
  "Content-Type": "application/json",
  "trakt-api-version": "2",
  "trakt-api-key": TRAKT_CLIENT_ID
};

const getApiKey = () => {
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex++;
  return key;
};

// 1. Search function (The one causing your error)
export const searchMovies = async (query) => {
  const key = getApiKey();
  try {
    const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${key}`);
    const data = await response.json();
    return data.Search || [];
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};

// 2. Detailed fetch (Includes RT Ratings)
export const fetchMovieDetails = async (imdbID) => {
  const key = getApiKey();
  try {
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${key}&plot=full&tomatoes=true`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Detail fetch failed:", error);
    return null;
  }
};
export const fetchTMDBReviews = async (imdbID) => {
  try {
    // 1. Find TMDB ID using the IMDb ID
    const findRes = await fetch(
      `${BASE_URL}/find/${imdbID}?api_key=${TMDB_KEY}&external_source=imdb_id`
    );
    const findData = await findRes.json();
    const movie = findData.movie_results[0];

    if (!movie) return [];

    // 2. Fetch the actual reviews
    const reviewRes = await fetch(
      `${BASE_URL}/movie/${movie.id}/reviews?api_key=${TMDB_KEY}`
    );
    const reviewData = await reviewRes.json();
    return reviewData.results.map(r => ({
      author: r.author,
      content: r.content,
      url: r.url,
      rating: r.author_details?.rating
    }));
  } catch (error) {
    console.error("TMDB Hydration failed", error);
    return [];
  }
};

export const fetchTraktMovie = async (imdbID) => {
    try {
      const res = await fetch(
        `https://api.trakt.tv/search/imdb/${imdbID}?type=movie`,
        { headers: TRAKT_HEADERS }
      );
  
      const data = await res.json();
  
      if (!data.length) return null;
  
      return data[0].movie;
    } catch (err) {
      console.error("Trakt movie fetch failed", err);
      return null;
    }
  };

  export const fetchTraktStats = async (traktId) => {
    try {
      const res = await fetch(
        `https://api.trakt.tv/movies/${traktId}/stats`,
        { headers: TRAKT_HEADERS }
      );
  
      return await res.json();
    } catch (err) {
      console.error("Trakt stats failed", err);
      return null;
    }
  };

  export const fetchTraktComments = async (traktId) => {
    try {
      const res = await fetch(
        `https://api.trakt.tv/movies/${traktId}/comments?limit=5`,
        { headers: TRAKT_HEADERS }
      );
  
      const data = await res.json();
  
      return data.map(c => ({
        user: c.user?.username,
        comment: c.comment,
        likes: c.likes
      }));
    } catch (err) {
      console.error("Trakt comments failed", err);
      return [];
    }
  };

  export const fetchTraktBuzz = async (imdbID) => {
    try {
      const movie = await fetchTraktMovie(imdbID);
      if (!movie) return null;
  
      const [stats, comments] = await Promise.all([
        fetchTraktStats(movie.ids.trakt),
        fetchTraktComments(movie.ids.trakt)
      ]);
  
      return {
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        votes: movie.votes,
        watchers: stats?.watchers,
        plays: stats?.plays,
        comments
      };
  
    } catch (err) {
      console.error("Trakt buzz failed", err);
      return null;
    }
  };