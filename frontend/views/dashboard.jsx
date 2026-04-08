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
      </div>
    </div>
  );
}
