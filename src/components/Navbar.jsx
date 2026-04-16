import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { NavLink, Link } from "react-router-dom";

const Navbar = ({ user }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  // Helper function to keep the code clean
  const navLinkStyles = ({ isActive }) => 
    `px-6 py-2.5 rounded-2xl transition-all hover:bg-white/20 ${
      isActive ? 'bg-white/30 font-semibold shadow-inner' : 'opacity-70 hover:opacity-100'
    }`;

  return (
    <nav className="bg-white/5 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
        
        {/* Logo - Clicking this takes you back home */}
        <Link to="/" className="text-3xl font-serif tracking-tight text-white hover:opacity-80 transition-opacity">
          Zenith
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-4 text-sm font-medium text-white">
          <NavLink to="/" className={navLinkStyles}>
            Dashboard
          </NavLink>
          
          <NavLink to="/mood" className={navLinkStyles}>
            Log Mood
          </NavLink>
          
          <NavLink to="/journal" className={navLinkStyles}>
            Journal
          </NavLink>
          
          <NavLink to="/moodboard" className={navLinkStyles}>
            Mood Board
          </NavLink>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Account</span>
            <span className="text-white/80 text-xs font-serif italic">{user?.email}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-[#F5C96A] border border-[#F5C96A]/20 hover:bg-[#F5C96A]/10 rounded-2xl transition-all active:scale-95"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;