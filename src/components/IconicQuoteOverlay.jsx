import React, { useMemo, useEffect, useState } from 'react';
import { Quote } from 'lucide-react';

// 1. Unified Master List: Quote + Movie Name + IMDb ID
const CINEMA_VAULT = [
    // Hindi
    { text: "रिश्ते में तो हम तुम्हारे बाप लगते हैं.", movie: "Shahenshah", id: "tt0096087" },
    { text: "डॉन को पकड़ना मुश्किल ही नहीं, नामुमकिन है.", movie: "Don", id: "tt0077451" },
    { text: "मोगैम्बो खुश हुआ.", movie: "Mr. India", id: "tt0093575" },
    { text: "पिक्चर अभी बाकी है मेरे दोस्त.", movie: "Om Shanti Om", id: "tt1023432" },
    { text: "ये हाथ मुझे दे दे ठाकुर.", movie: "Sholay", id: "tt0073707" },
    { text: "बाबूमोशाय, ज़िंदगी बड़ी होनी चाहिए, लंबी नहीं.", movie: "Anand", id: "tt0066763" },
    { text: "पहन के शेरवानी, कहाँ चले?", movie: "Tumbbad", id: "tt5986346" },
    { text: "काबिल बनो, कामयाबी झक मार के पीछे आएगी.", movie: "3 Idiots", id: "tt1187043" },
    { text: "मैं अपनी फेवरेट हूँ.", movie: "Jab We Met", id: "tt1093824" },
    
    // English
    { text: "I am your father.", movie: "Star Wars: Empire Strikes Back", id: "tt0080684" },
    { text: "Why so serious?", movie: "The Dark Knight", id: "tt0468569" },
    { text: "I'm going to make him an offer he can't refuse.", movie: "The Godfather", id: "tt0068646" },
    { text: "To infinity and beyond!", movie: "Toy Story", id: "tt0114709" },
    { text: "There's no place like home.", movie: "The Wizard of Oz", id: "tt0032138" },
    { text: "Keep your friends close, but your enemies closer.", movie: "The Godfather II", id: "tt0071562" },
    { text: "It's only after we've lost everything that we're free.", movie: "Fight Club", id: "tt0137523" },
    { text: "May the Force be with you.", movie: "Star Wars", id: "tt0076759" },
    { text: "Here's looking at you, kid.", movie: "Casablanca", id: "tt0034583" },
    { text: "Life is like a box of chocolates.", movie: "Forrest Gump", id: "tt0109830" }
];

const IMAGE_POOL = [
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728'
];

const IconicQuoteOverlay = () => {
    const [fanArt, setFanArt] = useState(null);

    // 2. Select ONE entry from the vault per refresh
    const entry = useMemo(() => {
        return CINEMA_VAULT[Math.floor(Math.random() * CINEMA_VAULT.length)];
    }, []);

    const fallbackBg = useMemo(() => IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)], []);

    useEffect(() => {
        const fetchMatchingArt = async () => {
            try {
                // 3. Use the ID directly from our selected entry
                const id = entry.id;

                const cached = sessionStorage.getItem(`cinema_art_${id}`);
                if (cached) {
                    setFanArt(cached);
                    return;
                }

                const res = await fetch(`/.netlify/functions/getFanArt?id=${id}`);
                const data = await res.json();

                let backdrop = null;

                // Priority Logic
                if (data?.moviebackground?.length > 0) {
                    const sorted = data.moviebackground.sort((a, b) => Number(b.likes) - Number(a.likes));
                    backdrop = sorted[0]?.url;
                } else if (data?.movieposter?.length > 0) {
                    backdrop = data.movieposter[0]?.url;
                }

                if (backdrop) {
                    setFanArt(backdrop);
                    sessionStorage.setItem(`cinema_art_${id}`, backdrop);
                }
            } catch (err) {
                console.error("Art fetch failed", err);
            }
        };

        fetchMatchingArt();
    }, [entry]); // Dependency on entry ensures it runs when the entry is picked

    const bg = fanArt || `${fallbackBg}?q=80&w=1200&auto=format&fit=crop`;

    return (
        <div className="relative w-full aspect-[21/10] min-h-[320px] rounded-[2.5rem] overflow-hidden bg-[#121217] border border-white/5 shadow-2xl group">
            {/* 🎬 Background */}
            <img
                src={bg}
                key={bg} // Force re-animation on change
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[5000ms] ease-out"
                alt={entry.movie}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
            
            <div className="relative h-full flex flex-col justify-center px-8 md:px-14">
                <div className="space-y-5">
                    <Quote size={26} className="text-yellow-400/40" />
                    <div className="max-w-[90%]">
                        <p className="text-xl md:text-3xl font-medium text-white/90 leading-[1.2] tracking-tight">
                            {entry.text}
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            <div className="h-px w-8 bg-yellow-400/30" />
                            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-yellow-400/60 italic">
                                {entry.movie}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IconicQuoteOverlay;