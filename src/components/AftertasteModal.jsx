import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Quote, PenTool, ExternalLink, Sparkles, CheckCircle2, Bookmark, Star, ChevronDown, Loader2 } from 'lucide-react';
import { dbService } from '../services/storage';
import { fetchMovieDetails } from '../services/omdb'; // Ensure this is imported

const FALLBACK_ART = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop';

const AftertasteModal = ({ movie: initialMovie, reddit, onClose, onUpdate }) => {
  const [movie, setMovie] = useState(initialMovie);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [status, setStatus] = useState({ seen: false, watchlist: false });

  // 1. DATA HYDRATION: Fetch full details if ratings are missing
  useEffect(() => {
    const hydrateData = async () => {
      if (!initialMovie?.imdbID) return;
      
      setDetailsLoading(true);
      try {
        // Load local status/notes
        const [savedNote, savedStatus] = await Promise.all([
          dbService.getNote(initialMovie.imdbID),
          dbService.getStatus(initialMovie.imdbID)
        ]);
        if (savedNote) setNote(savedNote.text || '');
        if (savedStatus) setStatus(savedStatus);

        // Fetch full OMDB details if current object is just search results
        if (!initialMovie.Ratings || !initialMovie.Plot || initialMovie.Plot === 'N/A') {
          const fullData = await fetchMovieDetails(initialMovie.imdbID);
          if (fullData) setMovie(fullData);
        }
      } catch (error) {
        console.error("Hydration failed:", error);
      } finally {
        setDetailsLoading(false);
      }
    };
    hydrateData();
  }, [initialMovie.imdbID]);

  const getRating = (source) => {
    if (!movie.Ratings) return "N/A";
    const found = movie.Ratings.find(r => r.Source.toLowerCase().includes(source.toLowerCase()));
    return found ? found.Value : "N/A";
  };

  const handleToggleStatus = async (type) => {
    const newStatus = { ...status, [type]: !status[type] };
    setStatus(newStatus);
    await dbService.updateStatus(movie.imdbID, newStatus);
    if (onUpdate) onUpdate(); 
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    await dbService.saveNote(movie.imdbID, note);
    if (onUpdate) onUpdate(); 
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/98 backdrop-blur-3xl p-0 md:p-6 animate-in fade-in duration-300">
      
      {/* Container: Changed to h-full on mobile to prevent cropping */}
      <div className="relative w-full max-w-5xl bg-[#0B0B0F] rounded-t-[2.5rem] md:rounded-[3rem] border border-white/10 flex flex-col md:flex-row h-full md:h-[90vh] shadow-2xl overflow-hidden">
        
        {/* Close Button: Higher Z-index and safe area padding */}
        <button onClick={onClose} className="absolute top-5 right-5 z-[120] p-3 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-all border border-white/10 backdrop-blur-md">
          <X size={20} />
        </button>
        
        {/* Left/Top Section: Fixed Height Image to prevent content squash */}
        <div className="w-full md:w-[380px] h-[30vh] md:h-full relative flex-shrink-0 bg-[#121217]">
          <img 
            src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : FALLBACK_ART} 
            className="w-full h-full object-cover opacity-60 md:opacity-100" 
            alt={movie.Title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0B0B0F]/20" />
          
          <div className="hidden md:flex absolute bottom-10 left-0 right-0 px-8 flex-col gap-3">
             <button onClick={() => handleToggleStatus('seen')} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${status.seen ? 'bg-green-500 text-black' : 'bg-white/5 text-white border border-white/10'}`}>
              <CheckCircle2 size={16} /> {status.seen ? 'Watched' : 'Mark as Seen'}
            </button>
            <button onClick={() => handleToggleStatus('watchlist')} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${status.watchlist ? 'bg-amber-500 text-black' : 'bg-white/5 text-white border border-white/10'}`}>
              <Bookmark size={16} /> {status.watchlist ? 'In Library' : 'Save for Later'}
            </button>
          </div>
        </div>

        {/* Right/Main Section: Content with padding bottom for mobile browser bars */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#0B0B0F]">
          <div className="flex-1 overflow-y-auto p-6 md:p-14 space-y-8 md:space-y-12 custom-scrollbar pb-32 md:pb-14">
            
            {/* Status Buttons for Mobile */}
            <div className="flex md:hidden gap-3 -mt-10 relative z-20 mb-4">
              <button onClick={() => handleToggleStatus('seen')} className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-2xl ${status.seen ? 'bg-green-500 text-black' : 'bg-[#16161D] text-white border border-white/10'}`}>
                <CheckCircle2 size={14} /> {status.seen ? 'Seen' : 'Watch'}
              </button>
              <button onClick={() => handleToggleStatus('watchlist')} className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-2xl ${status.watchlist ? 'bg-amber-500 text-black' : 'bg-[#16161D] text-white border border-white/10'}`}>
                <Bookmark size={14} /> {status.watchlist ? 'Saved' : 'Save'}
              </button>
            </div>

            <header className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">{movie.Title}</h2>
              <p className="text-slate-500 text-[9px] md:text-xs tracking-[0.4em] uppercase font-bold flex flex-wrap gap-2">
                <span>{movie.Year}</span> <span>•</span> <span>{movie.Runtime}</span> <span>•</span> <span>{movie.Genre}</span>
              </p>
            </header>

            {/* RATINGS GRID */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {[
                { label: 'IMDb', val: getRating('Internet Movie Database'), color: 'text-gold-500' },
                { label: 'Rotten', val: getRating('Rotten Tomatoes'), color: 'text-red-500' },
                { label: 'Metacritic', val: getRating('Metacritic'), color: 'text-blue-500' }
              ].map((r, i) => (
                <div key={i} className="bg-white/[0.03] p-3 md:p-4 rounded-2xl border border-white/5 text-center flex flex-col justify-center">
                  <p className={`text-[7px] md:text-[9px] ${r.color}/60 uppercase tracking-widest mb-1 font-bold`}>{r.label}</p>
                  <p className="text-xs md:text-sm font-bold text-white">
                    {detailsLoading ? <Loader2 size={10} className="animate-spin mx-auto" /> : r.val}
                  </p>
                </div>
              ))}
            </div>

            {/* CRITIC / PLOT SECTION */}
            <div className="space-y-4">
               <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <PenTool size={14} className="text-green-500" /> Plot & Sentiment
              </h3>
              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 text-[11px] md:text-xs text-slate-400 leading-relaxed italic border-l-2 border-green-500/40">
                {detailsLoading ? "Consulting archives..." : movie.Plot || "Plot details unavailable."}
              </div>
            </div>

            {/* NOTE / AFTERTASTE SECTION */}
            <div className="space-y-5">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <Quote size={14} className="text-amber-500" /> Your Aftertaste
              </h3>
              <div className="relative">
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="The credits are rolling... what stayed with you?"
                  className="w-full bg-[#16161D] rounded-3xl p-6 text-sm text-slate-200 border border-white/5 focus:border-amber-500/40 outline-none h-40 transition-all resize-none shadow-inner"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  {isSaving && <span className="text-[9px] text-amber-500 uppercase font-black animate-pulse">Archiving...</span>}
                  <button onClick={handleSaveNote} className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-xl transition-all active:scale-95 shadow-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter">
                    <Sparkles size={14} /> Capture
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AftertasteModal;