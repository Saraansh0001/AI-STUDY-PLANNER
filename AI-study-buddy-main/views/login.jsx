export function LoginView({ onLogin, onNavigateToSignup }) {
  return (
    <div className="login-container fade-in">
      <div className="glass-card login-card">
        <div className="login-header">
          <i className="ph-fill ph-brain logo-icon"></i>
          <h1>Welcome Back</h1>
          <p>Login to your AI Study Buddy</p>
        </div>
        
        <form id="login-form" className="login-form" onSubmit={onLogin}>
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
            Login <i className="ph ph-arrow-right"></i>
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="#" className="accent-link" onClick={(e) => { e.preventDefault(); onNavigateToSignup(); }}>Sign up</a></p>
        </div>
      </div>
    </div>
  );
}
