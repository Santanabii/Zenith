import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";

/**
 * DASHBOARD COMPONENT
 * It aggregates data from two different Firestore collections (moods & journal) to show a summary of the user's journey.
 */
const Dashboard = ({ user }) => {
  // 1. STATE DEFINITIONS
  // 'stats' holds our calculated data. We initialize with 0s to avoid 'undefined' errors in the UI.
  const [stats, setStats] = useState({
    streak: 0,
    averageMood: 0,
    totalJournals: 0,
    totalMoods: 0,
  });
  const [recentMoods, setRecentMoods] = useState([]); // Store only the 3 most recent moods
  const [loading, setLoading] = useState(true);      // Controls the "Aligning your journey" screen

  useEffect(() => {
    // SECURITY: If the App.jsx hasn't passed a user yet, don't try to fetch data
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        /**
         * 2. FIRESTORE DATA FETCHING
         * We use 'query' and 'orderBy' to get data from newest to oldest.
         * NOTE: Eventually, you'll want to add: where("userId", "==", user.uid)
         * to ensure users only see THEIR own data.
         */
        const moodsQuery = query(
          collection(db, "moods"), 
          orderBy("date", "desc")
        );
        
        // await getDocs pulls the data from the cloud
        const moodsSnapshot = await getDocs(moodsQuery);
        const moodsList = moodsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() // Spreads the fields like 'mood', 'intensity', 'date'
        }));

        // Fetching the 'journal' collection to count total reflections
        const journalsSnapshot = await getDocs(collection(db, "journal"));
        const journalsList = journalsSnapshot.docs.map(doc => doc.data());

        /**
         * 3. DATA PROCESSING
         * Instead of just showing raw data, we "compute" insights.
         */
        const streak = calculateStreak(moodsList);
        const averageMood = calculateAverageMood(moodsList);

        // Update the state with our calculated values
        setStats({
          streak: streak,
          averageMood: averageMood.toFixed(0), // Rounds 7.66 to 8 for a cleaner look
          totalJournals: journalsList.length,
          totalMoods: moodsList.length,
        });

        // We only want the first 3 items for the "Recent Energies" preview
        setRecentMoods(moodsList.slice(0, 3)); 
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false); // Stop the loading animation regardless of success/fail
      }
    };

    fetchDashboardData();
  }, [user]); // Only re-run this entire function if the logged-in user changes

  /**
   * 4. THE STREAK ALGORITHM
   * This is the "Brain" of the dashboard. It checks how many days in a row
   * you have logged your mood.
   */
  const calculateStreak = (moods) => {
    if (moods.length === 0) return 0;
    
    // Convert complex ISO dates into simple 'YYYY-MM-DD' strings for easy comparison
    const dateStrings = moods.map(m => new Date(m.date).toISOString().split('T')[0]);
    
    // Remove duplicates (in case user logged 2 moods in 1 day) and sort newest first
    const uniqueDates = [...new Set(dateStrings)].sort().reverse();
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison

    // Loop backwards for up to 60 days to find the consecutive chain
    for (let i = 0; i < 60; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (uniqueDates.includes(dateStr)) {
        streak++;
      } else {
        // ALLOWANCE: If the streak is 0 and we are checking 'today', 
        // give the user until the end of the day to log before breaking the streak.
        if (streak === 0 && i === 0) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break; // Streak is broken, exit the loop
      }
      currentDate.setDate(currentDate.getDate() - 1); // Move to yesterday
    }
    return streak;
  };

  /**
   * 5. THE MATH: AVERAGE MOOD
   * sum of all intensities / total count
   */
  const calculateAverageMood = (moods) => {
    if (moods.length === 0) return 0;
    return moods.reduce((acc, mood) => acc + mood.intensity, 0) / moods.length;
  };

  // CONDITIONAL RENDERING: Safety checks to prevent errors while data is traveling
  if (!user) return <div className="text-center py-20 text-white font-serif italic text-2xl">Please sign in to view your sanctuary.</div>;
  if (loading) return <div className="text-center py-20 text-white/50 tracking-widest uppercase text-xs">Aligning your journey...</div>;

  return (
    <main className="max-w-6xl mx-auto px-8 py-12 animate-in fade-in duration-1000">
      
      {/* GREETING SECTION */}
      <div className="text-center mb-16">
        <h2 className="text-6xl font-serif tracking-tighter text-white mb-4">
          {/* Fallback to email if displayName isn't set in Firebase Auth */}
          Good day, <span className="italic text-[#F5C96A]">{user.displayName || user.email.split('@')[0]}</span>
        </h2>
        <p className="text-white/60 text-lg font-light">Your progress is a testament to your growth.</p>
      </div>

      {/* STATS GRID: Uses the StatCard sub-component for reusability */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <StatCard value={stats.streak} label="Day Streak" />
        <StatCard value={`${stats.averageMood}/10`} label="Avg Intensity" />
        <StatCard value={stats.totalJournals} label="Reflections" />
        <StatCard value={stats.totalMoods} label="Moods Logged" />
      </div>

      {/* RECENT ENTRIES PREVIEW */}
      {recentMoods.length > 0 && (
        <div className="animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-white text-3xl font-serif">Recent Energies</h3>
            <button className="text-[#F5C96A] text-sm uppercase tracking-widest font-bold hover:text-white transition">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentMoods.map((entry) => (
              /* CARD: A glassmorphism container for each mood */
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

/**
 * SUB-COMPONENT: StatCard
 * Using a separate component keeps the main Dashboard code clean.
 * It takes 'value' and 'label' as props to display stats consistently.
 */
const StatCard = ({ value, label }) => (
  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 text-center hover:border-[#F5C96A]/30 transition-colors">
    <div className="text-6xl font-serif text-[#F5C96A] mb-2">{value}</div>
    <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-bold">{label}</p>
  </div>
);

export default Dashboard;