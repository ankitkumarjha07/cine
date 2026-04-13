import React from 'react';
import { Home, Compass, LayoutGrid } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'gallery', icon: LayoutGrid, label: 'Gallery' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-8 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        {tabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`transition-all duration-300 ${
              activeTab === id ? 'text-[#D4AF37] scale-110' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Icon size={22} strokeWidth={1.5} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;