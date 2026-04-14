import React, { useState, useEffect } from 'react';
import HeroCard from '../components/HeroCard';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import AftertasteModal from '../components/AftertasteModal';
import IconicQuoteOverlay from '../components/IconicQuoteOverlay'; 
import { searchMovies, fetchMovieDetails, fetchRedditBuzz } from '../services/omdb';
import { dbService } from '../services/storage';
import { LayoutGrid, Eye, Bookmark, ScanEye, Trash2, ShieldCheck, HardDrive } from 'lucide-react';
import CinematicLoader from '../components/CinematicLoader';

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

  const fetchGallery = async () => {
    try {
      const allData = await dbService.getAllLibraryData();
      setSavedMovies(allData);
    } catch (error) {
      console.error("Gallery hydration failed", error);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    if (activeTab === 'gallery') fetchGallery();
  }, [activeTab]);

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
    const message = `Are you sure? This action is final. All data is stored strictly on this device.`;
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
    <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-gold-500/30 flex flex-col overflow-x-hidden">
        
        <main className="flex-1 flex flex-col">
            {activeTab === 'home' && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 animate-in fade-in duration-1000">
                     
                     {/* LOGO SECTION: Reduced margins to prevent cropping */}
                     <div className="text-center mt-4 mb-6 space-y-2">
                            <h1 className="text-5xl md:text-7xl font-hindi text-gold-500 tracking-widest drop-shadow-2xl">सिनेमा</h1>
                            <p className="text-[9px] md:text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold">Personal Cinema</p>
                    </div>

                    {/* QUOTE CARD: Width adjusted for mobile, height flexed */}
                    <div className="w-full max-w-[420px] md:max-w-[650px] mb-8">
                         <IconicQuoteOverlay />
                    </div>

                    {/* ACTION BUTTON: Compacted padding */}
                    <button 
                        onClick={() => setActiveTab('explore')}
                        className="group relative flex items-center justify-center gap-4 px-8 py-4 md:px-12 md:py-5 bg-white text-black rounded-full font-black transition-all hover:bg-gold-500 active:scale-95 shadow-2xl"
                    >
                        <span className="text-[10px] md:text-[11px] uppercase tracking-[0.2em]">Find something worth it</span>
                        <div className="w-8 md:w-12 h-[1px] bg-black/20 group-hover:bg-black transition-all" />
                    </button>
                </div>
            )}
            
            {activeTab === 'explore' && (
  <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500 flex-1">
    <SearchBar value={searchQuery} onChange={setSearchQuery} autoFocus />
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12">
      {loading ? (
        <div className="col-span-full py-10">
          <CinematicLoader message="Consulting the Archives" />
        </div>
      ) : (
        results.map((m) => {
          const posterSrc = m.Poster && m.Poster !== 'N/A' ? m.Poster : ARTISTIC_FALLBACK;
          return (
            <div 
              key={m.imdbID} 
              onClick={() => handleSelect(m)} 
              className="cursor-pointer group cinematic-entry"
            >
              <div className="relative aspect-[2/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 bg-[#121217] transition-all duration-500 group-hover:scale-[1.03] group-hover:border-white/20">
                <img 
                  src={posterSrc} 
                  onError={(e) => { e.target.src = ARTISTIC_FALLBACK; }} 
                  className="w-full h-full object-cover" 
                  alt={m.Title} 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ScanEye size={24} className="text-gold-500" />
                </div>
              </div>
              <div className="mt-3 px-2 text-center text-white/80">
                <p className="text-[10px] md:text-xs font-bold truncate">{m.Title}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}

            {activeTab === 'gallery' && (
                <div className="p-6 md:p-10 max-w-6xl mx-auto animate-in fade-in duration-700 flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <h2 className="text-3xl md:text-4xl font-hindi text-gold-500 tracking-wide">आपकी गैलरी</h2>
                        <div className="flex p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-x-auto max-w-full">
                            {[{ id: 'all', label: 'All', icon: <LayoutGrid size={12} /> }, { id: 'seen', label: 'Seen', icon: <Eye size={12} /> }, { id: 'watchlist', label: 'Watchlist', icon: <Bookmark size={12} /> }].map((btn) => (
                                <button key={btn.id} onClick={() => setFilterType(btn.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filterType === btn.id ? 'bg-gold-500 text-black' : 'text-slate-400'}`}>
                                    {btn.icon} {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {filteredMovies.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {filteredMovies.map(m => {
                                const posterSrc = m.Poster && m.Poster !== 'N/A' ? m.Poster : ARTISTIC_FALLBACK;
                                return (
                                    <div key={m.imdbID} onClick={() => handleSelect(m)} className="cursor-pointer group relative">
                                        <div className="aspect-[2/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 bg-[#121217] transition-all group-hover:border-white/20">
                                            <img src={posterSrc} onError={(e) => { e.target.src = ARTISTIC_FALLBACK; }} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={m.Title} />
                                        </div>
                                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                                            {m.status?.seen && <div className="p-1.5 bg-green-500/80 backdrop-blur-sm rounded-full text-black"><Eye size={10}/></div>}
                                            {m.status?.watchlist && <div className="p-1.5 bg-gold-500/80 backdrop-blur-sm rounded-full text-black"><Bookmark size={10}/></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center opacity-20 font-light tracking-widest uppercase text-[10px]">Library is quiet.</div>
                    )}
                </div>
            )}

            {/* GLOBAL PRIVACY FOOTER */}
            {/* --- UPDATED FOOTER SECTION --- */}
            <footer className="mt-auto px-10 pb-32 pt-10">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
                
                <div className="space-y-4">
                {/* 100% Cloud-Free Badge */}
                <div className="flex items-center justify-center gap-2 py-1 px-3 bg-gold-500/5 rounded-full border border-gold-500/10">
                    <ShieldCheck size={10} className="text-gold-500" />
                    <span className="text-[7px] md:text-[8px] uppercase tracking-[0.3em] text-gold-500 font-bold">
                    100% Cloud-Free Sanctuary
                    </span>
                </div>

                <p className="max-w-xs mx-auto text-[10px] md:text-[11px] text-slate-500 font-light italic leading-relaxed px-2">
                    "No shadows are cast on servers. Your cinematic journey is a ghost—visible only to you, etched forever in this device's private vault."
                </p>
                
                <div className="flex items-center justify-center gap-4 text-[7px] text-slate-700 uppercase tracking-widest font-bold">
                    <span>Zero External Tracking</span>
                    <div className="w-1 h-1 rounded-full bg-gold-500/20" />
                    <span>Local Encryption</span>
                </div>
                </div>

                {savedMovies.length > 0 && (
                <button 
                    onClick={handleResetData} 
                    className="group flex items-center gap-2 text-[8px] uppercase tracking-[0.3em] text-red-500/10 hover:text-red-500 transition-all duration-700 pt-4"
                >
                    <Trash2 size={10} className="opacity-30 group-hover:opacity-100" /> 
                    Purge Local Archives
                </button>
                )}
            </div>
            </footer>
        </main>

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