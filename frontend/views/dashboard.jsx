export function DashboardView() {
  return (
    <div className="dashboard-view fade-in">
      <h1>Your Dashboard</h1>
      <p>Your notes are ready. What would you like to do?</p>
      
      <div className="dashboard-grid">
        <div className="glass-card action-card" onClick={() => window.navigate('summary')}>
          <i className="ph-fill ph-article"></i>
          <h2>Explain Notes</h2>
          <p>Get a simplified summary of your uploaded materials.</p>
        </div>
        
        <div className="glass-card action-card" onClick={() => window.navigate('quiz')}>
          <i className="ph-fill ph-exam"></i>
          <h2>Generate Quiz</h2>
          <p>Test your knowledge with an AI-generated MCQ quiz.</p>
        </div>
        
        <div className="glass-card action-card" onClick={() => window.navigate('chat')}>
          <i className="ph-fill ph-chat-centered-text"></i>
          <h2>Ask Questions</h2>
          <p>Chat with AI to clarify any complex concepts.</p>
        </div>

        <div className="glass-card action-card" onClick={() => window.navigate('reexplain')}>
          <i className="ph-fill ph-brain"></i>
          <h2>Re-Explain Concept</h2>
          <p>Get a concept explained tailored specifically to any cognitive level.</p>
        </div>

        <div className="glass-card action-card" onClick={() => window.navigate('socratic')}>
          <i className="ph-fill ph-sword"></i>
          <h2>Socratic Opponent</h2>
          <p>Defend your logic against a rigorous AI debater.</p>
        </div>
      </div>
    </div>
  );
}
