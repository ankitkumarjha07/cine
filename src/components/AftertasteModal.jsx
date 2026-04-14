import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Quote, PenTool, ExternalLink, Sparkles } from 'lucide-react';
import { dbService } from '../services/storage';

const AftertasteModal = ({ movie, reddit, onClose }) => {
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      const n = await dbService.getNote(movie.imdbID);
      if (n) setNote(n.text || '');
    };
    loadNote();
  }, [movie.imdbID]);

  const handleSave = async () => {
    setIsSaving(true);
    await dbService.saveNote(movie.imdbID, note);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const getDynamicInsight = () => {
    const genre = movie.Genre?.split(',')[0] || 'Cinematic';
    return `A ${genre} journey. Critics are calling it "${movie.Director}'s most ambitious work yet."`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
      {/* Main Modal Container */}
      <div className="relative w-full max-w-6xl bg-[#0B0B0F] rounded-[3rem] border border-white/10 flex flex-col md:flex-row h-[90vh] shadow-2xl overflow-hidden">
        
        {/* FIXED: High-Visibility Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all duration-300 shadow-xl border border-white/10"
        >
          <X size={24} />
        </button>
        
        {/* Left Side: Poster */}
        <div className="w-full md:w-[400px] relative flex-shrink-0 border-r border-white/5">
          <img src={movie.Poster} className="w-full h-full object-cover opacity-80" alt={movie.Title} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-transparent" />
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
            {/* REDDIT SECTION WITH REDIRECT LINKS */}
            <div className="space-y-5">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <MessageCircle size={14} className="text-orange-500" /> Reddit Discussion
              </h3>
              <div className="space-y-3">
                {reddit && reddit.length > 0 ? (
                  reddit.map((r, i) => (
                    <a 
                      key={i} 
                      href={r.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all border-l-2 border-orange-500/40"
                    >
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

            {/* CRITIC SECTION */}
            <div className="space-y-5">
              <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2">
                <PenTool size={14} className="text-green-500" /> Critic Sentiment
              </h3>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-green-500/40">
                "{getDynamicInsight()}"
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest mb-1">Director's Note</p>
                <p className="text-[10px] text-slate-500">Directed by {movie.Director}. Written by {movie.Writer?.split(',')[0]}.</p>
              </div>
            </div>
          </div>

          {/* AFTERTASTE WITH VISIBLE SAVE BUTTON */}
          <div className="space-y-6 pt-4">
            <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black flex items-center gap-2 text-gold-500">
              <Quote size={14} /> Your Aftertaste
            </h3>
            <div className="relative group">
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What stayed with you? Capture the feeling..."
                className="w-full bg-[#16161D] rounded-[2.5rem] p-8 text-sm text-slate-200 border border-white/5 focus:border-gold-500/40 outline-none h-44 transition-all resize-none"
              />
              
              {/* FIXED: Visible Save Button inside/below the textarea */}
              <div className="absolute bottom-6 right-6 flex items-center gap-4">
                {isSaving && <span className="text-[10px] text-gold-500 uppercase font-bold animate-pulse">Saved</span>}
                <button 
                  onClick={handleSave}
                  className="bg-gold-500 hover:bg-gold-400 text-black p-4 rounded-2xl transition-all active:scale-95 shadow-2xl flex items-center gap-2 font-bold text-xs"
                >
                  <Sparkles size={16} />
                  Capture Memory
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