import { useRef, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "../firebase";
import bgImage from '../assets/bg2.jpg'; // Import the image correctly for Vite

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const authSectionRef = useRef(null);

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Note: App.jsx's onAuthStateChanged will handle the redirect automatically
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      {/* Fixed Background - Vite/Vercel Safe */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-20 text-center">
          <div className="max-w-4xl animate-in fade-in zoom-in duration-1000">
            <h1 className="text-7xl md:text-8xl font-serif tracking-tighter leading-none mb-8 text-white">
              Your mind is a <span className="text-[#F5C96A]">sanctuary</span>.
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-12 font-serif italic">
              Zenith is a gentle space designed for the modern soul. 
              We believe mental wellness isn't a destination, 
              but a daily practice of awareness and grace.
            </p>

            <button
              onClick={scrollToAuth}
              className="px-12 py-5 bg-[#F5C96A] text-gray-900 font-bold rounded-full text-lg hover:scale-105 transition-all duration-300 shadow-xl shadow-yellow-500/20"
            >
              Begin your journey
            </button>
          </div>
        </div>

        {/* Authentication Section */}
        <div ref={authSectionRef} className="pb-32 px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-12 shadow-2xl">
              <h2 className="text-4xl font-serif italic mb-8 text-white text-center">
                {isLogin ? "Welcome back" : "Create a space"}
              </h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl mb-6 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-6">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C96A] transition-all"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#F5C96A] transition-all"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-white text-gray-900 font-bold rounded-2xl text-lg hover:bg-[#F5C96A] transition-all disabled:opacity-50"
                >
                  {loading ? "Aligning stars..." : (isLogin ? "Enter Sanctuary" : "Join Zenith")}
                </button>
              </form>

              <p className="mt-8 text-white/50 text-sm text-center">
                {isLogin ? "New to this space?" : "Already part of the journey?"}{" "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-[#F5C96A] hover:underline font-bold uppercase tracking-widest text-xs"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;