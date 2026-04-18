import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { HomeView } from './views/home.jsx';
import { DashboardView } from './views/dashboard.jsx';
import { ChatView } from './views/chat.jsx';
import { SummaryView } from './views/summary.jsx';
import { QuizView } from './views/quiz.jsx';
import { LoginView } from './views/login.jsx';
import { SignupView } from './views/signup.jsx';
import { ReExplainView } from './views/reexplain.jsx';
import { SocraticView } from './views/socratic.jsx';
import { extractTextFromPdf, generateSummaryFromText } from './utils/pdfSummary.js';

const VALID_ROUTES = ['home', 'dashboard', 'chat', 'summary', 'quiz', 'reexplain', 'socratic', 'signup', 'login'];

const getRouteFromUrl = () => {
  const hashRoute = window.location.hash.replace('#', '');
  if (VALID_ROUTES.includes(hashRoute)) return hashRoute;

  const stateRoute = window.history.state?.route;
  if (VALID_ROUTES.includes(stateRoute)) return stateRoute;

  return 'login';
};

window.navigate = (route, options = {}) => {
  const { replace = false } = options;
  if (!VALID_ROUTES.includes(route)) return;

  const current = window.history.state?.route;
  if (replace) {
    window.history.replaceState({ route }, '', `#${route}`);
  } else if (current !== route) {
    window.history.pushState({ route }, '', `#${route}`);
  }

  window.dispatchEvent(new CustomEvent('navigate', { detail: route }));
};

function App() {
  const [currentRoute, setCurrentRoute] = useState(getRouteFromUrl);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
      const icon = document.querySelector('#theme-toggle i');
      if (icon) icon.className = 'ph ph-sun';
    } else {
      document.body.classList.remove('light-mode');
      const icon = document.querySelector('#theme-toggle i');
      if (icon) icon.className = 'ph ph-moon';
    }
  }, [theme]);

  useEffect(() => {
    if (!window.history.state?.route) {
      window.history.replaceState({ route: currentRoute }, '', `#${currentRoute}`);
    }
  }, []);

  useEffect(() => {
    const handleNav = (e) => {
      setCurrentRoute(e.detail);
    };
    window.addEventListener('navigate', handleNav);
    return () => window.removeEventListener('navigate', handleNav);
  }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      const routeFromState = e.state?.route;
      if (VALID_ROUTES.includes(routeFromState)) {
        setCurrentRoute(routeFromState);
        return;
      }

      const routeFromUrl = getRouteFromUrl();
      setCurrentRoute(routeFromUrl);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUploadedDoc(null);
    setUploadError('');
    window.navigate('login', { replace: true });
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setUploadError('Please select a PDF file only.');
      return;
    }

    setUploadError('');
    setIsLoading(true);

    try {
      const extractedText = await extractTextFromPdf(file);
      const summary = generateSummaryFromText(extractedText);
      setUploadedDoc({
        fileName: file.name,
        extractedText,
        summary
      });
      window.navigate('dashboard');
    } catch (error) {
      setUploadError('Could not read this PDF. Please try another file.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const handleThemeToggle = () => toggleTheme();
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', handleThemeToggle);
    }
    return () => themeToggleBtn?.removeEventListener('click', handleThemeToggle);
  }, [theme]);

  useEffect(() => {
    const nav = document.getElementById('header-nav');
    if(nav) {
      if (isAuthenticated) {
        nav.innerHTML = `
          <button class="nav-btn" onclick="window.navigate('home')">Upload PDF</button>
          <button class="nav-btn" onclick="window.navigate('dashboard')">Dashboard</button>
          <button class="nav-btn logout-btn" onclick="window.dispatchEvent(new Event('app-logout'))">Logout</button>
        `;
      } else {
        nav.innerHTML = '';
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('app-logout', handleLogout);
    return () => window.removeEventListener('app-logout', handleLogout);
  }, []);

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="loading-view fade-in">
          <div className="spinner"></div>
          <h2>AI is processing your notes...</h2>
        </div>
      );
    }
    switch (currentRoute) {
      case 'home': return <HomeView onUpload={handleUpload} uploadError={uploadError} />;
      case 'dashboard': return <DashboardView />;
      case 'chat': return <ChatView uploadedDoc={uploadedDoc} />;
      case 'summary': return <SummaryView uploadedDoc={uploadedDoc} />;
      case 'quiz': return <QuizView uploadedDoc={uploadedDoc} />;
      case 'reexplain': return <ReExplainView />;
      case 'socratic': return <SocraticView />;
      case 'signup': return <SignupView onSignup={(e) => { e.preventDefault(); setIsAuthenticated(true); window.navigate('home'); }} onNavigateToLogin={() => window.navigate('login')} />;
      case 'login': return <LoginView onLogin={(e) => { e.preventDefault(); setIsAuthenticated(true); window.navigate('home'); }} onNavigateToSignup={() => window.navigate('signup')} />;
      default: return <LoginView onLogin={(e) => { e.preventDefault(); setIsAuthenticated(true); window.navigate('home'); }} onNavigateToSignup={() => window.navigate('signup')} />;
    }
  };

  return (
    <React.Fragment>
      {renderView()}
    </React.Fragment>
  );
}

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
