import { useRef } from 'react';

const LandingPage = ({ isLogin, setIsLogin, email, setEmail, password, setPassword, error, loading, handleAuth }) => {
  const authSectionRef = useRef(null);

  const scrollToAuth = () => {
    authSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/src/assets/bg2.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-20 text-center">
          <div className="max-w-4xl">
            <h1 className="text-7xl md:text-8xl font-serif tracking-tighter leading-none mb-8 text-white">
              Your mind is a <span className="text-[#F5C96A]">sanctuary</span>.
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-12">
              Zenith is a gentle space designed for the modern soul. 
              We believe mental wellness isn't a destination, 
              but a daily practice of awareness and grace.
            </p>

            {/* Begin Your Journey Button */}
            <button
              onClick={scrollToAuth}
              className="px-12 py-4 bg-white text-gray-900 font-semibold rounded-full text-lg hover:bg-[#F5C96A] hover:text-gray-900 transition-all duration-300 shadow-lg"
            >
              Begin your journey
            </button>
          </div>
        </div>

        {/* Authentication Section */}
        <div ref={authSectionRef} className="pb-20 px-6">
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-10">
              <h2 className="text-3xl font-medium mb-8 text-white text-center">
                {isLogin ? "Welcome back" : "Begin your journey"}
              </h2>

              {error && <p className="text-red-400 mb-4 text-sm text-center">{error}</p>}

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

              <p className="mt-6 text-white/70 text-sm text-center">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(""); }}
                  className="text-[#F5C96A] hover:underline font-medium"
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