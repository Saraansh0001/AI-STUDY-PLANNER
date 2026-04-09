export function SignupView({ onSignup, onNavigateToLogin }) {
  return (
    <div className="login-container fade-in">
      <div className="glass-card login-card">
        <div className="login-header">
          <i className="ph-fill ph-user-plus logo-icon"></i>
          <h1>Create Account</h1>
          <p>Join AI Study Buddy today</p>
        </div>
        
        <form id="signup-form" className="login-form" onSubmit={onSignup}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <div className="input-wrapper">
              <i className="ph ph-user"></i>
              <input type="text" id="name" placeholder="John Doe" required />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <i className="ph ph-envelope"></i>
              <input type="email" id="email" placeholder="you@example.com" required />
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="ph ph-lock"></i>
              <input type="password" id="password" placeholder="••••••••" required />
            </div>
          </div>
          
          <button type="submit" className="btn-primary login-btn">
            Sign Up <i className="ph ph-arrow-right"></i>
          </button>
        </form>
        
        <div className="login-footer">
          <p>Already have an account? <a href="#" className="accent-link" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
}
