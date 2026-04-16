import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "./firebase";

// Import Components
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MoodLogger from './components/MoodLogger';
import Journal from './components/Journal';
import MoodBoard from './components/MoodBoard';

// Import your background directly (Vite handles this better than string paths)
import bgImage from './assets/bg2.jpg';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // 1. Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Reset to dashboard whenever a user successfully logs in
      if (currentUser) {
        setCurrentPage("dashboard");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Note: You can add updateProfile(auth.currentUser, {displayName: name}) here later
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      // Cleaner error messages for the UI
      const message = err.code?.split('/')[1]?.replace(/-/g, ' ') || err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Show Landing Page if user is not logged in
  if (!user) {
    return (
      <LandingPage 
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        handleAuth={handleAuth}
      />
    );
  }

  // 3. Show Protected App if user is logged in
  return (
    <div className="min-h-screen font-sans relative overflow-hidden text-white selection:bg-[#F5C96A] selection:text-gray-900">
      
      {/* Dynamic Background Layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10 transition-all duration-1000"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Softening the background for readability */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Navbar Component */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
      />

      {/* Main Content Area with Page Transitions */}
      <main className="max-w-6xl mx-auto px-6 py-12 relative z-10 min-h-[calc(100vh-160px)]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {currentPage === 'dashboard' && <Dashboard user={user} />}
          {currentPage === 'mood' && <MoodLogger />}
          {currentPage === 'journal' && <Journal user={user} />}
          {currentPage === 'moodboard' && <MoodBoard user={user} />}
        </div>
      </main>

      <footer className="text-center py-16 text-xs text-white/30 tracking-[0.3em] uppercase relative z-10">
        Zenith — Built with intention in Kenya
      </footer>
    </div>
  );
}

export default App;