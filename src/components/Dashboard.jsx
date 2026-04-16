import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
    const fetchDashboardData = async () => {
      try {
        // Fetch Moods
        const moodsQuery = query(collection(db, "moods"), orderBy("date", "desc"));
        const moodsSnapshot = await getDocs(moodsQuery);
        const moodsList = moodsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch Journal Entries
        const journalsSnapshot = await getDocs(collection(db, "journal"));
        const journalsList = journalsSnapshot.docs.map(doc => doc.data());

        // Calculate Streak (consecutive days with mood entries)
        const streak = calculateStreak(moodsList);

        // Calculate Average Mood (this week)
        const averageMood = calculateAverageMood(moodsList);

        setStats({
          streak: streak,
          averageMood: averageMood.toFixed(0),
          totalJournals: journalsList.length,
          totalMoods: moodsList.length,
        });

        setRecentMoods(moodsList.slice(0, 3)); // Show 3 most recent moods
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate current streak
  const calculateStreak = (moods) => {
    if (moods.length === 0) return 0;

    const dates = moods.map(m => new Date(m.date).toDateString());
    const uniqueDates = [...new Set(dates)].sort().reverse();

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateStr = currentDate.toDateString();
      if (uniqueDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  // Calculate average mood intensity
  const calculateAverageMood = (moods) => {
    if (moods.length === 0) return 0;
    const sum = moods.reduce((acc, mood) => acc + mood.intensity, 0);
    return sum / moods.length;
  };

  if (loading) {
    return <div className="text-center py-20 text-white">Loading your progress...</div>;
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif tracking-tighter text-white mb-3">
          Good evening, {user.email.split('@')[0]}
        </h2>
        <p className="text-white/80 text-xl">Here's how your journey is unfolding</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">🔥</div>
          <div className="text-6xl font-semibold text-white">{stats.streak}</div>
          <p className="text-white/70 mt-2">Day Streak</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">📈</div>
          <div className="text-6xl font-semibold text-white">{stats.averageMood}</div>
          <p className="text-white/70 mt-2">Avg Mood</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">📖</div>
          <div className="text-6xl font-semibold text-white">{stats.totalJournals}</div>
          <p className="text-white/70 mt-2">Journal Entries</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">🌿</div>
          <div className="text-6xl font-semibold text-white">{stats.totalMoods}</div>
          <p className="text-white/70 mt-2">Moods Logged</p>
        </div>
      </div>

      {/* Recent Moods Preview */}
      {recentMoods.length > 0 && (
        <div>
          <h3 className="text-white text-2xl font-medium mb-6">Recent Moods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentMoods.map((entry) => (
              <div key={entry.id} className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{entry.mood.emoji}</span>
                  <div>
                    <p className="text-white font-medium">{entry.mood.label}</p>
                    <p className="text-white/70 text-sm">
                      Intensity: {entry.intensity}/10
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;