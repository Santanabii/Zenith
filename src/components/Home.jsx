import React from 'react';

const Home = ({ onGetStarted }) => {
  return (
    <main className="max-w-6xl mx-auto px-8 py-20 relative z-10 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <div className="text-center pt-20 pb-32">
        <h2 className="text-8xl font-serif text-white tracking-tighter leading-[1.1] mb-8">
          Your mind is a <span className="italic text-[#F5C96A]">sanctuary</span>.
        </h2>
        <p className="text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
          Zenith is a gentle space designed for the modern soul. We believe mental wellness 
          isn't a destination, but a daily practice of awareness and grace.
        </p>
        
        <button 
          onClick={onGetStarted}
          className="mt-12 px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-[#F5C96A] transition-all shadow-xl shadow-white/5"
        >
          Begin your journey
        </button>
      </div>

      {/* The Pitch / Why it Matters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-20 border-t border-white/10">
        <div>
          <h3 className="text-4xl font-serif text-[#F5C96A] mb-6">Why Zenith?</h3>
          <p className="text-white/60 text-lg leading-relaxed">
            In a world that never stops moving, we give you permission to pause. 
            Mental health is the foundation of everything you build. By tracking your 
            mood and journaling with intention, you turn "noise" into "clarity."
          </p>
        </div>
        <div className="space-y-8">
          <FeatureItem 
            
            title="Gentle Awareness" 
            desc="Log your energy levels without judgment. See patterns emerge over time." 
          />
          <FeatureItem 
            
            title="Private & Secure" 
            desc="Your thoughts are yours alone. End-to-end focus on your privacy." 
          />
          <FeatureItem 
            
            title="AI Reflection" 
            desc="Coming soon: Receive kind, guided prompts based on your unique emotional journey." 
          />
        </div>
      </div>
    </main>
  );
};

const FeatureItem = ({ emoji, title, desc }) => (
  <div className="flex gap-6">
    <span className="text-4xl">{emoji}</span>
    <div>
      <h4 className="text-xl font-serif text-white mb-1">{title}</h4>
      <p className="text-white/50">{desc}</p>
    </div>
  </div>
);

export default Home;