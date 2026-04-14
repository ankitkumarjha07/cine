import React from 'react';
import { Star, Clock } from 'lucide-react';

const MovieCard = ({ movie, redditComments }) => {
    return (
      <div className="flex flex-col gap-4">
        {/* 2:3 Cinematic Aspect Ratio Container */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#16161D]">
          <img 
            src={movie.Poster} 
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-110" 
          />
          
          {/* Bottom Ratings Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-3 flex justify-between items-center border-t border-white/5">
            <div className="flex gap-3">
               <div className="flex flex-col">
                 <span className="text-[8px] text-slate-400 uppercase">IMDb</span>
                 <span className="text-xs font-bold text-yellow-500">{movie.imdbRating}</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-[8px] text-slate-400 uppercase">Tomato</span>
                 <span className="text-xs font-bold text-red-500">{movie.Ratings?.find(r => r.Source === "Rotten Tomatoes")?.Value || 'N/A'}</span>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[8px] text-slate-400 uppercase">Buzz</span>
               <p className="text-[10px] font-medium text-green-400">Trending 🔥</p>
            </div>
          </div>
        </div>
  
        {/* Reddit Section Below Card (Only shows on detailed view or hover) */}
        <div className="px-1 space-y-2">
          <h4 className="text-[10px] font-bold tracking-widest text-slate-500 uppercase italic">Reddit Buzz</h4>
          {redditComments?.map((comment, i) => (
            <div key={i} className="text-xs text-slate-400 border-l border-gold-500/30 pl-2">
              "{comment.title}"
            </div>
          ))}
          <button className="text-[10px] text-gold-400/80 hover:text-gold-400 underline">View more threads</button>
        </div>
      </div>
    );
  };

export default MovieCard;