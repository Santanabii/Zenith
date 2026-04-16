import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"; // Added 'where'
import { db } from "../firebase";

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    streak: 0,
    averageMood: 0,
    totalJournals: 0,
    totalMoods: 0,
  });
  const [recentMoods, setRecentMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch if we actually have a user
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Moods (Filtered by user ID if you have it, or just general for now)
        const moodsQuery = query(
          collection(db, "moods"), 
          orderBy("date", "desc")
        );
        
        const moodsSnapshot = await getDocs(moodsQuery);
        const moodsList = moodsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 2. Fetch Journal Entries
        const journalsSnapshot = await getDocs(collection(db, "journal"));
        const journalsList = journalsSnapshot.docs.map(doc => doc.data());

        // 3. Calculations
        const streak = calculateStreak(moodsList);
        const averageMood = calculateAverageMood(moodsList);

        setStats({
          streak: streak,
          averageMood: averageMood.toFixed(0),
          totalJournals: journalsList.length,
          totalMoods: moodsList.length,
        });

        setRecentMoods(moodsList.slice(0, 3)); 
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]); // Re-run if user changes

  // ... (keep your calculateStreak and calculateAverageMood functions here) ...
  const calculateStreak = (moods) => {
    if (moods.length === 0) return 0;
    const dateStrings = moods.map(m => new Date(m.date).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dateStrings)].sort().reverse();
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (uniqueDates.includes(dateStr)) {
        streak++;
      } else {
        if (streak === 0 && i === 0) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  const calculateAverageMood = (moods) => {
    if (moods.length === 0) return 0;
    return moods.reduce((acc, mood) => acc + mood.intensity, 0) / moods.length;
  };

  // SAFETY: If data is loading or user is missing
  if (!user) return <div className="text-center py-20 text-white font-serif italic text-2xl">Please sign in to view your sanctuary.</div>;
  if (loading) return <div className="text-center py-20 text-white/50 tracking-widest uppercase text-xs">Aligning your journey...</div>;

  return (
    <main className="max-w-6xl mx-auto px-8 py-12 animate-in fade-in duration-1000">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-serif tracking-tighter text-white mb-4">
          Good day, <span className="italic text-[#F5C96A]">{user.displayName || user.email.split('@')[0]}</span>
        </h2>
        <p className="text-white/60 text-lg font-light">Your progress is a testament to your growth.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <StatCard value={stats.streak} label="Day Streak" />
        <StatCard value={`${stats.averageMood}/10`} label="Avg Intensity" />
        <StatCard value={stats.totalJournals} label="Reflections" />
        <StatCard value={stats.totalMoods} label="Moods Logged" />
      </div>

      {/* Recent Moods Preview */}
      {recentMoods.length > 0 && (
        <div className="animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-white text-3xl font-serif">Recent Energies</h3>
            <button className="text-[#F5C96A] text-sm uppercase tracking-widest font-bold hover:text-white transition">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentMoods.map((entry) => (
              <div key={entry.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all group">
                <span className="text-6xl block mb-6 group-hover:scale-110 transition-transform">{entry.mood.emoji}</span>
                <p className="text-white text-xl font-serif mb-1">{entry.mood.label}</p>
                <div className="flex justify-between items-center text-white/40 text-xs uppercase tracking-widest font-bold">
                  <span>Intensity: {entry.intensity}</span>
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

// Sub-component for clean code
const StatCard = ({ value, label }) => (
  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 text-center hover:border-[#F5C96A]/30 transition-colors">
    <div className="text-6xl font-serif text-[#F5C96A] mb-2">{value}</div>
    <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold">{label}</p>
  </div>
);

export default Dashboard;