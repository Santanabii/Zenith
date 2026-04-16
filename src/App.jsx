import { useState, useEffect } from 'react';
import backgroundImage from './assets/bg2.jpg';

// Component Imports
import Home from './components/Home';
import Dashboard from './components/Dashboard';

const moodOptions = [
  { emoji: "😢", label: "Very Sad", value: "very-sad" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "🙂", label: "Good", value: "good" },
  { emoji: "😊", label: "Very Good", value: "very-good" },
  { emoji: "🥰", label: "Great", value: "great" },
];

function App() {
  // 1. STATE MANAGEMENT
  const [page, setPage] = useState('home'); // Starts on Home pitch
  const [user, setUser] = useState(null);   // Placeholder for Firebase User
  const [moods, setMoods] = useState([]);   // User mood data
  
  // Mood Entry States
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");

  // 2. DATA PERSISTENCE (LocalStorage for now)
  useEffect(() => {
    const savedMoods = JSON.parse(localStorage.getItem('zenithMoods') || '[]');
    setMoods(savedMoods);
  }, []);

  // 3. NAVIGATION & AUTH LOGIC
  const navigateTo = (target) => {
    // If user tries to access private pages without "logging in"
    // We can simulate the check here
    const privatePages = ['dashboard', 'mood', 'journal', 'moodboard'];
    
    if (privatePages.includes(target) && !user) {
      // For now, let's just simulate a login when they click "Begin"
      // In the next step, we will replace this with a real Firebase Login
      alert("Please Sign In to access your personal sanctuary. ✨");
      return;
    }
    setPage(target);
  };

  // 4. MOOD SAVING LOGIC
  const handleSaveMood = () => {
    if (!selectedMood) return alert("Select a mood first ");

    const newMood = {
      id: Date.now(),
      date: new Date().toISOString(),
      mood: selectedMood,
      intensity,
      note: note.trim(),
    };

    const updatedMoods = [newMood, ...moods];
    setMoods(updatedMoods);
    localStorage.setItem('zenithMoods', JSON.stringify(updatedMoods));

    // Reset and redirect
    setSelectedMood(null);
    setIntensity(5);
    setNote("");
    setPage('dashboard');
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden text-white selection:bg-[#F5C96A] selection:text-gray-900">
      
      {/* BACKGROUND LAYER */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-20 scale-105 transition-transform duration-[10s]"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-white/5 backdrop-blur-3xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setPage('home')}>
            <h1 className="text-2xl font-serif tracking-tight text-white">Zenith</h1>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <NavButton active={page === 'home'} onClick={() => setPage('home')} label="Home" />
            <NavButton active={page === 'dashboard'} onClick={() => navigateTo('dashboard')} label="Dashboard" />
            <NavButton active={page === 'mood'} onClick={() => navigateTo('mood')} label="Log Mood" />
            <NavButton active={page === 'journal'} onClick={() => navigateTo('journal')} label="Journal" />
          </div>

          {/* User Action */}
          <button 
            onClick={() => setUser({ displayName: "Developer" })} // Simulating login for testing
            className="px-6 py-2.5 bg-[#F5C96A] hover:bg-white text-gray-900 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/10"
          >
            {user ? 'Profile' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* DYNAMIC PAGE CONTENT */}
      <div className="relative z-10 transition-all duration-700">
        
        {/* 1. HOME (LANDING) */}
        {page === 'home' && (
          <Home onGetStarted={() => {
            setUser({ displayName: "Zenith User" }); // Simulate Login
            setPage('dashboard');
          }} />
        )}

        {/* 2. DASHBOARD */}
        {page === 'dashboard' && (
          <Dashboard moods={moods} setPage={setPage} user={user} />
        )}

        {/* 3. LOG MOOD */}
        {page === 'mood' && (
          <main className="max-w-2xl mx-auto px-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-6xl font-serif tracking-tighter mb-4">The Daily Log</h2>
              <p className="text-white/60 text-lg">Honesty is the first step toward peace.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-8 rounded-[2.5rem] transition-all duration-500 flex flex-col items-center gap-3 border
                    ${selectedMood?.value === mood.value 
                      ? 'bg-white/20 border-[#F5C96A] scale-105' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <span className="text-5xl mb-2">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>

            {selectedMood && (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                  <div className="flex justify-between text-sm mb-6 uppercase tracking-widest text-white/50">
                    <span>Intensity</span>
                    <span className="text-[#F5C96A] font-bold">{intensity}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10" value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full accent-[#F5C96A] cursor-pointer"
                  />
                </div>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Capture the thought..."
                  rows="4"
                  className="w-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C96A] transition-all"
                />

                <button
                  onClick={handleSaveMood}
                  className="w-full py-5 bg-[#F5C96A] hover:bg-white text-gray-950 font-bold rounded-full text-lg transition-all"
                >
                  Save Reflection
                </button>
              </div>
            )}
          </main>
        )}

        {/* 4. OTHER PAGES */}
        {(page === 'journal' || page === 'moodboard') && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-2xl font-serif italic text-white/30">The {page} is being carefully prepared...</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="text-center py-20 text-xs text-white/20 tracking-[0.3em] uppercase mt-20 relative z-10">
        Zenith — Gently built in Nairobi
      </footer>
    </div>
  );
}

// Nav Button Sub-component
const NavButton = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`px-5 py-2 rounded-full transition-all duration-300 border text-xs uppercase tracking-widest
      ${active 
        ? 'bg-white/20 border-white/30 text-white' 
        : 'bg-transparent border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
  >
    {label}
  </button>
);

export default App;