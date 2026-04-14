import React from 'react';

const QuoteCard = ({ quote, movie, year, image }) => {
  return (
    <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden group border border-white/5">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
      <img 
        src={image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80"} 
        alt="Quote Background"
        className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[3s]"
      />
      <div className="absolute bottom-10 left-10 right-10 z-20">
        <p className="text-2xl md:text-3xl font-serif italic text-white leading-relaxed">
          “{quote}”
        </p>
        <p className="text-[10px] tracking-[0.3em] text-gold mt-4 uppercase font-semibold">
          — {movie} ({year})
        </p>
      </div>
    </div>
  );
};

export default QuoteCard;