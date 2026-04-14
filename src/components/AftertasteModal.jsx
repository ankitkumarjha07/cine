import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Loader2, Bookmark, Eye, EyeOff, Check, ThumbsUp, Film } from 'lucide-react';
import { dbService } from '../services/storage';
import { fetchTraktBuzz, fetchMovieDetails } from '../services/omdb';

const FALLBACK =
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop';

const STATUS_CONFIG = {
  watched:   { icon: Check,    label: 'Watched',   gradient: 'from-emerald-500/20 to-emerald-500/5', ring: 'ring-emerald-400/50', text: 'text-emerald-300', glow: 'shadow-[0_0_24px_rgba(52,211,153,0.18)]' },
  watchlist: { icon: Bookmark, label: 'Watchlist', gradient: 'from-violet-500/20 to-violet-500/5',   ring: 'ring-violet-400/50',  text: 'text-violet-300',  glow: 'shadow-[0_0_24px_rgba(167,139,250,0.18)]' },
  skipped:   { icon: EyeOff,   label: 'Skip It',   gradient: 'from-rose-500/20 to-rose-500/5',       ring: 'ring-rose-400/50',    text: 'text-rose-300',    glow: 'shadow-[0_0_24px_rgba(251,113,133,0.18)]' },
};

/* Thin horizontal scan line that sweeps once on mount */
function ScanLine() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[60] h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      style={{ animation: 'scanline 1.8s cubic-bezier(.4,0,.6,1) forwards' }}
    />
  );
}

/* Subtle static-noise overlay using a tiny SVG data URI */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

export default function AftertasteModal({ movie: initialMovie, onClose, onUpdate }) {
  const [movie, setMovie]       = useState(initialMovie);
  const [note, setNote]         = useState('');
  const [status, setStatus]     = useState({ state: null });
  const [buzz, setBuzz]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [visible, setVisible]   = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const textRef = useRef(null);

  const getRating = (source) =>
    movie?.Ratings?.find(r => r.Source.toLowerCase().includes(source.toLowerCase()))?.Value || null;

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    const hydrate = async () => {
      if (!initialMovie?.imdbID) return;
      try {
        setLoading(true);
        const [noteData, statusData, trakt, full] = await Promise.all([
          dbService.getNote(initialMovie.imdbID),
          dbService.getStatus(initialMovie.imdbID),
          fetchTraktBuzz(initialMovie.imdbID),
          fetchMovieDetails(initialMovie.imdbID),
        ]);
        if (noteData)   setNote(noteData.text || '');
        if (statusData) setStatus(statusData);
        if (full)       setMovie(full);
        setBuzz(trakt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [initialMovie.imdbID]);

  const handleClose  = () => { setVisible(false); setTimeout(onClose, 380); };
  const handleStatus = async (state) => {
    setStatus({ state });
    await dbService.updateStatus(movie.imdbID, { state });
    onUpdate?.();
  };
  const handleSave = async () => {
    setSaving(true);
    await dbService.saveNote(movie.imdbID, note);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const poster   = movie?.Poster !== 'N/A' ? movie?.Poster : FALLBACK;
  const comments = buzz?.comments || [];

  return (
    <>
      {/* ── Keyframe injected once ── */}
      <style>{`
        @keyframes scanline {
          0%   { top: 0%;   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes letterboxIn {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .fade-up {
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }
        .delay-5 { animation-delay: 0.42s; }
        .letterbox {
          transform-origin: left;
          animation: letterboxIn 0.6s cubic-bezier(.16,1,.3,1) forwards;
        }
      `}</style>

      {/* ── BACKDROP ── */}
      <div
        className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center
          transition-all duration-400 ease-out
          ${visible ? 'bg-black/85 backdrop-blur-lg' : 'bg-black/0 backdrop-blur-none'}`}
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        {/* ── CARD ── */}
        <div
          className={`
            relative w-full max-w-4xl overflow-hidden
            rounded-t-[2rem] md:rounded-[2rem]
            border border-white/[0.08]
            shadow-[0_60px_160px_rgba(0,0,0,0.95),0_0_0_0.5px_rgba(255,255,255,0.05)_inset]
            transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]
            ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-[0.96]'}
            flex flex-col md:flex-row max-h-[95dvh] md:max-h-[88dvh]
          `}
          style={{ background: '#07070A' }}
        >
          {/* Scan line sweeps on open */}
          {visible && <ScanLine />}

          {/* Film-grain noise layer */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-[0.025] mix-blend-overlay"
            style={{ backgroundImage: NOISE_SVG, backgroundSize: '180px 180px' }}
          />

          {/* Letterbox bars (top + bottom) */}
          <div className="pointer-events-none absolute top-0 inset-x-0 z-[2] h-[3px] bg-white/[0.06] letterbox" />
          <div className="pointer-events-none absolute bottom-0 inset-x-0 z-[2] h-[3px] bg-white/[0.06] letterbox" />

          {/* ── POSTER COLUMN ── */}
          <div className="relative w-full md:w-[280px] shrink-0 h-[210px] md:h-auto overflow-hidden">
            {/* Ambient blurred bg that picks up the poster's palette */}
            <img
              src={poster} aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 saturate-200"
            />
            {/* Sharp poster — fade in once loaded */}
            <img
              src={poster}
              alt={movie.Title}
              onLoad={() => setPosterLoaded(true)}
              className={`relative z-10 w-full h-full object-cover md:object-contain object-top
                transition-opacity duration-700
                ${posterLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Vignette */}
            <div className="absolute inset-0 z-20 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)' }} />
            {/* Directional fade into content column */}
            <div className="absolute inset-0 z-20 pointer-events-none
              bg-gradient-to-b from-transparent via-transparent to-[#07070A]
              md:bg-gradient-to-r md:from-transparent md:to-[#07070A]" />

            {/* Film strip sprocket holes (decorative) */}
            <div className="hidden md:flex absolute left-0 top-0 bottom-0 z-30 w-5 flex-col justify-around py-3 opacity-20">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="mx-auto w-2.5 h-3.5 rounded-[2px] bg-black border border-white/30" />
              ))}
            </div>
          </div>

          {/* ── CONTENT COLUMN ── */}
          <div className="relative z-10 flex-1 flex flex-col min-h-0">

            {/* Close */}
            <button onClick={handleClose} aria-label="Close"
              className="absolute top-5 right-5 z-50 w-9 h-9 flex items-center justify-center
                rounded-full bg-white/5 border border-white/10
                text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200">
              <X size={15} />
            </button>

            <div className="flex-1 overflow-y-auto overscroll-contain
              px-6 pt-6 pb-10 md:px-10 md:pt-10 space-y-7
              scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

              {/* META */}
              <div className="space-y-2 pr-10 fade-up delay-1">
                {/* Thin accent rule */}
                <div className="flex items-center gap-3 mb-3">
                  <Film size={11} className="text-white/20" />
                  <div className="flex-1 h-px bg-gradient-to-r from-white/15 to-transparent" />
                </div>

                <p className="text-[11px] tracking-[0.22em] uppercase text-white/30 font-medium">
                  {movie.Year}{movie.Runtime && <> &nbsp;·&nbsp; {movie.Runtime}</>}
                </p>

                <h2 className="text-2xl md:text-4xl font-bold leading-tight tracking-tight text-white"
                  style={{ textShadow: '0 2px 24px rgba(0,0,0,0.8)' }}>
                  {movie.Title}
                </h2>

                {movie.Genre && (
                  <p className="text-[12px] text-white/30 tracking-wide">{movie.Genre}</p>
                )}

                <div className="flex gap-2 flex-wrap pt-1">
                  {movie.imdbRating && <RatingPill color="yellow" label="IMDb" value={movie.imdbRating} />}
                  {getRating('Rotten') && <RatingPill color="red" label="RT" value={getRating('Rotten')} />}
                  {getRating('Meta')   && <RatingPill color="green" label="MC" value={getRating('Meta')} />}
                </div>
              </div>

              {/* STATUS */}
              <div className="fade-up delay-2">
                <SectionLabel>Your take</SectionLabel>
                <div className="grid grid-cols-3 gap-2.5 mt-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const Icon   = cfg.icon;
                    const active = status.state === key;
                    return (
                      <button key={key} onClick={() => handleStatus(key)}
                        className={`relative flex flex-col items-center gap-1.5 py-3.5 rounded-2xl
                          text-[11px] tracking-widest uppercase border
                          transition-all duration-300 overflow-hidden
                          ${active
                            ? `bg-gradient-to-b ${cfg.gradient} ${cfg.ring} ring-1 border-transparent ${cfg.text} ${cfg.glow}`
                            : 'bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                          }`}>
                        <Icon size={16} strokeWidth={active ? 2.5 : 1.5} />
                        <span>{cfg.label}</span>
                        {/* Active shimmer streak */}
                        {active && (
                          <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BUZZ + COMMENTS */}
              <div className="fade-up delay-3">
                <SectionLabel icon={<MessageCircle size={11} />}>Audience pulse</SectionLabel>

                {loading ? (
                  <div className="flex items-center gap-2 text-white/30 mt-3">
                    <Loader2 size={13} className="animate-spin" />
                    <span className="text-xs italic">Tuning in…</span>
                  </div>
                ) : buzz ? (
                  <div className="mt-2 space-y-3">
                    {/* Stats strip */}
                    <div className="flex gap-5 px-4 py-3 rounded-xl text-xs text-white/50
                      bg-white/[0.03] border border-white/[0.06]
                      relative overflow-hidden">
                      {/* Subtle left accent */}
                      <div className="absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                      <span>🔥 <strong className="text-white/80">{(buzz.watchers || 0).toLocaleString()}</strong> watching</span>
                      <span>▶︎ <strong className="text-white/80">{(buzz.plays || 0).toLocaleString()}</strong> plays</span>
                      {buzz.votes > 0 && (
                        <span>⭐ <strong className="text-white/80">{buzz.rating?.toFixed(1)}</strong>
                          <span className="text-white/25"> / 10</span>
                        </span>
                      )}
                    </div>

                    {/* Comments */}
                    {comments.length > 0 && (
                      <div className="space-y-2">
                        {comments.map((c, i) => {
                          const isExpanded = expanded === i;
                          const isLong     = c.comment?.length > 160;
                          const display    = isLong && !isExpanded
                            ? c.comment.slice(0, 160).trimEnd() + '…'
                            : c.comment;

                          return (
                            <div key={i}
                              className="group rounded-xl px-4 py-3.5
                                bg-white/[0.03] border border-white/[0.05]
                                hover:border-white/[0.11] hover:bg-white/[0.05]
                                transition-all duration-200 relative overflow-hidden">
                              {/* Top shimmer on hover */}
                              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {/* Initial avatar with a film-reel tint */}
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center
                                    text-[10px] font-bold uppercase shrink-0
                                    bg-white/[0.07] border border-white/10 text-white/50">
                                    {c.user?.[0] || '?'}
                                  </div>
                                  <span className="text-[11px] font-medium text-white/45 tracking-wide">
                                    {c.user || 'Anonymous'}
                                  </span>
                                </div>
                                {c.likes > 0 && (
                                  <div className="flex items-center gap-1 text-[11px] text-white/25">
                                    <ThumbsUp size={10} />
                                    <span>{c.likes}</span>
                                  </div>
                                )}
                              </div>

                              <p className="text-[13px] text-white/55 leading-relaxed">{display}</p>

                              {isLong && (
                                <button onClick={() => setExpanded(isExpanded ? null : i)}
                                  className="mt-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors">
                                  {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {comments.length === 0 && (
                      <p className="text-xs text-white/25 italic px-1 mt-1">No comments yet.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-white/25 italic mt-2">No reactions yet.</p>
                )}
              </div>

              {/* AFTERTASTE NOTE */}
              <div className="fade-up delay-4">
                <SectionLabel>What stayed with you?</SectionLabel>
                <div className="mt-2 relative group">
                  <textarea
                    ref={textRef}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Not everything lingers. What did?"
                    rows={4}
                    className="w-full resize-none
                      bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.05]
                      border border-white/[0.07] focus:border-white/[0.18]
                      rounded-2xl px-4 py-3.5
                      text-sm text-white/75 placeholder:text-white/18
                      outline-none transition-all duration-300 leading-relaxed"
                  />
                  {/* Focus ring glow */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none
                    opacity-0 group-focus-within:opacity-100 transition-opacity duration-400
                    shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_40px_rgba(255,255,255,0.03)]" />
                </div>

                <button onClick={handleSave} disabled={saving}
                  className={`mt-3 w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide
                    transition-all duration-300 relative overflow-hidden
                    ${saved
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                      : `bg-gradient-to-r from-amber-400 to-yellow-300 text-black
                         hover:brightness-110 active:scale-[0.98]
                         hover:shadow-[0_0_50px_rgba(251,191,36,0.3)]`
                    }`}>
                  {/* Button shimmer streak */}
                  {!saved && (
                    <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  )}
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Saving…
                    </span>
                  ) : saved ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check size={14} /> Captured
                    </span>
                  ) : 'Capture Aftertaste'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RatingPill({ color, label, value }) {
  const colors = {
    yellow: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
    red:    'bg-red-500/10 border-red-500/20 text-red-400',
    green:  'bg-green-500/10 border-green-500/20 text-green-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${colors[color]}`}>
      <strong>{label}</strong>
      <span className="text-white/55">{value}</span>
    </span>
  );
}

function SectionLabel({ icon, children }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/28 font-medium">
      {icon}{children}
    </p>
  );
}