import { useState, useEffect } from 'react';

const MoodBoard = () => {
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    const savedMoods = JSON.parse(localStorage.getItem('zenithMoods') || '[]');
    setMoods(savedMoods);
  }, []);

  // Simple mood color mapping
  const getMoodColor = (moodValue) => {
    if (moodValue === "very-sad") return "bg-red-500";
    if (moodValue === "sad") return "bg-orange-500";
    if (moodValue === "neutral") return "bg-yellow-500";
    if (moodValue === "good") return "bg-emerald-500";
    if (moodValue === "very-good") return "bg-teal-500";
    if (moodValue === "great") return "bg-cyan-500";
    return "bg-gray-500";
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif tracking-tighter text-white mb-4">Monthly Mood Board</h2>
        <p className="text-white/80 text-lg">April 2026 • Visual summary of your emotions</p>
      </div>

      {moods.length === 0 ? (
        <div className="text-center py-20 bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl">
          <p className="text-3xl mb-4">🌫️</p>
          <p className="text-white/80">No moods logged yet.</p>
          <p className="text-white/60 mt-2">Start logging your moods to see your monthly pattern here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {moods.slice(0, 12).map((entry, index) => (
            <div 
              key={entry.id} 
              className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-6 text-center hover:scale-105 transition-all"
            >
              <div className="text-6xl mb-4">{entry.mood.emoji}</div>
              <p className="font-medium text-white">{entry.mood.label}</p>
              <p className="text-white/70 text-sm mt-1">
                Intensity: {entry.intensity}/10
              </p>
              <p className="text-white/60 text-xs mt-3">
                {new Date(entry.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 text-center text-white/70 text-sm">
        More advanced mood calendar, trends chart, and insights coming in future updates.
      </div>
    </div>
  );
};

export default MoodBoard;