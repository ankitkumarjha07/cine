import React from 'react';
import { Film } from 'lucide-react';

const CinematicLoader = ({ message = "Scanning Archives" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full animate-in fade-in duration-700">
      <div className="relative">
        {/* The Outer Glow */}
        <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full animate-pulse" />
        
        {/* The Icon */}
        <div className="relative bg-[#121217] p-6 rounded-full border border-gold-500/10 shadow-2xl">
          <Film size={32} className="text-gold-500/40 animate-[spin_4s_linear_infinite]" />
        </div>

        {/* The Scanning Line Effect */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-full pointer-events-none">
          <div className="w-full h-[2px] bg-gold-500/50 shadow-[0_0_15px_rgba(212,175,55,0.5)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      </div>

      <div className="mt-8 space-y-2 text-center">
        <p className="text-[10px] text-gold-500/60 uppercase tracking-[0.6em] font-black animate-pulse">
          {message}
        </p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className="w-1 h-1 bg-gold-500/40 rounded-full animate-bounce" 
              style={{ animationDelay: `${i * 0.2}s` }} 
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-20px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(80px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CinematicLoader;