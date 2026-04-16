import { useState, useEffect } from 'react';

const moodOptions = [
  { emoji: "😢", label: "Very Sad", value: "very-sad" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "🙂", label: "Good", value: "good" },
  { emoji: "😊", label: "Very Good", value: "very-good" },
  { emoji: "🥰", label: "Great", value: "great" },
];

const MoodLogger = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState("");
  const [moods, setMoods] = useState([]);

  // Load moods from localStorage
  useEffect(() => {
    const savedMoods = JSON.parse(localStorage.getItem('zenithMoods') || '[]');
    setMoods(savedMoods);
  }, []);

  const handleSaveMood = () => {
    if (!selectedMood) {
      alert("Please select a mood first ✨");
      return;
    }

    const newMood = {
      id: Date.now(),
      date: new Date().toISOString(),
      mood: selectedMood,
      intensity: intensity,
      note: note.trim(),
    };

    const updatedMoods = [newMood, ...moods];
    setMoods(updatedMoods);
    localStorage.setItem('zenithMoods', JSON.stringify(updatedMoods));

    alert("Mood saved successfully! 🌟");

    // Reset form
    setSelectedMood(null);
    setIntensity(5);
    setNote("");
  };

  const deleteMood = (id) => {
    if (!confirm("Delete this mood entry?")) return;
    const updatedMoods = moods.filter(m => m.id !== id);
    setMoods(updatedMoods);
    localStorage.setItem('zenithMoods', JSON.stringify(updatedMoods));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif tracking-tighter text-white mb-4">
          How are you feeling today?
        </h2>
        <p className="text-white/80 text-lg">Choose your mood gently</p>
      </div>

      {/* Mood Picker */}
      <div className="mb-12">
        <p className="text-white/70 text-sm mb-4 text-center">Select your mood</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {moodOptions.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedMood(mood)}
              className={`p-6 rounded-3xl transition-all hover:scale-105 flex flex-col items-center gap-3
                ${selectedMood?.value === mood.value 
                  ? 'bg-white/25 ring-2 ring-[#F5C96A]' 
                  : 'bg-white/10 hover:bg-white/15'}`}
            >
              <span className="text-5xl">{mood.emoji}</span>
              <span className="text-sm font-medium text-white">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="mb-10">
        <div className="flex justify-between text-white/80 text-sm mb-3">
          <span>Low</span>
          <span>Intensity: <span className="font-semibold text-[#F5C96A]">{intensity}</span></span>
          <span>High</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={intensity}
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          className="w-full accent-[#F5C96A] cursor-pointer"
        />
      </div>

      {/* Note */}
      <div className="mb-10">
        <p className="text-white/70 text-sm mb-3">Add a short note (optional)</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What made you feel this way today?"
          rows="3"
          className="w-full p-5 rounded-3xl bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F5C96A]"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveMood}
        className="w-full py-4 bg-[#F5C96A] hover:bg-[#E8B923] text-gray-900 font-semibold rounded-3xl text-lg transition-all active:scale-[0.98]"
      >
        Save Today's Mood
      </button>

      {/* Recent Moods History */}
      {moods.length > 0 && (
        <div className="mt-16">
          <h3 className="text-white text-2xl font-medium mb-6">Recent Moods</h3>
          <div className="space-y-4">
            {moods.slice(0, 6).map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-6 flex justify-between items-start"
              >
                <div className="flex items-center gap-5">
                  <span className="text-5xl">{entry.mood.emoji}</span>
                  <div>
                    <p className="text-white font-medium text-lg">{entry.mood.label}</p>
                    <p className="text-white/70">
                      Intensity: {entry.intensity} • {new Date(entry.date).toLocaleDateString()}
                    </p>
                    {entry.note && (
                      <p className="text-white/80 text-sm mt-2 italic">"{entry.note}"</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMood(entry.id)}
                  className="text-red-400 hover:text-red-300 text-sm mt-1"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodLogger;