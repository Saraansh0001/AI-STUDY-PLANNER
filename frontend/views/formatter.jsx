import React, { useState } from 'react';

const generateExamQuestion = (rawQuestion, style) => {
  const q = rawQuestion.trim();
  
  if (style === 'MCQ') {
    // 4 options, one clearly correct, one plausible distractor, two obviously wrong.
    // Do not invent facts.
    return `${q}\n\nA) [Plausible Distractor - related but technically incorrect]\nB) [Correct Answer - precise operational definition]\nC) [Obviously Wrong - completely unrelated categorical error]\nD) [Obviously Wrong - structurally illogical conclusion]`;
  }
  if (style === 'Short Answer') {
    return `${q} [4 marks]`;
  }
  if (style === 'Essay') {
    const commands = ['Evaluate', 'Analyse', 'Discuss'];
    const cmd = commands[Math.floor(Math.random() * commands.length)];
    return `${cmd} the theoretical foundations and functional methodologies expressed in the following premise:\n\n"${q}"\n\n(Word count: 1200 words)`;
  }
  
  return q;
};

export function FormatterView() {
  const [rawQuestion, setRawQuestion] = useState('');
  const [examStyle, setExamStyle] = useState('MCQ');
  const [output, setOutput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rawQuestion.trim()) return;

    setIsThinking(true);
    setOutput('');

    setTimeout(() => {
      setIsThinking(false);
      setOutput(generateExamQuestion(rawQuestion, examStyle));
    }, 800);
  };

  return (
    <div className="formatter-container fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Exam Question Formatter</h2>
        <button className="nav-btn" onClick={() => window.navigate('dashboard')}>
          <i className="ph ph-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
          Transform raw ideas into strict exam questions. No commentary. No hand-holding. Output only.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Raw Question or Concept</label>
            <textarea
              value={rawQuestion}
              onChange={(e) => setRawQuestion(e.target.value)}
              placeholder="Enter your raw question..."
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Exam Style</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {['MCQ', 'Short Answer', 'Essay'].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setExamStyle(style)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: examStyle === style ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${examStyle === style ? '#10b981' : 'var(--glass-border)'}`,
                    borderRadius: '20px',
                    color: examStyle === style ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    fontWeight: examStyle === style ? 600 : 400
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={!rawQuestion.trim() || isThinking}
            style={{ alignSelf: 'flex-start', marginTop: '1rem' }}
          >
            {isThinking ? 'Formatting...' : 'Generate Format'}
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
            background: 'rgba(0,0,0,0.4)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            color: 'var(--text-main)',
            fontSize: '1.05rem',
            lineHeight: 1.6
          }}>
            {output}
          </div>
        )}
      </div>
    </div>
  );
}
