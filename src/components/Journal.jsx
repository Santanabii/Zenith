import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import OpenAI from "openai";

// Initialize OpenAI client (using your environment variable)
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true   // Note: For production, move this to a backend
});

const Journal = () => {
  // Form & UI State
  const [entry, setEntry] = useState("");           // Current journal text being written
  const [entries, setEntries] = useState([]);       // All saved journal entries
  const [aiPrompt, setAiPrompt] = useState("");     // AI-generated prompt shown to user
  const [editingId, setEditingId] = useState(null); // ID of entry being edited (null = new entry)
  const [loadingAI, setLoadingAI] = useState(false); // Loading state for AI prompt
  const [saving, setSaving] = useState(false);      // Loading state while saving

  // ================================================================
  // 1. LOAD ALL JOURNAL ENTRIES FROM FIREBASE
  // ================================================================
  const loadEntries = async () => {
    try {
      // Query: Get all entries sorted by date (newest first)
      const q = query(collection(db, "journal"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      const entryList = querySnapshot.docs.map(doc => ({
        id: doc.id,           // Important: Firestore document ID
        ...doc.data()
      }));

      setEntries(entryList);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
    }
  };

  // Load entries when component first mounts
  useEffect(() => {
    loadEntries();
  }, []);

  // ================================================================
  // 2. GENERATE AI PROMPT USING OPENAI
  // ================================================================
  const generateAIPrompt = async () => {
    setLoadingAI(true);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Zenith, a gentle and warm mental wellness guide. Provide ONE thoughtful, open-ended journaling prompt. Keep it warm, poetic, and under 15 words. No clinical language."
          },
          {
            role: "user",
            content: "Give me a good prompt for today's reflection."
          }
        ],
        temperature: 0.8,
      });

      // Clean up any extra quotes the AI might add
      const cleanPrompt = completion.choices[0].message.content
        .trim()
        .replace(/^["']|["']$/g, '');

      setAiPrompt(cleanPrompt);
    } catch (error) {
      console.error("AI Prompt Error:", error);
      // Fallback prompt if OpenAI fails
      setAiPrompt("What is one thing that made your heart feel lighter today?");
    } finally {
      setLoadingAI(false);
    }
  };

  // ================================================================
  // 3. SAVE OR UPDATE JOURNAL ENTRY
  // ================================================================
  const handleSaveEntry = async () => {
    if (!entry.trim()) {
      alert("Please write something before saving ✨");
      return;
    }

    setSaving(true);
    const currentDate = new Date().toISOString();

    try {
      if (editingId) {
        // === UPDATE EXISTING ENTRY ===
        await updateDoc(doc(db, "journal", editingId), {
          content: entry.trim(),
          date: currentDate
        });

        // Update local state optimistically
        setEntries(prev => 
          prev.map(item => 
            item.id === editingId 
              ? { ...item, content: entry.trim(), date: currentDate } 
              : item
          )
        );
      } else {
        // === CREATE NEW ENTRY ===
        const newEntry = {
          date: currentDate,
          content: entry.trim(),
          prompt: aiPrompt || "Free writing"
        };

        const docRef = await addDoc(collection(db, "journal"), newEntry);

        // Add new entry to the top of the list
        setEntries(prev => [{ id: docRef.id, ...newEntry }, ...prev]);
      }

      // Reset form after successful save
      resetForm();

    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save your reflection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ================================================================
  // 4. HELPER FUNCTIONS
  // ================================================================

  // Reset form to initial state
  const resetForm = () => {
    setEntry("");
    setAiPrompt("");
    setEditingId(null);
  };

  // Start editing an existing entry
  const startEditing = (item) => {
    setEntry(item.content);
    setEditingId(item.id);
    setAiPrompt(item.prompt || "");
    
    // Scroll smoothly to the top so user can see the textarea
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete an entry with confirmation
  const deleteEntry = async (id) => {
    if (!confirm("Remove this reflection from your sanctuary?")) return;

    // Optimistic delete (remove from UI immediately)
    setEntries(prev => prev.filter(e => e.id !== id));

    try {
      await deleteDoc(doc(db, "journal", id));
    } catch (error) {
      console.error("Delete Error:", error);
      loadEntries(); // Refresh list if delete fails
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="text-center mb-12">
        <h2 className="text-6xl font-serif tracking-tighter text-white mb-4">
          {editingId ? "Refining Reflection" : "Today's Reflection"}
        </h2>
        <p className="text-white/60 text-lg font-serif italic">
          {editingId ? "Updating your soul's notes..." : "Write freely or receive a gentle prompt."}
        </p>
      </div>

      {/* AI Prompt Button & Display */}
      <div className="flex flex-col items-center mb-8">
        {!aiPrompt ? (
          <button
            onClick={generateAIPrompt}
            disabled={loadingAI}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white transition-all flex items-center gap-2 group"
          >
            <span className="group-hover:rotate-12 transition-transform">✨</span>
            {loadingAI ? "Whispering to the stars..." : "Need a prompt?"}
          </button>
        ) : (
          <div className="bg-white/5 border border-[#F5C96A]/30 backdrop-blur-xl rounded-[2.5rem] p-8 text-center w-full animate-in zoom-in-95">
            <p className="text-[#F5C96A] text-xs uppercase tracking-[0.2em] font-bold mb-3">ZENITH GUIDE</p>
            <p className="text-white italic text-xl font-serif leading-relaxed">"{aiPrompt}"</p>
            <button 
              onClick={() => setAiPrompt("")} 
              className="mt-4 text-white/30 text-xs hover:text-white transition"
            >
              Clear Prompt
            </button>
          </div>
        )}
      </div>

      {/* Journal Textarea */}
      <div className="relative">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Capture the whisper of your thoughts..."
          rows="10"
          className="w-full p-10 rounded-[3rem] bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-[#F5C96A]/50 text-xl font-serif transition-all leading-relaxed"
        />

        {/* Save / Update Button */}
        <button
          onClick={handleSaveEntry}
          disabled={saving}
          className="w-full mt-6 py-6 bg-[#F5C96A] hover:scale-[1.01] active:scale-95 text-gray-900 font-bold rounded-full text-lg transition-all shadow-xl shadow-yellow-500/5 disabled:opacity-50"
        >
          {saving ? "Storing in the sanctuary..." : editingId ? "Update Reflection" : "Preserve Reflection"}
        </button>

        {/* Cancel Edit Button */}
        {editingId && (
          <button 
            onClick={resetForm}
            className="w-full mt-4 text-white/40 hover:text-white transition text-sm font-bold uppercase tracking-widest"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Previous Entries List */}
      {entries.length > 0 && (
        <div className="mt-32">
          <h3 className="text-white/40 text-sm uppercase tracking-[0.3em] font-bold mb-10 text-center">
            YOUR PAST REFLECTIONS
          </h3>
          
          <div className="space-y-8">
            {entries.map((item) => (
              <div 
                key={item.id} 
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] p-10 hover:bg-white/10 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[#F5C96A] font-serif italic text-lg">
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    {item.prompt && item.prompt !== "Free writing" && (
                      <p className="text-white/30 text-xs mt-2 italic">Reflecting on: {item.prompt}</p>
                    )}
                  </div>

                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEditing(item)} 
                      className="text-white/60 hover:text-[#F5C96A] text-xs font-bold uppercase tracking-widest"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteEntry(item.id)} 
                      className="text-white/20 hover:text-red-400 text-xs font-bold uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-white/80 leading-relaxed whitespace-pre-wrap font-light text-lg italic">
                  "{item.content}"
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