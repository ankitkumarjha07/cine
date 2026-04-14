import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import AftertasteModal from '../components/AftertasteModal';
import IconicQuoteOverlay from '../components/IconicQuoteOverlay';
import { searchMovies, fetchMovieDetails, fetchTraktTrending } from '../services/omdb';
import { dbService } from '../services/storage';
import { Ghost, ArrowRight } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop';

// ---------------------------------------------------------------------------
// FeaturedHero — Cinematic Spotlight section for the Explore tab
// ---------------------------------------------------------------------------
const FeaturedHero = ({ spotlight }) => {
    if (!spotlight) {
        // Skeleton shimmer while loading
        return (
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-white/5 animate-pulse mb-8" />
        );
    }

    return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8">
            {/* Backdrop image — grayscale + low opacity */}
            {spotlight.backdropUrl ? (
                <img
                    src={spotlight.backdropUrl}
                    alt={spotlight.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-40"
                    loading="eager"
                />
            ) : (
                <div className="absolute inset-0 bg-white/5" />
            )}

            {/* Bottom gradient fade — blends hero into the page background */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Side vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

            {/* Text content anchored to bottom-left */}
            <div className="absolute bottom-0 left-0 p-5 flex flex-col gap-1.5">
                <span
                    className="text-[8px] uppercase tracking-[0.45em] font-medium"
                    style={{ color: '#D4AF37', opacity: 0.7 }}
                >
                    Cinematic Spotlight
                </span>
                <h2
                    className="text-xl md:text-2xl leading-tight"
                    style={{
                        fontFamily: "'Rozha One', serif",
                        background: 'linear-gradient(to bottom, #FFF2D8, #D4AF37)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    {spotlight.title}
                </h2>
                {spotlight.year && (
                    <span className="text-[10px] tracking-[0.2em] text-white/30">
                        {spotlight.year}
                    </span>
                )}
            </div>

            {/* Top-right Trakt badge */}
            <div className="absolute top-4 right-4">
                <span className="text-[7px] uppercase tracking-[0.35em] text-white/20 border border-white/10 px-2.5 py-1 rounded-full">
                    Trending on Trakt
                </span>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------
const Home = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [savedMovies, setSavedMovies] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [spotlight, setSpotlight] = useState(undefined); // undefined = not yet fetched

    const fetchGallery = async () => {
        const data = await dbService.getAllLibraryData();
        setSavedMovies(data);
    };

    useEffect(() => { fetchGallery(); }, []);
    useEffect(() => { if (activeTab === 'gallery') fetchGallery(); }, [activeTab]);

    // Fetch Trakt spotlight once when the Explore tab is first opened
    useEffect(() => {
        if (activeTab === 'explore' && spotlight === undefined) {
            setSpotlight(null); // null = loading state
            fetchTraktTrending().then(data => setSpotlight(data || null));
        }
    }, [activeTab]);

    useEffect(() => {
        setSelectedMovie(null);
    }, [activeTab]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setLoading(true);
                const data = await searchMovies(searchQuery);
                // Tertiary guard — ensures only movies appear regardless of API quirks
                setResults(data.filter(m => !m.Type || m.Type === 'movie'));
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
        if (window.confirm("Erase the vault? This action is irreversible.")) {
            await dbService.resetAllData();
            window.location.reload();
        }
    };

    const filteredMovies = savedMovies.filter(m => {
        if (filterType === 'seen') return m.status?.state === 'watched';
        if (filterType === 'watchlist') return m.status?.state === 'watchlist';
        return true;
    });

    return (
        <div className="h-[100dvh] bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-yellow-500/30">

            {/* Top Fade Overlay */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-30 pointer-events-none" />

            {/* HEADER: Grand Cinematic Logo */}
            <motion.div
                layout
                initial={false}
                animate={{
                    top: activeTab === 'home' ? '12%' : '2rem',
                    scale: activeTab === 'home' ? 1 : 0.5,
                }}
                transition={{ type: "spring", stiffness: 45, damping: 15 }}
                className="fixed w-full z-40 flex flex-col items-center justify-center pointer-events-none"
            >
                <h1
                    className="text-7xl md:text-8xl tracking-wide py-2 bg-gradient-to-b from-[#FFF2D8] via-[#D4AF37] to-[#996515] text-transparent bg-clip-text"
                    style={{
                        fontFamily: "'Rozha One', serif",
                        filter: "drop-shadow(0px 4px 24px rgba(212, 175, 55, 0.2))"
                    }}
                >
                    सिनेमा
                </h1>
            </motion.div>

            <main className="flex-1 relative h-full w-full">
                <AnimatePresence mode="wait">

                    {/* HOME SCREEN */}
                    {activeTab === 'home' && (
                        <motion.div
                            key="home"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 flex flex-col px-6 pt-[31vh] pb-60 overflow-y-auto hide-scrollbar z-20"
                        >
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh]">
                                <div className="w-full max-w-md flex flex-col items-center space-y-14">

                                    {/* Quote Card */}
                                    <div className="w-full text-center flex flex-col items-center justify-center opacity-90 relative z-10">
                                        <IconicQuoteOverlay />
                                    </div>

                                    <div className="flex flex-col items-center gap-6">
                                        {/* The Cinematic Capsule Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setActiveTab('explore')}
                                            className="group relative flex items-center gap-3 px-8 py-3.5 rounded-full overflow-hidden
                                                       bg-white/[0.03] border border-[#D4AF37]/20 transition-all duration-500
                                                       hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                                        >
                                            <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                                                style={{ transform: 'skewX(-20deg)' }} />
                                            <span className="text-[11px] uppercase tracking-[0.3em] text-[#D4AF37] font-medium transition-transform duration-300 group-hover:translate-x-[-2px]">
                                                Find Something Worth It
                                            </span>
                                            <ArrowRight size={14} className="text-[#D4AF37] opacity-60 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                                        </motion.button>

                                        {/* Onboarding Roadmap */}
                                        <div className="flex items-center gap-3 text-[8px] uppercase tracking-[0.4em] text-white/20">
                                            <span>Search</span>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                            <span>Capture</span>
                                            <div className="w-1 h-1 rounded-full bg-white/10" />
                                            <span>Archive</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-24 shrink-0 flex flex-col items-center text-center pb-12">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/30"></div>
                                    <Ghost size={18} strokeWidth={1} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,1)]" />
                                    <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/30"></div>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-white/90 mb-3">
                                    100% Local • Zero Cloud
                                </span>
                                <p className="text-[10px] font-light tracking-[0.2em] text-white/40 max-w-[280px] leading-relaxed italic">
                                    Your personal film archive is mathematically sealed on this device.
                                </p>
                                <button
                                    onClick={handleResetData}
                                    className="mt-8 text-[8px] uppercase tracking-[0.3em] text-red-500/50 hover:text-red-500 transition-all"
                                >
                                    Erase Vault
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* EXPLORE SCREEN */}
                    {activeTab === 'explore' && (
                        <motion.div
                            key="explore"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 overflow-y-auto px-6 pt-28 pb-48 max-w-5xl mx-auto space-y-0 hide-scrollbar z-20"
                        >
                            {/* ── Cinematic Spotlight Hero ── */}
                            <FeaturedHero spotlight={spotlight} />

                            {/* ── Search bar + disclaimer ── */}
                            <div className="space-y-3 mb-8">
                                <SearchBar
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    placeholder="Search the film archive..."
                                />
                                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 text-center">
                                    The vault is curated exclusively for feature films.
                                </p>
                            </div>

                            {/* ── Results grid ── */}
                            {loading && (
                                <div className="flex justify-center py-10">
                                    <span className="text-[9px] uppercase tracking-[0.3em] text-white/20 animate-pulse">
                                        Searching...
                                    </span>
                                </div>
                            )}

                            {!loading && results.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {results.map((m, i) => (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            key={m.imdbID}
                                            onClick={() => handleSelect(m)}
                                            className="cursor-pointer group"
                                        >
                                            <img
                                                src={m.Poster !== 'N/A' ? m.Poster : FALLBACK}
                                                loading="lazy"
                                                className="rounded-lg aspect-[2/3] object-cover w-full grayscale opacity-60 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                                                alt={m.Title}
                                            />
                                            <p className="text-[10px] mt-3 uppercase tracking-widest text-white/40 group-hover:text-[#D4AF37] transition-colors truncate">
                                                {m.Title}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Empty state when a search returns nothing */}
                            {!loading && searchQuery.length > 2 && results.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                                    <Ghost size={24} strokeWidth={1} className="text-[#D4AF37]/30" />
                                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/20">
                                        No films found
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* GALLERY SCREEN */}
                    {activeTab === 'gallery' && (
                        <motion.div
                            key="gallery"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col pt-32 pb-24 z-20"
                        >
                            <div className="px-6 flex justify-between items-end mb-8 z-10 max-w-5xl mx-auto w-full">
                                <div className="flex gap-6 border-b border-white/10 pb-3 w-full">
                                    {['all', 'seen', 'watchlist'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${filterType === type ? 'text-[#D4AF37]' : 'text-white/30 hover:text-white/60'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 pb-48 hide-scrollbar max-w-5xl mx-auto w-full">
                                {filteredMovies.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {filteredMovies.map((m) => (
                                            <motion.div
                                                key={m.imdbID}
                                                onClick={() => handleSelect(m)}
                                                whileTap={{ scale: 0.98 }}
                                                className="relative cursor-pointer group"
                                            >
                                                <img
                                                    src={m.Poster !== 'N/A' ? m.Poster : FALLBACK}
                                                    loading="lazy"
                                                    className="w-full aspect-[2/3] object-cover rounded-md grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-active:grayscale-0 group-active:opacity-100"
                                                    alt={m.Title}
                                                />
                                                <div className="absolute top-3 right-3 flex gap-1">
                                                    {m.status?.state === 'watched' && (
                                                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                                                    )}
                                                    {m.status?.state === 'watchlist' && (
                                                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6">
                                        <Ghost size={32} strokeWidth={1} className="text-[#D4AF37]/40" />
                                        <div className="space-y-2">
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">The vault is empty</p>
                                            <button
                                                onClick={() => setActiveTab('explore')}
                                                className="text-[9px] uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/20 px-6 py-2.5 rounded-full hover:bg-[#D4AF37]/5 transition-all"
                                            >
                                                Explore Cinema
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {selectedMovie && (
                <AftertasteModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onUpdate={fetchGallery} />
            )}

            {/* Floating Island Nav */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-[20rem] flex justify-center pointer-events-none">
                <div className="pointer-events-auto w-full">
                    <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    100% { transform: translateX(150%) skewX(-20deg); }
                }
            `}</style>
        </div>
    );
};

export default Home;