import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Quote } from 'lucide-react';

const CINEMA_VAULT = [
    { text: "It does not do to dwell on dreams and forget to live.", movie: "Harry Potter and the Sorcerer's Stone", id: "tt0241927" },
    { text: "Happiness can be found, even in the darkest of times...", movie: "Harry Potter and the Prisoner of Azkaban", id: "tt0304141" },
    { text: "After all this time? Always.", movie: "Harry Potter and the Deathly Hallows: Part 2", id: "tt1201607" },
    { text: "I am your father.", movie: "Star Wars: Empire Strikes Back", id: "tt0080684" },
    { text: "All we have to decide is what to do with the time that is given us.", movie: "LOTR: The Fellowship of the Ring", id: "tt0120737" },
    { text: "I can only show you the door. You're the one that has to walk through it.", movie: "The Matrix", id: "tt0133093" },
    { text: "Why so serious?", movie: "The Dark Knight", id: "tt0468569" },
    { text: "I'm going to make him an offer he can't refuse.", movie: "The Godfather", id: "tt0068646" },
    { text: "It's only after we've lost everything that we're free.", movie: "Fight Club", id: "tt0137523" },
    { text: "Get busy living or get busy dying.", movie: "Shawshank Redemption", id: "tt0111161" },
    { text: "Carpe diem. Seize the day.", movie: "Dead Poets Society", id: "tt0097165" },
    { text: "Stories are how we make sense of the world.", movie: "Inception", id: "tt1375666" }
];

// High-quality static fallback used while high-res art loads
const MASTER_FALLBACK = 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200&auto=format&fit=crop';

const IconicQuoteOverlay = () => {
    // 1. Instantly pick the movie
    const entry = useMemo(() => CINEMA_VAULT[Math.floor(Math.random() * CINEMA_VAULT.length)], []);
    
    // 2. AGGRESSIVE INITIALIZATION: Check localStorage immediately during render
    const [bgImage, setBgImage] = useState(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(`cinema_art_cache_${entry.id}`);
    });

    const [isArtReady, setIsArtReady] = useState(!!bgImage);
    const fetchRef = useRef(false);

    useEffect(() => {
        // If we have it in localStorage, don't even trigger the fetch logic
        if (bgImage) return; 
        if (fetchRef.current) return;
        fetchRef.current = true;

        const loadArt = async () => {
            const id = entry.id;
            const cacheKey = `cinema_art_cache_${id}`;

            try {
                const res = await fetch(`/.netlify/functions/getFanArt?id=${id}`);
                const data = await res.json();
                
                let rawUrl = null;
                if (data?.moviebackground?.length > 0) {
                    rawUrl = data.moviebackground.sort((a, b) => b.likes - a.likes)[0].url;
                } else if (data?.movieposter?.length > 0) {
                    rawUrl = data.movieposter[0].url;
                }

                if (rawUrl) {
                    // Preload the image in background
                    const img = new Image();
                    img.src = rawUrl;
                    img.onload = () => {
                        localStorage.setItem(cacheKey, rawUrl);
                        setBgImage(rawUrl);
                        setIsArtReady(true);
                    };
                }
            } catch (e) {
                console.error("Fetch failed, staying on fallback");
            }
        };

        loadArt();
    }, [entry, bgImage]);

    return (
        <div className="relative w-full aspect-[21/10] min-h-[320px] rounded-[2.5rem] overflow-hidden bg-[#0a0a0c] border border-white/5 shadow-2xl">
            
            {/* LAYER 1: Immediate Fallback (Always visible, very low opacity) */}
            <div 
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `url(${MASTER_FALLBACK})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* LAYER 2: The Cinematic Art (Fades in over fallback once ready) */}
            <div 
                className={`absolute inset-0 transition-opacity duration-1000 ease-out ${isArtReady ? 'opacity-40' : 'opacity-0'}`}
                style={{
                    backgroundImage: `url(${bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'contrast(1.1) brightness(0.8)'
                }}
            />

            {/* VIGNETTE & GRADIENTS (Instant) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-transparent to-black/90" />
            
            {/* CONTENT (Instant) */}
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16">
                <div className="space-y-6">
                    <Quote size={28} className="text-yellow-400/30" />
                    <div className="max-w-[85%]">
                        <p className="text-2xl md:text-4xl font-medium text-white leading-[1.15] tracking-tight drop-shadow-2xl">
                            {entry.text}
                        </p>
                        <div className="flex items-center gap-4 mt-8">
                            <div className="h-[1px] w-12 bg-gradient-to-r from-yellow-400/50 to-transparent" />
                            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-yellow-400/60 font-bold italic">
                                {entry.movie}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Noise/Grain (Instant) */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default IconicQuoteOverlay;