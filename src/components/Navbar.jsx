import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Navbar = ({ currentPage, setCurrentPage, user }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="bg-white/10 backdrop-blur-2xl border-b border-white/25 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
        <h1 className="text-3xl font-serif tracking-tight text-white">Zenith</h1>

        <div className="flex gap-8 text-sm font-medium text-white">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'dashboard' ? 'bg-white/30 font-semibold' : ''}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('mood')}
            className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'mood' ? 'bg-white/30 font-semibold' : ''}`}
          >
            Log Mood
          </button>
          <button 
            onClick={() => setCurrentPage('journal')}
            className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'journal' ? 'bg-white/30 font-semibold' : ''}`}
          >
            Journal
          </button>
          <button 
            onClick={() => setCurrentPage('moodboard')}
            className={`px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${currentPage === 'moodboard' ? 'bg-white/30 font-semibold' : ''}`}
          >
            Mood Board
          </button>
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
  );
};

export default Navbar;