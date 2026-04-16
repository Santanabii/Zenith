import { useState, useEffect } from 'react';
import { 
  collection, addDoc, getDocs, deleteDoc, 
  doc, query, orderBy, limit, updateDoc 
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
  
  // NEW: State for editing
  const [editingId, setEditingId] = useState(null);

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

  useEffect(() => { loadMoods(); }, []);

  const getAIReflection = async () => {
    if (!selectedMood) return alert("Please select a mood first.");
    setLoadingReflection(true);
    setAiReflection("");
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are Zenith, a gentle mental wellness guide. Provide warm, empathetic, and extremely concise reflections (max 60 words)." },
          { role: "user", content: `I feel ${selectedMood.label} with an intensity of ${intensity}/10. Context: ${note || 'No note provided.'}` }
        ],
        temperature: 0.7,
      });
      setAiReflection(response.choices[0].message.content);
    } catch (error) {
      setAiReflection("I'm here for you. Take a deep breath.");
    } finally {
      setLoadingReflection(false);
    }
  };

  const handleSaveOrUpdate = async () => {
    if (!selectedMood) return;
    setSaving(true);

    const entryData = {
      date: new Date().toISOString(),
      mood: selectedMood,
      intensity,
      note: note.trim(),
      reflection: aiReflection
    };

    try {
      if (editingId) {
        // UPDATE EXISTING
        await updateDoc(doc(db, "moods", editingId), entryData);
        setMoods(prev => prev.map(m => m.id === editingId ? { id: editingId, ...entryData } : m));
      } else {
        // CREATE NEW
        const docRef = await addDoc(collection(db, "moods"), entryData);
        setMoods(prev => [{ id: docRef.id, ...entryData }, ...prev]);
      }

      // Reset Form
      setEditingId(null);
      setSelectedMood(null);
      setIntensity(5);
      setNote("");
      setAiReflection("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setSelectedMood(entry.mood);
    setIntensity(entry.intensity);
    setNote(entry.note);
    setAiReflection(entry.reflection || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteMood = async (id) => {
    if (!confirm("Delete this moment?")) return;
    setMoods(prev => prev.filter(m => m.id !== id)); // Optimistic UI
    await deleteDoc(doc(db, "moods", id));
  };

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h2 className="text-6xl font-serif text-white mb-4">
          {editingId ? "Refine this moment" : "How are you?"}
        </h2>
        <p className="text-white/50 italic font-serif">
          {editingId ? "Adjusting your reflection..." : "Be honest with your soul today."}
        </p>
      </div>

      {/* Mood Buttons */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
        {moodOptions.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setSelectedMood(mood)}
            className={`p-6 rounded-[2rem] transition-all duration-300 flex flex-col items-center gap-3 border
              ${selectedMood?.value === mood.value 
                ? 'bg-[#F5C96A] border-[#F5C96A] text-gray-900 scale-105 shadow-lg' 
                : 'bg-white/5 border-white/10 text-white'}`}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xs font-bold uppercase tracking-widest">{mood.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
            <div className="flex justify-between items-end mb-6">
              <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Intensity</span>
              <span className="text-3xl font-serif text-[#F5C96A] italic">{intensity}/10</span>
            </div>
            <input type="range" min="1" max="10" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value))} className="w-full accent-[#F5C96A] cursor-pointer" />
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Capture the whisper of your thoughts..."
            className="w-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F5C96A] transition-all"
            rows="3"
          />

          {aiReflection && (
            <div className="bg-white/10 border border-[#F5C96A]/30 backdrop-blur-xl p-8 rounded-[2.5rem] text-white">
              <p className="text-sm uppercase tracking-widest text-[#F5C96A] mb-3 font-bold">Zenith Reflection</p>
              <p className="text-xl font-serif italic">"{aiReflection}"</p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <button onClick={getAIReflection} disabled={loadingReflection} className="flex-1 py-5 bg-white/10 border border-white/20 text-white rounded-full font-bold">
              {loadingReflection ? "Listening..." : "Get New AI Reflection"}
            </button>
            <button onClick={handleSaveOrUpdate} disabled={saving} className="flex-1 py-5 bg-[#F5C96A] text-gray-950 rounded-full font-bold">
              {saving ? "Processing..." : editingId ? "Update Entry" : "Save Entry"}
            </button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setSelectedMood(null); setNote(""); }} className="py-5 px-8 bg-red-500/20 text-red-400 rounded-full font-bold">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* History List */}
      <div className="mt-32">
        <h3 className="text-2xl font-serif mb-8 text-white/40 font-light italic">Your journey so far...</h3>
        <div className="space-y-4">
          {moods.map((m) => (
            <div key={m.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-6">
                <span className="text-4xl">{m.mood.emoji}</span>
                <div>
                  <p className="text-white font-serif text-lg">{m.mood.label} <span className="text-[#F5C96A] text-sm ml-2">{m.intensity}/10</span></p>
                  <p className="text-white/30 text-xs uppercase tracking-tighter">{new Date(m.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(m)} className="text-[#F5C96A] text-xs font-bold uppercase">Edit</button>
                <button onClick={() => deleteMood(m.id)} className="text-red-400 text-xs font-bold uppercase">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodLogger;