import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../firebase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const Journal = () => {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Load journal entries from Firestore
  const loadEntries = async () => {
    const querySnapshot = await getDocs(collection(db, "journal"));
    const entryList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    setEntries(entryList);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  // Generate AI Prompt using OpenAI
  const generateAIPrompt = async () => {
    setLoadingAI(true);
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user", 
          content: "Give me one thoughtful, gentle journaling prompt for emotional reflection. Make it warm and open-ended. Keep it under 15 words."
        }],
        max_tokens: 60,
        temperature: 0.8,
      });
      setAiPrompt(completion.choices[0].message.content.trim());
    } catch (error) {
      setAiPrompt("What was the most meaningful moment of your day?");
    }
    setLoadingAI(false);
  };

  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      alert("Please write something before saving ✨");
      return;
    }

    try {
      if (editingId) {
        // Update existing entry
        await updateDoc(doc(db, "journal", editingId), {
          content: entry.trim(),
          date: new Date().toISOString()
        });
      } else {
        // Create new entry
        await addDoc(collection(db, "journal"), {
          date: new Date().toISOString(),
          content: entry.trim(),
          prompt: aiPrompt || "Free writing"
        });
      }

      await loadEntries();
      setEntry("");
      setAiPrompt("");
      setEditingId(null);
      alert(editingId ? "Journal updated successfully" : "Journal entry saved gently 🌿");
    } catch (error) {
      console.error(error);
      alert("Failed to save entry");
    }
  };

  const startEditing = (entry) => {
    setEntry(entry.content);
    setEditingId(entry.id);
    setAiPrompt("");
  };

  const deleteEntry = async (id) => {
    if (!confirm("Delete this journal entry?")) return;
    try {
      await deleteDoc(doc(db, "journal", id));
      await loadEntries();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif tracking-tighter text-white mb-4">Today's Reflection</h2>
        <p className="text-white/80 text-lg">Write freely or get a thoughtful prompt</p>
      </div>

      {/* AI Prompt Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={generateAIPrompt}
          disabled={loadingAI}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-3xl text-white transition-all flex items-center gap-2"
        >
          {loadingAI ? "Thinking..." : "✨ Get AI Prompt"}
        </button>
      </div>

      {aiPrompt && (
        <div className="bg-white/10 border border-white/30 rounded-3xl p-6 mb-8 text-center">
          <p className="text-[#F5C96A] text-sm mb-2">Suggested Prompt</p>
          <p className="text-white italic text-lg">"{aiPrompt}"</p>
        </div>
      )}

      {/* Journal Input */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="How are you feeling? What happened today? Write anything..."
        rows="10"
        className="w-full p-8 rounded-3xl bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F5C96A] text-lg"
      />

      <button
        onClick={handleSaveEntry}
        className="w-full mt-6 py-4 bg-[#F5C96A] hover:bg-[#E8B923] text-gray-900 font-semibold rounded-3xl text-lg transition-all"
      >
        {editingId ? "Update Entry" : "Save Journal Entry"}
      </button>

      {/* Previous Entries */}
      {entries.length > 0 && (
        <div className="mt-16">
          <h3 className="text-white text-2xl font-medium mb-6">Previous Reflections</h3>
          <div className="space-y-6">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl p-8"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white/70 text-sm">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {entry.prompt && (
                      <p className="text-[#F5C96A] text-xs mt-1">Prompt: {entry.prompt}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEditing(entry)}
                      className="text-[#F5C96A] hover:text-white text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;