import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,   // We'll set this in .env
  dangerouslyAllowBrowser: true   // Only for quick testing
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

  // Load moods from Firestore
  const loadMoods = async () => {
    const q = query(collection(db, "moods"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const moodList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMoods(moodList);
  };

  useEffect(() => {
    loadMoods();
  }, []);

  const generateAIReflection = async (mood, intensityLevel, userNote) => {
    setLoadingReflection(true);
    try {
      const prompt = `User is feeling "${mood.label}" with intensity ${intensityLevel}/10. 
      Note: ${userNote || "No additional note"}.
      
      Give a short, kind, and practical reflection with 1-2 gentle suggestions (like drink water, walk, breathe, etc.).
      Keep it warm, empathetic, and under 60 words.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",           // Cheaper & fast model
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const reflection = completion.choices[0].message.content.trim();
      setAiReflection(reflection);
    } catch (error) {
      console.error(error);
      setAiReflection("I'm having trouble generating a reflection right now. Please try again later.");
    }
    setLoadingReflection(false);
  };

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
      await loadMoods();                    // Refresh list
      await generateAIReflection(selectedMood, intensity, note);   // Get AI Reflection

      // Reset form
      setSelectedMood(null);
      setIntensity(5);
      setNote("");
    } catch (error) {
      console.error("Error saving mood:", error);
      alert("Failed to save mood. Please try again.");
    }

    setSaving(false);
  };

  const deleteMood = async (id) => {
    if (!confirm("Delete this mood entry?")) return;
    try {
      await deleteDoc(doc(db, "moods", id));
      await loadMoods();
    } catch (error) {
      console.error("Error deleting mood:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* ... same UI as before for picker, slider, note ... */}
      {/* (I'll keep it short here - copy the full UI from previous MoodLogger) */}

      <button
        onClick={handleSaveMood}
        disabled={saving}
        className="w-full py-4 bg-[#F5C96A] hover:bg-[#E8B923] text-gray-900 font-semibold rounded-3xl text-lg transition-all disabled:opacity-70"
      >
        {saving ? "Saving..." : "Save Mood & Get AI Reflection"}
      </button>

      {/* AI Reflection */}
      {aiReflection && (
        <div className="mt-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/40 rounded-3xl p-8">
          <h3 className="text-xl font-medium text-white mb-4 flex items-center gap-3">
            🌿 Gentle AI Reflection
          </h3>
          <p className="text-white leading-relaxed text-lg">
            {aiReflection}
          </p>
        </div>
      )}

      {/* Recent Moods List - same as before but using Firestore data */}
      {/* ... */}
    </div>
  );
};

export default MoodLogger;