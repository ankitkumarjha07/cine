import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, autoFocus }) => {
  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="relative flex items-center">
        <Search className="absolute left-6 text-slate-500" size={20} />
        <input 
          autoFocus={autoFocus}
          type="text"
          value={value}
          // Fix: Ensure we only call onChange if it exists
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder="Find something worth your time..."
          className="w-full bg-[#16161D] border border-white/10 rounded-full py-5 pl-16 pr-8 text-white focus:outline-none focus:border-gold-500/50 transition-all shadow-2xl"
        />
      </div>
    </div>
  );
};

export default SearchBar;