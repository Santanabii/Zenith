import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Import Components
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MoodLogger from './components/MoodLogger';
import Journal from './components/Journal';
import MoodBoard from './components/MoodBoard';

// Asset Import (Vite-safe way)
import bgImage from './assets/bg2.jpg';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const location = useLocation();

  // 1. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Loading State (Prevents flicker while checking if user is logged in)
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#F5C96A] font-serif italic animate-pulse tracking-widest">
          Zenith is awakening...
        </div>
      </div>
    );
  }

  // 3. Unauthorized: Show Landing Page if user is not logged in
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 4. Authorized: Show Protected App
  return (
    <div className="min-h-screen font-sans relative overflow-hidden text-white selection:bg-[#F5C96A] selection:text-gray-900">
      
      {/* Background Layer - Fixed so it doesn't scroll */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"></div>
      </div>

      {/* Navigation - Stays visible across all routes */}
      <Navbar user={user} />

      {/* Main Content Area with Page Transitions */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10 min-h-[calc(100vh-160px)]">
        <div 
          key={location.pathname} // Re-triggers animation on page change
          className="animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/mood" element={<MoodLogger />} />
            <Route path="/journal" element={<Journal user={user} />} />
            <Route path="/moodboard" element={<MoodBoard user={user} />} />
            
            {/* Catch-all: Redirect unknown paths to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <footer className="text-center py-16 text-xs text-white/30 tracking-[0.4em] uppercase relative z-10">
        Zenith — Built with intention
      </footer>
    </div>
  );
}

export default App;