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

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  // Show Landing Page if user is not logged in
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

  // Show Protected App if user is logged in
  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/src/assets/bg2.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/65"></div>
      </div>

      {/* Navbar Component */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        user={user} 
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-8 py-12 relative z-10 text-white min-h-[calc(100vh-80px)]">
        {currentPage === 'dashboard' && <Dashboard user={user} />}
        {currentPage === 'mood' && <MoodLogger />}
        {currentPage === 'journal' && <Journal />}
        {currentPage === 'moodboard' && <MoodBoard />}
      </main>

      <footer className="text-center py-12 text-xs text-white/60 border-t border-white/20 mt-20 relative z-10">
        Zenith — Gentle steps toward your highest self
      </footer>
    </div>
  );
}

export default App;