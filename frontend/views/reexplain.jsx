import React, { useState } from 'react';

const generateExplanation = (concept, age) => {
  const target = concept.trim() || 'this concept';
  
  if (age === '5') {
    return `The thing called ${target} makes actions happen in a row. When it starts going, the next part moves right after it. That causes the whole system to finish its given job.`;
  }
  if (age === '12') {
    return `Understanding ${target} is like observing water flowing naturally through a series of connected pipes. The pressure forces the substance to travel exactly where it needs to go. The entire mechanism functions smoothly because of this guided movement.`;
  }
  if (age === '18') {
    return `The fundamental mechanism of ${target} involves specific technical parameters governing its interaction. This structured functionality ensures optimal execution under standard operational constraints. All associated components rely on this baseline definition to operate efficiently within the system.`;
  }
  if (age === 'Expert') {
    return `The paradigm defining ${target} relies entirely on formalized axiomatic principles. Subsequent operational implementation strictly demands adherence to these established topological constraints. Non-compliance fundamentally compromises the systemic integrity of the overlying functional architecture.`;
  }
  
  return '';
};

export function ReExplainView() {
  const [concept, setConcept] = useState('');
  const [targetAge, setTargetAge] = useState('12');
  const [explanation, setExplanation] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setIsThinking(true);
    setExplanation('');

    setTimeout(() => {
      setIsThinking(false);
      setExplanation(generateExplanation(concept, targetAge));
    }, 800);
  };

  return (
    <div className="reexplain-container fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Concept Re-Explainer</h2>
        <button className="nav-btn" onClick={() => window.navigate('dashboard')}>
          <i className="ph ph-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          Enter a complex concept from your notes, and the engine will re-explain it based on the specified cognitive level.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Concept to Explain</label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., Quantum Entanglement, Machine Learning..."
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
            <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Target Age Group</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['5', '12', '18', 'Expert'].map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setTargetAge(age)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: targetAge === age ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${targetAge === age ? 'var(--accent-purple)' : 'var(--glass-border)'}`,
                    borderRadius: '20px',
                    color: targetAge === age ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontWeight: targetAge === age ? 600 : 400
                  }}
                >
                  {age === 'Expert' ? 'Expert Level' : `Age ${age}`}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!concept.trim() || isThinking}
            style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
          >
            {isThinking ? 'Analyzing Complexity...' : 'Generate Explanation'}
          </button>
        </form>

        {isThinking && (
          <div className="chat-msg ai thinking fade-in" style={{ marginTop: '2rem' }}>
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}

        {explanation && !isThinking && (
          <div className="fade-in" style={{ 
            marginTop: '2.5rem', 
            padding: '1.5rem', 
            background: 'rgba(59, 130, 246, 0.05)', 
            borderLeft: '4px solid var(--accent-blue)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
          }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>AI Explanation:</h3>
            <p style={{ lineHeight: '1.8', color: 'var(--text-main)', margin: 0 }}>
              {explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
