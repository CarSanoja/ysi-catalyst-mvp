import { useState } from 'react';
import { Header } from './components/Header';
import { LanguageToggle } from './components/LanguageToggle';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { LiveCapture } from './components/LiveCapture';
import { Insights } from './components/Insights';
import { CharterBuilder } from './components/CharterBuilder';
import { KnowledgeBase } from './components/KnowledgeBase';
import { StakeholderCRM } from './components/StakeholderCRM';
import { ManualCapture } from './components/ManualCapture';

type AppState = 'login' | 'dashboard';
type ViewState = 'dashboard' | 'live-capture' | 'manual-capture' | 'insights' | 'charter-builder' | 'knowledge-base' | 'sessions' | 'stakeholders';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [language, setLanguage] = useState<'EN' | 'ES'>('EN');

  const handleLogin = () => {
    setAppState('dashboard');
  };

  const handleLanguageToggle = (lang: 'EN' | 'ES') => {
    setLanguage(lang);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewState);
  };

  const handleLogout = () => {
    setAppState('login');
    setCurrentView('dashboard');
  };

  if (appState === 'login') {
    return (
      <div className="min-h-screen">
        <Header>
          <LanguageToggle language={language} onToggle={handleLanguageToggle} />
        </Header>
        <LoginScreen onLogin={handleLogin} language={language} />
      </div>
    );
  }

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard language={language} />;
      case 'live-capture':
        return <LiveCapture language={language} onLanguageToggle={handleLanguageToggle} />;
      case 'manual-capture':
        return <ManualCapture language={language} />;
      case 'insights':
        return <Insights language={language} />;
      case 'charter-builder':
        return <CharterBuilder language={language} />;
      case 'knowledge-base':
        return <KnowledgeBase language={language} />;
      case 'sessions':
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-600">Sessions view - Coming soon</p>
          </div>
        );
      case 'stakeholders':
        return <StakeholderCRM language={language} />;
      default:
        return <Dashboard language={language} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header>
        <LanguageToggle language={language} onToggle={handleLanguageToggle} />
      </Header>
      <div className="flex-1 flex">
        <Sidebar 
          currentView={currentView} 
          onViewChange={handleViewChange} 
          language={language}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}