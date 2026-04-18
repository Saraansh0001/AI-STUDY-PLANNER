import React, { useState } from 'react';

const WEAK_WORDS = [
  'things', 'stuff', 'good', 'bad', 'maybe', 'probably', 'like', 'basically', 'obviously', 'just', 'very'
];

const ABSOLUTE_WORDS = [
  'all', 'every', 'always', 'never', 'none', 'only', 'must', 'impossible'
];

const LOGIC_WORDS = [
  'because', 'therefore', 'thus', 'since', 'consequently', 'implies', 'results', 'dictates', 'necessitates'
];

const generateOpponentResponse = (argText) => {
  const words = argText.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  
  // Rule 1: Identify Weakest Word
  for (const word of words) {
    if (WEAK_WORDS.includes(word)) {
      return `The term "${word}" carries no precise structural weight in this context. Reconstruct your argument using rigorous definitions.`;
    }
  }

  // Rule 2: Challenge Absolutes (Sharpening question & weak word)
  for (const word of words) {
    if (ABSOLUTE_WORDS.includes(word)) {
      return `Your reasoning hinges entirely on the absolute term "${word}". Can you logically guarantee there are zero edge cases outside your premise?`;
    }
  }

  // Rule 3: Missing logical connectors (Sharpening question)
  const hasLogic = LOGIC_WORDS.some(lw => words.includes(lw));
  if (!hasLogic || words.length < 15) {
    return `Why must that causality hold true rather than the exact inverse? Provide the logical bridge.`;
  }

  // Rule 4: Fully Sound (Concede)
  return `Granted. The logical sequence structurally upholds the defining constraints.`;
};

export function SocraticView() {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'State a concept and defend how it works. I hold the correct answer. I will not help you. Defend your thinking.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const send = () => {
    if (!input.trim() || isThinking) return;

    const argument = input.trim();
    setMessages((prev) => [...prev, { type: 'user', text: argument }]);
    setInput('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const response = generateOpponentResponse(argument);
      setMessages((prev) => [...prev, { type: 'ai fade-in', text: response }]);
    }, 1200);
  };

  return (
    <div className="chat-container fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Socratic Opponent</h2>
        <button className="nav-btn" onClick={() => window.navigate('dashboard')}>
          <i className="ph ph-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <div className="glass-card chat-box" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          This engine tests the rigor of your logical reasoning. It will not cheerlead.
        </p>
        
        <div className="chat-messages" id="chat-messages" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`chat-msg ${msg.type}`}
              style={{
                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                background: msg.type === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.05)',
                border: `1px solid ${msg.type === 'user' ? 'var(--accent-blue)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: 'var(--text-main)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                lineHeight: 1.5,
                maxWidth: '85%'
              }}
            >
              {msg.text}
            </div>
          ))}
          {isThinking && (
            <div className="chat-msg ai thinking fade-in" style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
              <span>.</span><span>.</span><span>.</span>
            </div>
          )}
        </div>

        <div className="chat-input-area" style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
          <input
            type="text"
            id="chat-input"
            placeholder="Type your logical argument here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && send()}
            disabled={isThinking}
            style={{
              flex: 1,
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              color: 'var(--text-main)',
              fontFamily: 'inherit',
              fontSize: '1rem',
              outline: 'none'
            }}
            autoFocus
          />
          <button 
            className="btn-primary" 
            onClick={send} 
            disabled={!input.trim() || isThinking}
            style={{ padding: '0 1.5rem' }}
          >
            {isThinking ? 'Analyzing Rigor...' : <i className="ph-fill ph-paper-plane-right" style={{ fontSize: '1.25rem' }}></i>}
          </button>
        </div>
      </div>
    </div>
  );
}
