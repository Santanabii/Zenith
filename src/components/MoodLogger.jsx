import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  limit 
} from "firebase/firestore";
import { db } from "../firebase";
import OpenAI from "openai";

// Initialize OpenAI outside the component to prevent re-initialization on every render
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

  // Load moods from Firebase - Wrapped in a function we can call after saving
  const loadMoods = async () => {
    try {
      const q = query(collection(db, "moods"), orderBy("date", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMoods(list);
    } catch (err) {
      console.error("Failed to load moods:", err);
    }
  };

  useEffect(() => {
    loadMoods();
  }, []);

  // AI Reflection Logic
  const getAIReflection = async () => {
    if (!selectedMood) return alert("Please select a mood first.");
    
    setLoadingReflection(true);
    setAiReflection(""); // Clear old reflection

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Efficient and cheaper for this use case
        messages: [
          { 
            role: "system", 
            content: "You are Zenith, a gentle mental wellness guide. Provide warm, empathetic, and extremely concise reflections (max 60 words)." 
          },
          { 
            role: "user", 
            content: `I feel ${selectedMood.label} with an intensity of ${intensity}/10. Context: ${note || 'No note provided.'}` 
          }
        ],
        temperature: 0.7,
      });

      setAiReflection(response.choices[0].message.content);
    } catch (error) {
      console.error("AI Error:", error);
      setAiReflection("I'm here for you, even when my systems are quiet. Take a deep breath and be kind to yourself.");
    } finally {
      setLoadingReflection(false);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);

    try {
      const newEntry = {
        date: new Date().toISOString(),
        mood: selectedMood,
        intensity,
        note: note.trim(),
        reflection: aiReflection // Save the reflection if it exists!
      };

      await addDoc(collection(db, "moods"), newEntry);
      
      // Local state update is faster than waiting for a full re-fetch
      setMoods(prev => [newEntry, ...prev]);
      
      // Reset form
      setSelectedMood(null);
      setIntensity(5);
      setNote("");
      setAiReflection("");
      alert("Reflection saved to your sanctuary.");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-6xl font-serif text-white mb-4">How are you?</h2>
        <p className="text-white/50 italic font-serif">Be honest with your soul today.</p>
      </div>

      {/* Mood Buttons */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood)}
            className={`p-6 rounded-[2rem] transition-all duration-300 flex flex-col items-center gap-3 border
              ${selectedMood?.value === mood.value 
                ? 'bg-[#F5C96A] border-[#F5C96A] text-gray-900 scale-105 shadow-lg shadow-[#F5C96A]/20' 
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xs font-bold uppercase tracking-widest">{mood.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Intensity */}
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex justify-between items-end mb-6">
              <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Intensity</span>
              <span className="text-3xl font-serif text-[#F5C96A] italic">{intensity}/10</span>
            </div>
            <input
              type="range" min="1" max="10" value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full accent-[#F5C96A] cursor-pointer"
            />
          </div>

          {/* Note Area */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Capture the whisper of your thoughts..."
            className="w-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F5C96A] transition-all placeholder:text-white/20"
            rows="3"
          />

          {/* AI Reflection Area */}
          {aiReflection && (
            <div className="bg-white/10 border border-[#F5C96A]/30 backdrop-blur-xl p-8 rounded-[2.5rem] text-white animate-in zoom-in-95">
              <p className="text-sm uppercase tracking-[0.2em] text-[#F5C96A] mb-3 font-bold">Zenith Reflection</p>
              <p className="text-xl font-serif leading-relaxed italic">"{aiReflection}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={getAIReflection}
              disabled={loadingReflection}
              className="flex-1 py-5 bg-white/10 border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {loadingReflection ? "Listening..." : "Get AI Reflection"}
            </button>
            <button
              onClick={handleSaveMood}
              disabled={saving}
              className="flex-1 py-5 bg-[#F5C96A] text-gray-950 rounded-full font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-yellow-500/10"
            >
              {saving ? "Storing..." : "Save Entry"}
            </button>
          </div>
        </div>
      )}

      {/* History (Optional - or move to Dashboard) */}
      <div className="mt-32">
        <h3 className="text-2xl font-serif mb-8 text-white/40">Past Moments</h3>
        <div className="space-y-4">
          {moods.map((m) => (
            <div key={m.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <span className="text-4xl">{m.mood.emoji}</span>
                <div>
                  <p className="text-white font-serif text-lg">{m.mood.label} ({m.intensity}/10)</p>
                  <p className="text-white/30 text-xs">{new Date(m.date).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => deleteMood(m.id)} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs transition-opacity uppercase font-bold tracking-widest">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodLogger;