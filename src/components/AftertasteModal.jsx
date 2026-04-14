import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Quote, PenTool, ExternalLink, Sparkles, CheckCircle2, Bookmark } from 'lucide-react';
import { dbService } from '../services/storage';

// High-quality cinematic fallback
const FALLBACK_ART = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop';

const AftertasteModal = ({ movie, reddit, onClose, onUpdate }) => {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ seen: false, watchlist: false });

  useEffect(() => {
    const loadPersistedData = async () => {
      if (!movie?.imdbID) return;
      try {
        const [savedNote, savedStatus] = await Promise.all([
          dbService.getNote(movie.imdbID),
          dbService.getStatus(movie.imdbID)
        ]);
        if (savedNote) setNote(savedNote.text || '');
        if (savedStatus) setStatus(savedStatus);
      } catch (error) {
        console.error("Hydration failed:", error);
      }
    };
    loadPersistedData();
  }, [movie.imdbID]);

  const handleSaveNote = async () => {
    setIsSaving(true);
    await dbService.saveNote(movie.imdbID, note);
    if (onUpdate) await onUpdate(); 
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleToggleStatus = async (type) => {
    const newStatus = { ...status, [type]: !status[type] };
    setStatus(newStatus);
    await dbService.updateStatus(movie.imdbID, newStatus);
    if (onUpdate) await onUpdate(); 
  };

  // Image URL logic
  const posterSrc = movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : FALLBACK_ART;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl bg-[#0B0B0F] rounded-[3rem] border border-white/10 flex flex-col md:flex-row h-[90vh] shadow-2xl overflow-hidden">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all duration-300 border border-white/10">
          <X size={24} />
        </button>
        
        {/* Left Side: Poster with Fallback */}
        <div className="w-full md:w-[400px] relative flex-shrink-0 border-r border-white/5 bg-[#121217]">
          <img 
            src={posterSrc} 
            onError={(e) => { e.target.src = FALLBACK_ART; }}
            className="w-full h-full object-cover opacity-80" 
            alt={movie.Title} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent" />
          
          <div className="absolute bottom-10 left-0 right-0 px-8 flex flex-col gap-3">
            <button onClick={() => handleToggleStatus('seen')} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${status.seen ? 'bg-green-500 text-black' : 'bg-white/5 text-white border border-white/10'}`}>
              <CheckCircle2 size={16} /> {status.seen ? 'Watched' : 'Mark as Seen'}
            </button>
            <button onClick={() => handleToggleStatus('watchlist')} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${status.watchlist ? 'bg-amber-500 text-black' : 'bg-white/5 text-white border border-white/10'}`}>
              <Bookmark size={16} /> {status.watchlist ? 'In Library' : 'Save for Later'}
            </button>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-8 md:p-16 overflow-y-auto space-y-12 custom-scrollbar">
          <header className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-white">{movie.Title}</h2>
            <p className="text-slate-500 text-xs tracking-[0.4em] uppercase font-light">
              {movie.Year} • {movie.Runtime} • {movie.Genre}
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <MessageCircle size={14} className="text-orange-500" /> Reddit Discussion
              </h3>
              <div className="space-y-3">
                {reddit && reddit.length > 0 ? (
                  reddit.slice(0, 3).map((r, i) => (
                    <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="group block bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all border-l-2 border-orange-500/40">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-[11px] text-slate-400 leading-relaxed italic group-hover:text-slate-200">"{r.title}"</p>
                        <ExternalLink size={12} className="text-slate-600 group-hover:text-orange-500 flex-shrink-0" />
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 italic">No threads found.</p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <PenTool size={14} className="text-green-500" /> Critic Sentiment
              </h3>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-green-500/40">
                "A cinematic journey. Critics are calling it a bold exploration of its themes."
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
              <Quote size={14} className="text-amber-500" /> Your Aftertaste
            </h3>
            <div className="relative group">
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What stayed with you?..."
                className="w-full bg-[#16161D] rounded-[2.5rem] p-8 text-sm text-slate-200 border border-white/5 focus:border-amber-500/40 outline-none h-44 transition-all resize-none"
              />
              <div className="absolute bottom-6 right-6 flex items-center gap-4">
                {isSaving && <span className="text-[10px] text-amber-500 uppercase font-bold animate-pulse">Saving...</span>}
                <button onClick={handleSaveNote} className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-2xl flex items-center gap-2 font-bold text-xs">
                  <Sparkles size={16} /> Capture Aftertaste
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AftertasteModal;