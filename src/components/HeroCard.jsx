import React from 'react';

const HeroCard = ({ onSearchClick }) => {
  return (
    <div className="relative w-full flex flex-col items-center">
      
      {/* 1. Logo Section (Unchanged, since crop is fixed) */}
      <div className="text-center pt-16 pb-12 overflow-visible">
        <h1 className="text-7xl md:text-[10rem] font-hindi leading-[1.6] px-10 bg-gradient-to-b from-[#F9E27D] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(212,175,55,0.3)]">
          सिनेमा
        </h1>
        <p className="text-[10px] md:text-[12px] tracking-[0.8em] text-slate-500 uppercase -mt-6 font-light opacity-70">
          Personal Cinema
        </p>
      </div>

      {/* 2. The Missing Card Section */}
      <div className="relative w-[90%] max-w-4xl bg-[#16161D] rounded-[2.5rem] p-10 md:p-20 overflow-hidden border border-white/5 shadow-2xl mx-6 mt-4">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10 space-y-8 max-w-lg text-left">
          <h2 className="text-3xl md:text-5xl font-medium leading-tight text-white tracking-tight">
            Most movies fade. <br />
            <span className="text-white/30 italic font-light">Some don't.</span>
          </h2>
          
          <button 
            onClick={onSearchClick} // This triggers handleFindSomething in Home.jsx
            className="group flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm transition-all hover:bg-[#F9E27D] active:scale-95 shadow-xl"
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