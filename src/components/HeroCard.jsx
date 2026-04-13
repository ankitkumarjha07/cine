import React from 'react';

const HeroCard = ({ onSearchClick }) => {
  return (
    <div className="relative w-full py-12 px-6 flex flex-col items-center">
      {/* Calligraphic Logo Header */}
      <div className="mb-16 text-center">
        <h1 className="text-6xl md:text-7xl font-hindi bg-gradient-to-b from-[#F9E27D] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          सिनेमा
        </h1>
        <p className="text-[10px] tracking-[0.5em] text-slate-500 uppercase mt-2 font-light">
          Personal Cinema
        </p>
      </div>

      {/* Hero Display */}
      <div className="relative w-full max-w-4xl bg-[#16161D] rounded-[2rem] p-10 md:p-20 overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[100px] rounded-full -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-8 max-w-lg">
          <h2 className="text-3xl md:text-5xl font-medium leading-tight text-white tracking-tight">
            Most movies fade. <br />
            <span className="text-white/40 italic">Some don't.</span>
          </h2>
          
          <button 
            onClick={onSearchClick}
            className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
          >
            Find something worth it
            <span className="w-6 h-px bg-black transition-all group-hover:w-10" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroCard;