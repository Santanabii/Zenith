import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import OpenAI from "openai";

// Initialize OpenAI client using your environment variable
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true   // Warning: Only for development. Move to backend in production.
});

// List of available moods with emojis
const moodOptions = [
  { emoji: "😢", label: "Very Sad", value: "very-sad" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "🙂", label: "Good", value: "good" },
  { emoji: "😊", label: "Very Good", value: "very-good" },
  { emoji: "🥰", label: "Great", value: "great" },
];

const MoodLogger = () => {
  // ====================== FORM STATE ======================
  const [selectedMood, setSelectedMood] = useState(null);   // Currently selected mood object
  const [intensity, setIntensity] = useState(5);            // Mood intensity (1-10)
  const [note, setNote] = useState("");                     // Optional user note

  // ====================== DATA STATE ======================
  const [moods, setMoods] = useState([]);                   // All saved moods from Firestore
  const [aiReflection, setAiReflection] = useState("");     // AI-generated reflection text

  // ====================== UI LOADING STATES ======================
  const [loadingReflection, setLoadingReflection] = useState(false); // AI is thinking
  const [saving, setSaving] = useState(false);              // Saving to database
  const [editingId, setEditingId] = useState(null);         // ID of mood currently being edited

  // =============================================================
  // 1. LOAD MOODS FROM FIREBASE FIRESTORE
  // =============================================================
  const loadMoods = async () => {
    try {
      // Query: Get the 10 most recent moods, sorted newest first
      const q = query(
        collection(db, "moods"), 
        orderBy("date", "desc"), 
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const moodList = snapshot.docs.map(doc => ({
        id: doc.id,                    // Firestore document ID
        ...doc.data()
      }));

      setMoods(moodList);
    } catch (err) {
      console.error("Failed to load moods from Firestore:", err);
    }
  };

  // Load moods when the component first mounts
  useEffect(() => {
    loadMoods();
  }, []);

  // =============================================================
  // 2. GET AI REFLECTION (Separate button to avoid lag)
  // =============================================================
  const getAIReflection = async () => {
    if (!selectedMood) {
      alert("Please select a mood first before asking for reflection.");
      return;
    }

    setLoadingReflection(true);
    setAiReflection("");   // Clear previous reflection

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "You are Zenith, a warm and gentle mental wellness companion. Speak with empathy, kindness, and brevity." 
          },
          { 
            role: "user", 
            content: `The user is feeling "${selectedMood.label}" with intensity ${intensity}/10. 
                      Context: ${note || "No additional note provided."}
                      Give a short, caring reflection with 1-2 gentle suggestions.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      });

      setAiReflection(response.choices[0].message.content.trim());
    } catch (error) {
      console.error("OpenAI Error:", error);
      setAiReflection("I'm having trouble connecting right now. Take a deep breath — you're doing your best.");
    } finally {
      setLoadingReflection(false);
    }
  };

  // =============================================================
  // 3. SAVE OR UPDATE MOOD ENTRY (CRUD)
  // =============================================================
  const handleSaveOrUpdate = async () => {
    if (!selectedMood) {
      alert("Please select a mood before saving.");
      return;
    }

    setSaving(true);

    const entryData = {
      date: new Date().toISOString(),
      mood: selectedMood,
      intensity: intensity,
      note: note.trim(),
      reflection: aiReflection || "",        // Save the AI reflection too
    };

    try {
      if (editingId) {
        // === UPDATE EXISTING MOOD ===
        await updateDoc(doc(db, "moods", editingId), entryData);

        // Update local state (optimistic update)
        setMoods(prev => prev.map(m => 
          m.id === editingId ? { id: editingId, ...entryData } : m
        ));
      } else {
        // === CREATE NEW MOOD ===
        const docRef = await addDoc(collection(db, "moods"), entryData);

        // Add new mood to the top of the list
        setMoods(prev => [{ id: docRef.id, ...entryData }, ...prev]);
      }

      // Reset form after successful save/update
      resetForm();

    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save your mood. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // =============================================================
  // 4. HELPER FUNCTIONS
  // =============================================================

  // Reset form to initial empty state
  const resetForm = () => {
    setEditingId(null);
    setSelectedMood(null);
    setIntensity(5);
    setNote("");
    setAiReflection("");
  };

  // Start editing an existing mood
  const startEdit = (entry) => {
    setEditingId(entry.id);
    setSelectedMood(entry.mood);
    setIntensity(entry.intensity);
    setNote(entry.note || "");
    setAiReflection(entry.reflection || "");
    
    // Scroll to top so user can see the form easily
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a mood entry
  const deleteMood = async (id) => {
    if (!confirm("Remove this moment from your journey?")) return;

    // Optimistic delete: Remove from UI immediately
    setMoods(prev => prev.filter(m => m.id !== id));

    try {
      await deleteDoc(doc(db, "moods", id));
    } catch (error) {
      console.error("Delete Error:", error);
      loadMoods(); // Refresh if delete fails
    }
  };

  // =============================================================
  // 5. RENDER THE UI
  // =============================================================
  return (
    <div className="max-w-4xl mx-auto py-12">
      
      {/* Page Title */}
      <h2 className="text-5xl font-serif text-center text-white mb-12">
        How is your <span className="text-[#F5C96A]">spirit</span>?
      </h2>
      
      {/* Mood Selection Area */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 mb-10">
        
        {/* Mood Buttons */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-10">
          {moodOptions.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m)}
              className={`p-6 rounded-[2rem] transition-all ${selectedMood?.value === m.value 
                ? 'bg-[#F5C96A] scale-110 shadow-lg' 
                : 'bg-white/5 hover:bg-white/10'}`}
            >
              <span className="text-4xl block">{m.emoji}</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 block 
                ${selectedMood?.value === m.value ? 'text-gray-900' : 'text-white/40'}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Intensity Slider */}
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={intensity} 
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F5C96A] mb-4"
        />
        <p className="text-center text-white/60 text-sm uppercase tracking-[0.3em] mb-10">
          Intensity: {intensity}
        </p>

        {/* Note Textarea */}
        <textarea
          placeholder="What's on your mind? (Optional)"
          value={note} 
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#F5C96A]/50 mb-6"
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={getAIReflection} 
            disabled={loadingReflection} 
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-full text-sm font-bold uppercase tracking-widest transition-all"
          >
            {loadingReflection ? "Listening..." : "Zenith Reflection ✨"}
          </button>

          <button 
            onClick={handleSaveOrUpdate} 
            disabled={saving} 
            className="flex-1 py-4 bg-[#F5C96A] text-gray-900 rounded-full text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02]"
          >
            {saving ? "Saving..." : editingId ? "Update Entry" : "Log Mood"}
          </button>
        </div>

        {/* AI Reflection Display */}
        {aiReflection && (
          <div className="mt-8 p-8 bg-[#F5C96A]/10 border border-[#F5C96A]/20 rounded-[2rem] animate-in zoom-in-95">
            <p className="text-[#F5C96A] text-[10px] uppercase font-bold mb-2">ZENITH'S WHISPER</p>
            <p className="text-white italic font-serif leading-relaxed">"{aiReflection}"</p>
          </div>
        )}
      </div>

      {/* History / Past Moods */}
      <div className="space-y-6">
        {moods.map(m => (
          <div 
            key={m.id} 
            className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-6">
              <span className="text-5xl">{m.mood.emoji}</span>
              <div>
                <p className="text-white font-serif text-xl">
                  {m.mood.label} <span className="text-[#F5C96A] text-sm ml-2">({m.intensity}/10)</span>
                </p>
                <p className="text-white/30 text-xs">{new Date(m.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => startEdit(m)} 
                className="text-[#F5C96A] text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Edit
              </button>
              <button 
                onClick={() => deleteMood(m.id)} 
                className="text-white/20 hover:text-red-400 text-xs font-bold uppercase tracking-widest hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodLogger;