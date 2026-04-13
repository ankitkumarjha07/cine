import React, { useState } from 'react';
import HeroCard from '../components/HeroCard';
import QuoteCard from '../components/QuoteCard';
import BottomNav from '../components/BottomNav';

const Home = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white pb-32">
      {activeTab === 'home' && (
        <div className="animate-in fade-in duration-700">
          <HeroCard onSearchClick={() => setActiveTab('explore')} />
          
          <div className="max-w-4xl mx-auto px-6 mt-12">
            <QuoteCard 
              quote="Zindagi badi honi chahiye, lambi nahi."
              movie="Anand"
              year="1971"
            />
            
            <div className="mt-20 text-center opacity-40">
              <p className="text-[10px] tracking-widest uppercase">
                Stored on your device. Private by design.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Home;