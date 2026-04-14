const API_KEYS = ["b3d67077", "3437a7e5", "d809239d"];
let keyIndex = 0;

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

// 3. Reddit Buzz fetch
export const fetchRedditBuzz = async (movieTitle) => {
    try {
      // 1. Simplify the title to avoid encoding hell (remove special chars)
      const simplifiedTitle = movieTitle.replace(/[^a-zA-Z0-9 ]/g, "");
      const query = encodeURIComponent(`${simplifiedTitle} movie review`);
      
      // 2. Direct Reddit JSON URL
      const redditUrl = `https://www.reddit.com/r/movies/search.json?q=${query}&sort=relevance&limit=2`;
  
      // 3. Use corsproxy.io (Faster and returns direct JSON)
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(redditUrl)}`);
      
      if (!response.ok) throw new Error('Proxy failed');
      
      const data = await response.json();
  
      if (data.data && data.data.children) {
        return data.data.children.map(post => ({
          title: post.data.title,
          link: `https://reddit.com${post.data.permalink}`
        }));
      }
      return [];
    } catch (e) {
      console.error("Reddit fetch failed", e);
      // Return empty array so the UI skeleton just disappears rather than crashing
      return [];
    }
  };