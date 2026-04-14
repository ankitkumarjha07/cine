import React, { useState, useEffect } from 'react';
import HeroCard from '../components/HeroCard';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import AftertasteModal from '../components/AftertasteModal';
import { searchMovies, fetchMovieDetails, fetchRedditBuzz } from '../services/omdb';
import { dbService } from '../services/storage';
import { LayoutGrid, Eye, Bookmark, ScanEye, Trash2, ShieldCheck, HardDrive } from 'lucide-react';

const ARTISTIC_FALLBACK = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [filterType, setFilterType] = useState('all');
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [redditData, setRedditData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Gallery Hydration
  const fetchGallery = async () => {
    try {
      const allData = await dbService.getAllLibraryData();
      setSavedMovies(allData);
    } catch (error) {
      console.error("Gallery hydration failed", error);
    }
  };

  useEffect(() => {
    fetchGallery(); // Fetch on mount to check for "Purge" visibility globally
  }, []);

  useEffect(() => {
    if (activeTab === 'gallery') fetchGallery();
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

  const handleSelect = (movie) => {
    setSelectedMovie(movie);
    setRedditData([]); 
    loadBackgroundData(movie);
  };

  const loadBackgroundData = async (movie) => {
    try {
      let details = await dbService.getMovie(movie.imdbID);
      if (details && details.Runtime) {
        setSelectedMovie(details);
      } else {
        const freshDetails = await fetchMovieDetails(movie.imdbID);
        if (freshDetails) {
          setSelectedMovie(freshDetails);
          await dbService.saveMovie(freshDetails);
        }
      }
      const reddit = await fetchRedditBuzz(movie.Title);
      setRedditData(reddit);
    } catch (error) {
      console.error("Data hydration failed", error);
    }
  };

  const handleResetData = async () => {
    const message = `Are you sure? This action is final.\n\nTo protect your privacy, all your data is stored strictly on this device. Clearing this will permanently erase your cinematic journey. We cannot restore this data once it's gone.`;
    if (window.confirm(message)) {
      await dbService.resetAllData();
      window.location.reload(); 
    }
  };

  const filteredMovies = savedMovies.filter(m => {
    if (filterType === 'seen') return m.status?.seen;
    if (filterType === 'watchlist') return m.status?.watchlist;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-gold-500/30 flex flex-col">
      
      {/* SCROLLABLE CONTENT AREA */}
      <main className="flex-1 pb-40">
        {activeTab === 'home' && (
          <HeroCard onSearchClick={() => setActiveTab('explore')} />
        )}
        
        {activeTab === 'explore' && (
          <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
            <SearchBar value={searchQuery} onChange={setSearchQuery} autoFocus />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {loading ? (
                <div className="col-span-full py-20 text-center animate-pulse text-gold-500/20 uppercase tracking-[0.4em] text-[10px]">Scanning archives...</div>
              ) : (
                results.map(m => {
                  const posterSrc = m.Poster && m.Poster !== 'N/A' ? m.Poster : ARTISTIC_FALLBACK;
                  return (
                    <div key={m.imdbID} onClick={() => handleSelect(m)} className="cursor-pointer group animate-in slide-in-from-bottom-4 duration-500">
                      <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 bg-[#121217] transition-all duration-500 group-hover:scale-[1.03] group-hover:border-white/20">
                        <img src={posterSrc} onError={(e) => { e.target.src = ARTISTIC_FALLBACK; }} className="w-full h-full object-cover" alt={m.Title} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ScanEye size={24} className="text-gold-500" />
                        </div>
                      </div>
                      <div className="mt-4 px-2 text-center text-white/80"><p className="text-xs font-bold truncate">{m.Title}</p></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="p-10 max-w-6xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
              <h2 className="text-4xl font-hindi text-gold-500 tracking-wide">आपकी गैलरी</h2>
              <div className="flex p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                {[{ id: 'all', label: 'All', icon: <LayoutGrid size={14} /> }, { id: 'seen', label: 'Seen', icon: <Eye size={14} /> }, { id: 'watchlist', label: 'Watchlist', icon: <Bookmark size={14} /> }].map((btn) => (
                  <button key={btn.id} onClick={() => setFilterType(btn.id)} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filterType === btn.id ? 'bg-gold-500 text-black' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>
            {filteredMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {filteredMovies.map(m => {
                  const posterSrc = m.Poster && m.Poster !== 'N/A' ? m.Poster : ARTISTIC_FALLBACK;
                  return (
                    <div key={m.imdbID} onClick={() => handleSelect(m)} className="cursor-pointer group relative">
                      <div className="aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 bg-[#121217] transition-all group-hover:border-white/20">
                        <img src={posterSrc} onError={(e) => { e.target.src = ARTISTIC_FALLBACK; }} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={m.Title} />
                      </div>
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        {m.status?.seen && <div className="p-2 bg-green-500/80 backdrop-blur-sm rounded-full text-black"><Eye size={12}/></div>}
                        {m.status?.watchlist && <div className="p-2 bg-gold-500/80 backdrop-blur-sm rounded-full text-black"><Bookmark size={12}/></div>}
                      </div>
                      <div className="mt-4 px-2 text-center text-white/90"><p className="text-xs font-bold truncate">{m.Title}</p></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center opacity-20"><p className="italic font-light tracking-widest uppercase text-xs">Library is quiet.</p></div>
            )}
          </div>
        )}

        {/* GLOBAL PRIVACY FOOTER (Outside Tab Logic) */}
        <footer className="mt-20 px-10 pb-10 space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
            <div className="space-y-3">
              <div className="flex justify-center gap-3 text-gold-500/40 mb-2">
                <ShieldCheck size={18} /><HardDrive size={18} />
              </div>
              <p className="text-[10px] text-gold-500/60 uppercase tracking-[0.5em] font-bold">Cinema Sanctuary</p>
              <p className="max-w-sm mx-auto text-[11px] text-slate-500 font-light leading-relaxed italic">
                "Every 'Aftertaste' and every memory is etched into your device's private vault. We don't track, we don't store, and we don't watch back. Your journey is yours alone."
              </p>
            </div>
            <div className="flex items-center gap-4 text-[9px] text-slate-600 uppercase tracking-widest font-bold">
              <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500/50" /> Local Encrypted Storage</span>
              <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500/50" /> Zero Cloud Footprint</span>
            </div>
          </div>

          {/* Purge button only shows if data exists, globally */}
          {savedMovies.length > 0 && (
            <div className="flex justify-center border-t border-white/[0.03] pt-12">
              <button onClick={handleResetData} className="group flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-black text-red-500/20 hover:text-red-500 transition-all duration-700">
                <Trash2 size={12} className="opacity-40 group-hover:opacity-100" /> Purge Local Archives
              </button>
            </div>
          )}
        </footer>
      </main>

      {/* MODAL LAYER */}
      {selectedMovie && (
        <AftertasteModal 
          movie={selectedMovie} 
          reddit={redditData} 
          onClose={() => setSelectedMovie(null)} 
          onUpdate={fetchGallery} 
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Home;