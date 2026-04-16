import React from 'react';

const Dashboard = ({ moods, setPage, user }) => {
  // Logic to calculate stats from the moods array
  const totalEntries = moods.length;
  const avgIntensity = totalEntries > 0 
    ? (moods.reduce((acc, curr) => acc + curr.intensity, 0) / totalEntries).toFixed(1) 
    : "0";
  const latestEmoji = totalEntries > 0 ? moods[0].mood.emoji : "—";

  return (
    <main className="max-w-5xl mx-auto px-8 py-12 relative z-10 animate-in fade-in duration-1000">
      {/* Welcome Hero */}
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs text-[#F5C96A] mb-6 uppercase tracking-widest">
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h2 className="text-7xl font-serif text-white mb-6 tracking-tight">
          Welcome home, <span className="italic">{user?.displayName || 'Soul'}</span>.
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          You've logged {totalEntries} moments of reflection. Take a breath and see how your journey is unfolding.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard label="Current Streak" value="12 Days" />
        <StatCard label="Avg Intensity" value={avgIntensity} />
        <StatCard label="Last Mood" value={latestEmoji} />
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ActionCard 
          title="Check-in" 
          subtitle="How is your energy right now?" 
            emoji="⚡"
          color="bg-white/10"
          onClick={() => setPage('mood')}
          darkText={false}
        />
        <ActionCard 
          title="Journal" 
          subtitle="Pour your thoughts onto the page." 
          emoji="📝"
          color="bg-white/10"
          onClick={() => setPage('journal')}
          darkText={false}
        />
      </div>
    </main>
  );
};

// Reusable Sub-components for a cleaner Dashboard file
const StatCard = ({ label, value }) => (
  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 text-center hover:bg-white/15 transition duration-500">
    <span className="text-white/60 text-sm uppercase tracking-wider">{label}</span>
    <div className="text-5xl font-serif text-white mt-2">{value}</div>
  </div>
);

const ActionCard = ({ title, subtitle, emoji, color, onClick, darkText }) => (
  <button 
    onClick={onClick}
    className={`${color} ${darkText ? 'text-gray-900' : 'text-white'} border border-white/10 backdrop-blur-md p-12 rounded-[3.5rem] text-left transition-all duration-500 group relative overflow-hidden hover:scale-[1.02] active:scale-95`}
  >
    <div className="relative z-10">
      <h3 className="text-4xl font-serif mb-2">{title}</h3>
      <p className={darkText ? 'text-gray-800/70' : 'text-white/60'}>{subtitle}</p>
    </div>
    <span className="absolute right-10 bottom-10 text-7xl group-hover:rotate-12 transition-transform duration-500 opacity-80">
      {emoji}
    </span>
  </button>
);

export default Dashboard;