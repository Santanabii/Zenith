import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "./firebase";   // We'll create this file next
import backgroundImage from './assets/bg2.jpg';

function App() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // true = login, false = signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard"); // inside the app

  // Listen for auth state changes
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
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  // If user is NOT logged in → show Landing Page
  if (!user) {
    return (
      <div className="min-h-screen font-sans relative overflow-hidden">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-2xl text-center text-white">
            <h1 className="text-7xl font-serif tracking-tighter mb-6">
              Find your <span className="text-[#F5C96A]">Zenith</span>
            </h1>
            
            <p className="text-2xl text-white/90 mb-8 leading-relaxed">
              A serene space to track your daily moods, reflect through journaling, 
              and receive gentle AI guidance on your journey to inner balance.
            </p>

            <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 max-w-md mx-auto">
              <h2 className="text-3xl font-medium mb-8">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>

              {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

              <form onSubmit={handleAuth} className="space-y-6">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:border-[#F5C96A]"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:border-[#F5C96A]"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#F5C96A] hover:bg-[#E8B923] text-gray-900 font-semibold rounded-2xl text-lg transition-all disabled:opacity-70"
                >
                  {loading ? "Please wait..." : (isLogin ? "Log In" : "Create Account")}
                </button>
              </form>

              <p className="mt-6 text-white/70 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[#F5C96A] hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>

            <p className="mt-12 text-white/60 text-sm">
              Gentle mood tracking • Reflective journaling • AI insights
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user IS logged in → show the full app
  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/65"></div>
      </div>

      {/* Protected Navbar */}
      <nav className="bg-white/10 backdrop-blur-2xl border-b border-white/25 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-serif tracking-tight text-white">Zenith</h1>

          <div className="flex items-center gap-8 text-sm font-medium text-white">
            <button onClick={() => setCurrentPage('dashboard')} className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'dashboard' ? 'bg-white/30 font-semibold' : ''}`}>Dashboard</button>
            <button onClick={() => setCurrentPage('mood')} className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'mood' ? 'bg-white/30 font-semibold' : ''}`}>Log Mood</button>
            <button onClick={() => setCurrentPage('journal')} className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'journal' ? 'bg-white/30 font-semibold' : ''}`}>Journal</button>
            <button onClick={() => setCurrentPage('moodboard')} className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'moodboard' ? 'bg-white/30 font-semibold' : ''}`}>Mood Board</button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20 rounded-2xl transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-12 relative z-10 text-white">
        {currentPage === 'dashboard' && <div className="text-center py-20 text-3xl">Welcome back! Dashboard coming soon...</div>}
        {currentPage === 'mood' && <div className="text-center py-20 text-3xl">Log Mood page (we'll build this next)</div>}
        {currentPage === 'journal' && <div className="text-center py-20 text-3xl">Journal page coming soon...</div>}
        {currentPage === 'moodboard' && <div className="text-center py-20 text-3xl">Mood Board coming soon...</div>}
      </main>
    </div>
  );
}

export default App;