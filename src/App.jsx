import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Import all page components
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MoodLogger from './components/MoodLogger';
import Journal from './components/Journal';
import MoodBoard from './components/MoodBoard';

// Import background image 
import bgImage from './assets/bg2.jpg';

function App() {
  // 1. State Management
  const [user, setUser] = useState(null);           // Current logged-in user (null = not logged in)
  const [initializing, setInitializing] = useState(true); // Prevents flashing between landing and app
  const location = useLocation();                   // Used for smooth page transition animation

  // 2. Authentication Listener
  // This runs once when the app starts and listens for login/logout changes in real-time
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);        // Update user state when someone logs in or out
      setInitializing(false);      // Done checking auth state
    });

    // Cleanup function: Remove listener when component unmounts (prevents memory leaks)
    return () => unsubscribe();
  }, []);

  // 3. Show Loading Screen While Checking Authentication
  // This prevents showing the wrong page while Firebase checks if user is logged in
  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#F5C96A] font-serif italic animate-pulse tracking-widest text-xl">
          Zenith is awakening...
        </div>
      </div>
    );
  }

  // 4. Public Route: Show Landing Page if user is NOT logged in
  // Only the root path ("/") is allowed when not authenticated
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Redirect any other path back to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 5. Protected Routes: Show the full app only when user is logged in
  return (
    <div className="min-h-screen font-sans relative overflow-hidden text-white selection:bg-[#F5C96A] selection:text-gray-900">
      
      {/* Background Image  */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        
        <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"></div>
      </div>
 
      {/* Navigation Bar */}
      {/* Always visible when logged in */}
      <Navbar user={user} />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10 min-h-[calc(100vh-160px)]">
        
        {/* Page Transition Animation */}
        {/* When routes are changing this just helps it have a smooth transition from one page to the next */}
        <div 
          key={location.pathname}
          className="animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <Routes>
            {/* Default route - Dashboard */}
            <Route path="/" element={<Dashboard user={user} />} />
            
            {/* Mood Logging Page */}
            <Route path="/mood" element={<MoodLogger />} />
            
            {/* Journal Page */}
            <Route path="/journal" element={<Journal user={user} />} />
            
            {/* Mood board */}
            <Route path="/moodboard" element={<MoodBoard user={user} />} />

            {/* Fallback unknown routes will take you back to dashboard which is the default route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-16 text-xs text-white/30 tracking-[0.4em] uppercase relative z-10">
        Zenith — Built with intention
      </footer>
    </div>
  );
}

export default App;