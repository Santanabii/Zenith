const LandingPage = ({ isLogin, setIsLogin, email, setEmail, password, setPassword, error, loading, handleAuth }) => {
  return (
    <div className="min-h-screen font-sans relative overflow-hidden">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/src/assets/bg2.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl text-center text-white">
          <h1 className="text-7xl font-serif tracking-tighter mb-6">
            Find your <span className="text-[#F5C96A]">Zenith</span>
          </h1>
          <p className="text-2xl text-white/90 mb-10 leading-relaxed">
            A serene space to gently track your daily moods, reflect through journaling, 
            and receive kind AI guidance on your journey to inner peace.
          </p>

          <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 max-w-md mx-auto">
            <h2 className="text-3xl font-medium mb-8">
              {isLogin ? "Welcome back" : "Join Zenith"}
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

            <p className="mt-6 text-white/70">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#F5C96A] hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;