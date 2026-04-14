import { useState } from 'react';
import backgroundImage from './assets/bg2.jpg';

function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/65"></div>
      </div>

      {/* Updated Navbar with Mood Board */}
      <nav className="bg-white/10 backdrop-blur-2xl border-b border-white/25 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-tight text-white">Zenith</h1>
          </div>

          <div className="flex items-center gap-8 text-sm font-medium text-white">
            <button 
              onClick={() => setPage('dashboard')}
              className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${page === 'dashboard' ? 'bg-white/30 font-semibold' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setPage('mood')}
              className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${page === 'mood' ? 'bg-white/30 font-semibold' : ''}`}
            >
              Log Mood
            </button>
            <button 
              onClick={() => setPage('journal')}
              className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${page === 'journal' ? 'bg-white/30 font-semibold' : ''}`}
            >
              Journal
            </button>
            <button 
              onClick={() => setPage('moodboard')}
              className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${page === 'moodboard' ? 'bg-white/30 font-semibold' : ''}`}
            >
              Mood Board
            </button>
          </div>

          <button className="px-5 py-2.5 text-sm font-medium text-white hover:bg-white/20 rounded-2xl transition-colors">
            Notifications
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-12 relative z-10">
        
        {/* Dashboard Page */}
        {page === 'dashboard' && (
          <div className="text-center text-white">
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2.5 rounded-3xl text-sm mb-6 border border-white/30">
                Your daily path to inner peace
              </div>
              
              <h2 className="text-6xl font-serif tracking-tighter leading-tight">
                Find your <span className="text-[#F5C96A]">Zenith</span>
              </h2>
              <p className="mt-6 text-xl text-white/90 max-w-lg mx-auto">
                A calm space to track your mood, reflect deeply, and receive kind guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-left">
                <div className="text-5xl font-semibold">7</div>
                <div className="text-sm text-white/70 mt-1">Day streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-left">
                <div className="text-5xl font-semibold">82%</div>
                <div className="text-sm text-white/70 mt-1">Average mood this week</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-left">
                <div className="text-5xl font-semibold">12</div>
                <div className="text-sm text-white/70 mt-1">Journal entries</div>
              </div>
            </div>
          </div>
        )}

        {/* Log Mood Page */}
        {page === 'mood' && (
          <div className="max-w-md mx-auto text-center py-20 text-white">
            <h3 className="text-4xl font-serif mb-6">How are you feeling today?</h3>
            <p className="text-white/80 text-lg">
              Choose your mood gently. Everything is saved with care.
            </p>
            {/* Mood picker coming in next step */}
          </div>
        )}

        {/* Journal Page */}
        {page === 'journal' && (
          <div className="max-w-md mx-auto text-center py-20 text-white">
            <h3 className="text-4xl font-serif mb-6">Today's Reflection</h3>
            <p className="text-white/80 text-lg">
              Write freely or use gentle AI prompts.
            </p>
          </div>
        )}

        {/* New Mood Board Page */}
        {page === 'moodboard' && (
          <div className="text-white">
            <div className="mb-12">
              <h2 className="text-5xl font-serif tracking-tighter mb-3">Monthly Mood Board</h2>
              <p className="text-white/80 text-lg">
                Visual overview of your emotions this month • April 2026
              </p>
            </div>

            {/* Placeholder for Mood Board */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-12 text-center">
              <h3 className="text-2xl font-medium mb-4">Your Monthly Emotions</h3>
              <p className="text-white/70 max-w-md mx-auto">
                Here you will see a beautiful visual summary of your moods — 
                color-coded calendar, mood trends, and insights.
              </p>
              <div className="mt-10 text-sm text-white/60">
                Mood Board features coming in the next steps...
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="text-center py-12 text-xs text-white/60 border-t border-white/20 mt-20 relative z-10">
        Zenith — Gentle steps toward your highest self
      </footer>
    </div>
  );
}

export default App;