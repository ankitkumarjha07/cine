import React, { useState, useEffect } from 'react';
import HeroCard from '../components/HeroCard';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import AftertasteModal from '../components/AftertasteModal';
import { searchMovies, fetchMovieDetails, fetchRedditBuzz } from '../services/omdb';
import { dbService, initDB } from '../services/storage';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  
  // Modal States
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [redditData, setRedditData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Gallery Hydration (IndexedDB)
  useEffect(() => {
    const fetchGallery = async () => {
      if (activeTab === 'gallery') {
        const db = await initDB();
        const [statusList, movieList] = await Promise.all([
          db.getAll('status'), 
          db.getAll('movies')
        ]);
        const watchlistIds = statusList
          .filter(s => s.state === 'watchlist' || s.state === 'watched')
          .map(s => s.movieId);
        setSavedMovies(movieList.filter(m => watchlistIds.includes(m.imdbID)));
      }
    };
    fetchGallery();
  }, [activeTab]);

  // 2. Search Logic (Debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setLoading(true);
        const data = await searchMovies(searchQuery);
        setResults(data);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. FLUID SELECTION LOGIC (Instant Open)
  const handleSelect = (movie) => {
    // STEP A: Open Modal INSTANTLY with basic search data (Poster/Title/Year)
    setSelectedMovie(movie);
    setRedditData([]); // Reset buzz for the new selection

    // STEP B: Start heavy lifting in the background
    loadBackgroundData(movie);
  };

  const loadBackgroundData = async (movie) => {
    try {
      // 1. Check Cache first for immediate detail fill
      let details = await dbService.getMovie(movie.imdbID);
      
      if (details && details.Runtime) {
        setSelectedMovie(details);
      } else {
        // 2. Fetch from OMDB if not in cache
        const freshDetails = await fetchMovieDetails(movie.imdbID);
        if (freshDetails) {
          setSelectedMovie(freshDetails);
          await dbService.saveMovie(freshDetails);
        }
      }

      // 3. Fetch Reddit (Parallel/Non-blocking)
      const reddit = await fetchRedditBuzz(movie.Title);
      setRedditData(reddit);
    } catch (error) {
      console.error("Data hydration failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-gold-500/30 overflow-x-hidden">
      
      {/* HOME VIEW */}
      {activeTab === 'home' && (
        <HeroCard onSearchClick={() => setActiveTab('explore')} />
      )}
      
      {/* EXPLORE VIEW */}
      {activeTab === 'explore' && (
        <div className="p-6 max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">
          <SearchBar value={searchQuery} onChange={setSearchQuery} autoFocus />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {loading ? (
              <div className="col-span-full py-20 text-center animate-pulse text-gold-500/20 uppercase tracking-[0.4em] text-[10px]">
                Scanning archives...
              </div>
            ) : (
              results.map(m => (
                <div 
                  key={m.imdbID} 
                  onClick={() => handleSelect(m)} 
                  className="cursor-pointer group animate-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 bg-[#16161D] transition-all duration-500 group-hover:scale-[1.03] group-hover:border-white/20">
                    <img src={m.Poster} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" alt={m.Title} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[9px] uppercase tracking-widest font-black bg-white text-black px-4 py-2 rounded-full">Explore</span>
                    </div>
                  </div>
                  <div className="mt-4 px-2">
                    <p className="text-xs font-bold text-white/80 truncate">{m.Title}</p>
                    <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">{m.Year}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* GALLERY VIEW */}
      {activeTab === 'gallery' && (
        <div className="p-10 max-w-6xl mx-auto animate-in fade-in duration-700 pb-32">
          <h2 className="text-4xl font-hindi text-gold-500 mb-10 tracking-wide">आपकी गैलरी</h2>
          {savedMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {savedMovies.map(m => (
                <div key={m.imdbID} onClick={() => handleSelect(m)} className="cursor-pointer group">
                  <div className="aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 bg-[#16161D]">
                    <img src={m.Poster} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={m.Title} />
                  </div>
                  <p className="mt-4 text-xs font-bold px-2">{m.Title}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center opacity-20">
              <p className="italic font-light tracking-widest uppercase text-xs">Nothing has stayed with you yet.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL LAYER */}
      {selectedMovie && (
        <AftertasteModal 
          movie={selectedMovie} 
          reddit={redditData} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Home;