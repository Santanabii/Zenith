import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";


const MoodBoard = ({ user }) => {
  //  STATE 
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);

//  Pulls data from firestore 
  useEffect(() => {
    if (!user) return;

    const fetchMoods = async () => {
      try {
        // We query the "moods" folder, specifically for this month/year
        const q = query(
          collection(db, "moods"), 
          orderBy("date", "desc")
        );
        
        const snapshot = await getDocs(q);
        const fetchedMoods = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMoods(fetchedMoods);
      } catch (err) {
        console.error("MoodBoard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoods();
  }, [user]);

  /**
   * 2.Colour match to emotions
   */
  const getMoodColor = (moodValue) => {
    const colors = {
      "very-sad": "bg-red-500/20 border-red-500/50",
      "sad": "bg-orange-500/20 border-orange-500/50",
      "neutral": "bg-yellow-500/20 border-yellow-500/50",
      "good": "bg-emerald-500/20 border-emerald-500/50",
      "very-good": "bg-teal-500/20 border-teal-500/50",
      "great": "bg-cyan-500/20 border-cyan-500/50",
    };
    return colors[moodValue] || "bg-gray-500/20 border-gray-500/50";
  };

  // Loading state with a "Sanctuary" vibe
  if (loading) return (
    <div className="text-center py-20 text-white/40 tracking-[0.5em] uppercase text-xs animate-pulse">
      Gathering your energies...
    </div>
  );

  return (
    <div className="animate-in fade-in duration-1000">
      {/* HEADER SECTION */}
      <div className="text-center mb-16">
        <h2 className="text-6xl font-serif tracking-tighter text-white mb-4">
          Monthly <span className="italic text-[#F5C96A]">Visions</span>
        </h2>
        <p className="text-white/60 text-lg font-light italic">
          April 2026 • A visual tapestry of your inner world.
        </p>
      </div>

      {/* 3. CONDITIONAL RENDERING */}
      {moods.length === 0 ? (
        // Empty State: Encourage the user to begin their practice
        <div className="text-center py-32 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem]">
          <p className="text-5xl mb-6">🌫️</p>
          <p className="text-white font-serif text-2xl italic mb-2">The canvas is quiet.</p>
          <p className="text-white/40 text-sm uppercase tracking-widest">Start logging your moods to reveal patterns.</p>
        </div>
      ) : (
        // THE GRID: Responsive layout (1 col mobile, 2 col tablet, 4 col desktop)
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {moods.map((entry) => (
            <div 
              key={entry.id} 
              className={`group relative backdrop-blur-3xl border rounded-[2.5rem] p-10 text-center transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-yellow-500/5 ${getMoodColor(entry.mood.value)}`}
            >
              {/* DATE BADGE */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
                {new Date(entry.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </div>

              {/* MOOD EMOJI with hover animation */}
              <div className="text-7xl mb-6 mt-4 transition-transform duration-500 group-hover:rotate-12">
                {entry.mood.emoji}
              </div>

              <p className="font-serif text-2xl text-white mb-1 italic">{entry.mood.label}</p>
              
              {/* INTENSITY BAR: A small visual detail to show intensity at a glance */}
              <div className="mt-4 flex justify-center items-center gap-1">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 w-2 rounded-full ${i < entry.intensity ? 'bg-white/60' : 'bg-white/10'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      
      <div className="mt-24 py-12 border-t border-white/10 text-center text-white/20 text-[10px] uppercase tracking-[0.5em] font-bold">
        Advanced Insights • Trend Charts • Emotional Echoes Coming Soon
      </div>
    </div>
  );
};

export default MoodBoard;