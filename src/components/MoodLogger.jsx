import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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
  const [aiReflection, setAiReflection] = useState("");
  const [loadingReflection, setLoadingReflection] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadMoods = async () => {
    const q = query(collection(db, "moods"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const moodList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMoods(moodList);
  };

  useEffect(() => {
    loadMoods();
  }, []);

  // Save mood WITHOUT waiting for AI (much faster)
  const handleSaveMood = async () => {
    if (!selectedMood) {
      alert("Please select a mood first ✨");
      return;
    }

    setSaving(true);

    const newMood = {
      date: new Date().toISOString(),
      mood: selectedMood,
      intensity: intensity,
      note: note.trim(),
    };

    try {
      await addDoc(collection(db, "moods"), newMood);
      await loadMoods();

      // Reset form immediately
      setSelectedMood(null);
      setIntensity(5);
      setNote("");

      alert("Mood saved successfully! 🌟");
    } catch (error) {
      console.error(error);
      alert("Failed to save mood");
    }

    setSaving(false);
  };

  // Separate button for AI Reflection (user clicks when they want it)
  const getAIReflection = async () => {
    if (!selectedMood) {
      alert("Please select a mood first to get reflection");
      return;
    }

    setLoadingReflection(true);
    setAiReflection("");

    try {
      const prompt = `User feels "${selectedMood.label}" with intensity ${intensity}/10. 
Note: ${note || "No note"}.

Give a short, warm, empathetic suggestion (1-2 gentle actions). Keep under 60 words.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      });

      setAiReflection(completion.choices[0].message.content.trim());
    } catch (error) {
      setAiReflection("Sorry, I couldn't generate a reflection right now. Please try again.");
    }
    setLoadingReflection(false);
  };

  const deleteMood = async (id) => {
    if (!confirm("Delete this mood entry?")) return;
    try {
      await deleteDoc(doc(db, "moods", id));
      await loadMoods();
    } catch (error) {
      console.error(error);
    }
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

      {/* Intensity */}
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

      <div className="flex gap-4">
        <button
          onClick={handleSaveMood}
          disabled={saving || !selectedMood}
          className="flex-1 py-4 bg-[#F5C96A] hover:bg-[#E8B923] text-gray-900 font-semibold rounded-3xl text-lg transition-all disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Mood"}
        </button>

        <button
          onClick={getAIReflection}
          disabled={loadingReflection || !selectedMood}
          className="flex-1 py-4 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-medium rounded-3xl text-lg transition-all disabled:opacity-70"
        >
          {loadingReflection ? "Thinking..." : "Get AI Reflection"}
        </button>
      </div>

      {/* AI Reflection Display */}
      {aiReflection && (
        <div className="mt-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/40 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🌿</span>
            <h3 className="text-xl font-medium text-white">Gentle AI Reflection</h3>
          </div>
          <p className="text-white leading-relaxed text-lg">
            {aiReflection}
          </p>
        </div>
      )}

      {/* Recent Moods */}
      {moods.length > 0 && (
        <div className="mt-16">
          <h3 className="text-white text-2xl font-medium mb-6">Recent Moods</h3>
          <div className="space-y-4">
            {moods.slice(0, 8).map((entry) => (
              <div key={entry.id} className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-6 flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <span className="text-5xl">{entry.mood.emoji}</span>
                  <div>
                    <p className="text-white font-medium text-lg">{entry.mood.label}</p>
                    <p className="text-white/70">
                      Intensity: {entry.intensity}/10 • {new Date(entry.date).toLocaleDateString()}
                    </p>
                    {entry.note && <p className="text-white/80 text-sm mt-2">"{entry.note}"</p>}
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