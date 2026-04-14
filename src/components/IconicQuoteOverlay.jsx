import React, { useState, useEffect, useMemo } from 'react';
import { Quote, Loader2 } from 'lucide-react';

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728',
  'https://images.unsplash.com/photo-1641208126106-6a5a89c1400f?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
  'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6',
  'https://plus.unsplash.com/premium_photo-1682125795272-4b81d19ea386?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330',
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1493135637657-c2411b3497ad',
  'https://images.unsplash.com/photo-1509248961158-e54f6934749c',
  'https://images.unsplash.com/photo-1512070679279-8988d32161be'
];

const QUOTE_POOL = [
  { text: "बाबूमोशाय, ज़िंदगी बड़ी होनी चाहिए, लंबी नहीं.", movie: "Anand (1971)" },
  { text: "It's only after we've lost everything that we're free to do anything.", movie: "Fight Club" },
  { text: "Hope is a good thing, maybe the best of things.", movie: "The Shawshank Redemption" },
  { text: "Carpe diem. Seize the day, boys.", movie: "Dead Poets Society" },
  { text: "Great men are not born great, they grow great.", movie: "The Godfather" },
  { text: "Our lives are defined by opportunities, even the ones we miss.", movie: "Benjamin Button" },
  { text: "Everything is a copy of a copy of a copy.", movie: "Fight Club" },
  { text: "Whatever you do in this life, it's not legendary unless your friends are there to see it.", movie: "HIMYM" },
  { text: "Yesterday is history, tomorrow is a mystery, but today is a gift.", movie: "Kung Fu Panda" }
];

const IconicQuoteOverlay = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  const randomBG = useMemo(() => `${IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)]}?q=80&w=1200&auto=format&fit=crop`, []);
  const fallback = useMemo(() => QUOTE_POOL[Math.floor(Math.random() * QUOTE_POOL.length)], []);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('https://api.quotable.io/random?tags=film|wisdom');
        if (!response.ok) throw new Error();
        const data = await response.json();
        setQuote({ text: data.content, movie: data.author });
      } catch (err) {
        setQuote(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [fallback]);

  return (
    <div className="relative w-full aspect-[21/10] min-h-[320px] rounded-[3rem] overflow-hidden bg-[#121217] border border-white/5 shadow-2xl group transition-all duration-700 hover:border-white/10 active:scale-[0.99]">
      {/* Dynamic Cinematic Background */}
      <img 
        src={randomBG} 
        className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale-[30%] group-hover:scale-110 transition-transform duration-[5000ms] ease-out" 
        alt="Cinema Background" 
      />
      
      {/* Vignette & Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

      {/* Quote Container */}
      <div className="relative h-full flex flex-col justify-center px-12 md:px-16">
        {loading ? (
          <Loader2 className="animate-spin text-gold-500/20" />
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <Quote size={28} className="text-gold-500/40" />
            <div className="max-w-[85%]">
              <p className="text-2xl md:text-4xl font-medium text-white/90 leading-[1.15] tracking-tight">
                {quote?.text}
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="h-px w-8 bg-gold-500/30" />
                <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gold-500/60 font-light italic">
                  {quote?.movie}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconicQuoteOverlay;