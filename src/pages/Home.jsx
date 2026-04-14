import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import AftertasteModal from '../components/AftertasteModal';
import IconicQuoteOverlay from '../components/IconicQuoteOverlay';
import { searchMovies, fetchMovieDetails } from '../services/omdb';
import { dbService } from '../services/storage';
import { Ghost } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop';

const Home = () => {
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

    // FIX: Auto-close modal when switching tabs to prevent UI locking
    useEffect(() => {
        setSelectedMovie(null);
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
                    className="absolute inset-0 flex flex-col px-6 pt-[31vh] pb-32 overflow-y-auto hide-scrollbar z-20" 
                >
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[40vh]">
                        <div className="w-full max-w-md flex flex-col items-center space-y-12">
                            <div className="w-full text-center flex flex-col items-center justify-center opacity-90 relative z-10">
                                <IconicQuoteOverlay />
                            </div>
                            
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('explore')}
                                className="group relative pb-2 text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors"
                            >
                                Find Something Worth It
                                <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-[#D4AF37] transition-all duration-500 group-hover:w-full group-hover:left-0"></span>
                            </motion.button>
                        </div>
                    </div>
                
                    <div className="mt-12 shrink-0 flex flex-col items-center text-center opacity-40 hover:opacity-100 transition-all duration-700 cursor-default group pb-8">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white/30 transition-all duration-500 group-hover:w-12 group-hover:to-white/60"></div>
                            <Ghost size={16} strokeWidth={1} className="text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]" />
                            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white/30 transition-all duration-500 group-hover:w-12 group-hover:to-white/60"></div>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white mb-2">100% Local • Zero Cloud</span>
                        <p className="text-[9px] font-light tracking-widest text-white/60 max-w-[260px] leading-relaxed">
                            No shadows cast on servers. Your archive is mathematically sealed on this device.
                        </p>
                        <button onClick={handleResetData} className="mt-5 text-[8px] uppercase tracking-[0.3em] text-red-500/40 hover:text-red-500 transition-colors">
                            Erase Vault
                        </button>
                    </div>
                </motion.div>
            )}
            
            {/* EXPLORE */}
            {activeTab === 'explore' && (
                <motion.div 
                    key="explore"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 overflow-y-auto px-6 pt-32 pb-32 max-w-5xl mx-auto space-y-8 hide-scrollbar z-20"
                >
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {results.map((m, i) => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} key={m.imdbID} onClick={() => handleSelect(m)} className="cursor-pointer group">
                                <img src={m.Poster !== 'N/A' ? m.Poster : FALLBACK} loading="lazy" className="rounded-lg aspect-[2/3] object-cover w-full grayscale opacity-60 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"/>
                                <p className="text-[10px] mt-3 uppercase tracking-widest text-white/40 group-hover:text-[#D4AF37] transition-colors truncate">{m.Title}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
            
            {/* GALLERY */}
            {activeTab === 'gallery' && (
                <motion.div 
                    key="gallery"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col pt-32 pb-24 z-20"
                >
                    <div className="px-6 flex justify-between items-end mb-8 z-10 max-w-5xl mx-auto w-full">
                        <div className="flex gap-6 border-b border-white/10 pb-3 w-full">
                            {['all', 'seen', 'watchlist'].map(type => (
                                <button key={type} onClick={() => setFilterType(type)} className={`text-[9px] uppercase tracking-[0.2em] transition-colors ${filterType === type ? 'text-[#D4AF37]' : 'text-white/30 hover:text-white/60'}`}>{type}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-40 hide-scrollbar max-w-5xl mx-auto w-full">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {filteredMovies.map((m) => (
                                <motion.div key={m.imdbID} onClick={() => handleSelect(m)} whileTap={{ scale: 0.98 }} className="relative cursor-pointer group">
                                    <img src={m.Poster !== 'N/A' ? m.Poster : FALLBACK} loading="lazy" className="w-full aspect-[2/3] object-cover rounded-md grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-active:grayscale-0 group-active:opacity-100"/>
                                    <div className="absolute top-3 right-3 flex gap-1">
                                        {m.status?.state === 'watched' && <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />}
                                        {m.status?.state === 'watchlist' && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]" />}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </main>
        
        {selectedMovie && (
            <AftertasteModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onUpdate={fetchGallery} />
        )}
        
        {/* Floating Island Wrapper - UPDATED Z-INDEX TO 110 */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-[20rem] flex justify-center pointer-events-none">
            <div className="pointer-events-auto w-full">
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
        
        </div>
    );
};

export default Home;