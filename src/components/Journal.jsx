import { useState, useEffect } from 'react';

const Journal = () => {
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");

  // Load saved journal entries
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('zenithJournal') || '[]');
    setEntries(savedEntries);
  }, []);

  // Smart AI Prompts
  const smartPrompts = [
    "What was the highlight of your day today?",
    "What challenged you emotionally today?",
    "What are you grateful for right now?",
    "How did your body feel throughout the day?",
    "What would you like to release or let go of?",
    "What small win did you have today?",
  ];

  const getRandomPrompt = () => {
    const random = smartPrompts[Math.floor(Math.random() * smartPrompts.length)];
    setAiPrompt(random);
  };

  const handleSaveEntry = () => {
    if (!entry.trim()) {
      alert("Please write something before saving ✨");
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      content: entry.trim(),
      prompt: aiPrompt || "Free writing",
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('zenithJournal', JSON.stringify(updatedEntries));

    alert("Journal entry saved gently 🌿");
    
    // Reset
    setEntry("");
    setAiPrompt("");
  };

  const deleteEntry = (id) => {
    if (!confirm("Delete this journal entry?")) return;
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    localStorage.setItem('zenithJournal', JSON.stringify(updatedEntries));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif tracking-tighter text-white mb-4">Today's Reflection</h2>
        <p className="text-white/80 text-lg">Write freely or use a gentle prompt</p>
      </div>

      {/* AI Smart Prompt Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={getRandomPrompt}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-3xl text-white transition-all"
        >
          ✨ Give me a gentle prompt
        </button>
      </div>

      {aiPrompt && (
        <div className="bg-white/10 border border-white/30 rounded-3xl p-6 mb-8 text-center">
          <p className="text-[#F5C96A] text-sm mb-2">Suggested Prompt</p>
          <p className="text-white italic">"{aiPrompt}"</p>
        </div>
      )}

      {/* Journal Textarea */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="How are you feeling? What happened today? Write anything that comes to mind..."
        rows="10"
        className="w-full p-8 rounded-3xl bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F5C96A] text-lg"
      />

      {/* Save Button */}
      <button
        onClick={handleSaveEntry}
        className="w-full mt-6 py-4 bg-[#F5C96A] hover:bg-[#E8B923] text-gray-900 font-semibold rounded-3xl text-lg transition-all"
      >
        Save Journal Entry
      </button>

      {/* Previous Entries */}
      {entries.length > 0 && (
        <div className="mt-16">
          <h3 className="text-white text-2xl font-medium mb-6">Previous Reflections</h3>
          <div className="space-y-6">
            {entries.slice(0, 5).map((entry) => (
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
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
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