import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import AftertasteModal from '../components/AftertasteModal';
import IconicQuoteOverlay from '../components/IconicQuoteOverlay';
import { searchMovies, fetchMovieDetails } from '../services/omdb';
import { dbService } from '../services/storage';

const FALLBACK = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop';

const Home = () => {
  // --- CORE LOGIC (UNTOUCHED) ---
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGallery = async () => {
    const data = await dbService.getAllLibraryData();
    setSavedMovies(data);
  };

  useEffect(() => { fetchGallery(); }, []);
  useEffect(() => { if (activeTab === 'gallery') fetchGallery(); }, [activeTab]);

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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = async (movie) => {
    setSelectedMovie(movie);
    let details = await dbService.getMovie(movie.imdbID);
    if (!details || !details.Runtime) {
      const fresh = await fetchMovieDetails(movie.imdbID);
      if (fresh) {
        await dbService.saveMovie(fresh);
        details = fresh;
      }
    }
    setSelectedMovie(details || movie);
  };

  const handleResetData = async () => {
    if (window.confirm("Reset your cinema?")) {
      await dbService.resetAllData();
      window.location.reload();
    }
  };

  const filteredMovies = savedMovies.filter(m => {
    if (filterType === 'seen') return m.status?.state === 'watched';
    if (filterType === 'watchlist') return m.status?.state === 'watchlist';
    return true;
  });
  // ------------------------------

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-white/20">
      
      {/* THE HEADER: Calligraphic & Spaced Properly */}
      <motion.div
        layout
        initial={false}
        animate={{
          top: activeTab === 'home' ? '15vh' : '2.5rem', // Uses viewport height to prevent overlap
          scale: activeTab === 'home' ? 1 : 0.5,
        }}
        transition={{ type: "spring", stiffness: 45, damping: 15 }}
        className="absolute w-full z-50 flex flex-col items-center justify-center pointer-events-none"
      >
        <h1 
          className="text-7xl md:text-8xl text-white tracking-wide drop-shadow-2xl"
          style={{ fontFamily: "'Rozha One', serif" }} // Beautiful high-contrast Devanagari
        >
          सिनेमा
        </h1>
        {activeTab === 'home' && (
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-6 text-[9px] uppercase tracking-[0.4em] text-white/40 font-light"
          >
            Personal Cinema
          </motion.p>
        )}
      </motion.div>

      <main className="flex-1 relative h-screen w-full">
        <AnimatePresence mode="wait">
          
          {/* HOME SCREEN: Pushed down to avoid logo */}
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center px-6 pt-[45vh]" // pt-[45vh] is the magic fix!
            >
              <div className="w-full max-w-md flex flex-col items-center space-y-16">
                
                {/* Ultra-minimal quote container */}
                <div className="w-full text-center flex flex-col items-center justify-center opacity-80">
                  <IconicQuoteOverlay />
                </div>

                {/* Minimalist Text Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('explore')}
                  className="group relative pb-2 text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
                >
                  Find Something Worth It
                  <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-white transition-all duration-500 group-hover:w-full group-hover:left-0"></span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* EXPLORE (Untouched structure, inherits minimalism) */}
          {activeTab === 'explore' && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-y-auto px-6 pt-32 pb-32 max-w-5xl mx-auto space-y-8"
            >
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              
              {loading ? (
                <CinematicLoader message="Consulting the archives..." />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {results.map((m, i) => (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      key={m.imdbID} onClick={() => handleSelect(m)} className="cursor-pointer group"
                    >
                      <img
                        src={m.Poster !== 'N/A' ? m.Poster : FALLBACK}
                        loading="lazy"
                        className="rounded-lg aspect-[2/3] object-cover w-full grayscale opacity-60 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                      <p className="text-[10px] mt-3 uppercase tracking-widest text-white/40 group-hover:text-white transition-colors truncate">{m.Title}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* GALLERY (Untouched structure, inherits minimalism) */}
          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col pt-32"
            >
              <div className="px-6 flex justify-between items-end mb-8 z-10 max-w-5xl mx-auto w-full">
                <div className="flex gap-6 border-b border-white/10 pb-3 w-full">
                  {['all', 'seen', 'watchlist'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${
                        filterType === type ? 'text-white' : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMovies.length > 0 ? (
                <div className="flex-1 overflow-y-auto px-6 pb-40 hide-scrollbar max-w-5xl mx-auto w-full">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {filteredMovies.map((m) => (
                      <motion.div 
                        key={m.imdbID} onClick={() => handleSelect(m)} whileTap={{ scale: 0.98 }} className="relative cursor-pointer group"
                      >
                        <img
                          src={m.Poster !== 'N/A' ? m.Poster : FALLBACK}
                          loading="lazy"
                          className="w-full aspect-[2/3] object-cover rounded-md grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-active:grayscale-0 group-active:opacity-100"
                        />
                        <div className="absolute top-3 right-3 flex gap-1">
                          {m.status?.state === 'watched' && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                          {m.status?.state === 'watchlist' && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/20">The vault is empty.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="hidden"><button onClick={handleResetData}>Reset</button></div>

      {selectedMovie && (
        <AftertasteModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onUpdate={fetchGallery} />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Home;