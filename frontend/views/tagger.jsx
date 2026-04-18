import React, { useState } from 'react';

const STOP_WORDS = new Set([
  'what', 'which', 'when', 'where', 'who', 'why', 'how', 'explain', 'tell', 'of', 'the', 'a', 'an'
]);

const determineDifficulty = (q) => {
  const norm = q.toLowerCase();
  if (norm.includes('why') || norm.includes('analyze') || norm.includes('compare') || norm.includes('evaluate')) {
    return 'analysis';
  }
  if (norm.includes('how') || norm.includes('apply') || norm.includes('solve') || norm.includes('calculate')) {
    return 'application';
  }
  return 'recall';
};

const extractTopic = (q) => {
  const words = q.replace(/[^A-Za-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w.toLowerCase()));
  if (words.length === 0) return 'ambiguous subject parameter';
  // Specific defensible label heuristic
  return words.slice(-2).join(' ').toLowerCase(); 
};

const generateJSONTag = (question, section) => {
  const difficulty = determineDifficulty(question);
  const topic = extractTopic(question);
  const sec = section.trim() || 'unknown';

  const output = {
    section: sec,
    topic: topic,
    difficulty: difficulty
  };

  return JSON.stringify(output, null, 2);
};

export function TaggerView() {
  const [question, setQuestion] = useState('');
  const [section, setSection] = useState('');
  const [output, setOutput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsThinking(true);
    setOutput('');

    setTimeout(() => {
      setIsThinking(false);
      setOutput(generateJSONTag(question, section));
    }, 500);
  };

  return (
    <div className="tagger-container fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Topic Tagger Engine</h2>
        <button className="nav-btn" onClick={() => window.navigate('dashboard')}>
          <i className="ph ph-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          Submit a question and its originating section. Expect raw JSON categorizations only.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Source Section</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., Chapter 4.2 - Kinetics"
              style={{
                padding: '1rem',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Exam Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the exam question payload..."
              rows={3}
              style={{
                padding: '1rem',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!question.trim() || isThinking}
            style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
          >
            {isThinking ? 'Tagging...' : 'Execute Tagger'}
          </button>
        </form>

        {isThinking && (
          <div className="chat-msg ai thinking fade-in" style={{ marginTop: '2rem' }}>
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}

        {output && !isThinking && (
          <div className="fade-in" style={{ 
            marginTop: '2.5rem', 
            padding: '1.5rem', 
            background: 'rgba(0,0,0,0.6)', 
            border: 'none',
            borderRadius: 'var(--radius-sm)',
          }}>
            <pre style={{ 
              margin: 0, 
              color: '#a5b4fc', 
              fontFamily: 'monospace', 
              fontSize: '1.05rem', 
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
