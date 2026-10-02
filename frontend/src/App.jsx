import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import LiveTranslatorPage from './pages/LiveTranslatorPage';
import PracticeModePage from './pages/PracticeModePage';
import VocabularyPage from './pages/VocabularyPage';
import HistoryPage from './pages/HistoryPage';
import AuthPage from './pages/AuthPage';
import { getStoredUser, removeStoredToken, removeStoredUser } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // Default to Live Translation as shown in user screenshot!
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const handleAuth = (e) => {
      setUser(e.detail);
    };
    window.addEventListener('auth-change', handleAuth);
    return () => window.removeEventListener('auth-change', handleAuth);
  }, []);

  const handleLogout = () => {
    removeStoredToken();
    removeStoredUser();
    setUser(null);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#040711',
      color: '#f8fafc',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden'
    }}>
      {/* Left Sidebar Navigation matching user screenshot */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setActiveTab('profile')}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'home' && (
          <HomePage 
            onStartTranslating={() => setActiveTab('live')}
            onExploreVocabulary={() => setActiveTab('vocabulary')}
          />
        )}
        
        {activeTab === 'live' && (
          <LiveTranslatorPage 
            user={user}
            onOpenProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'practice' && <PracticeModePage />}
        {activeTab === 'vocabulary' && <VocabularyPage />}
        {activeTab === 'history' && <HistoryPage />}

        {/* Dedicated Login / Profile Page */}
        {activeTab === 'profile' && (
          <AuthPage 
            user={user}
            onAuthSuccess={(u) => {
              setUser(u);
              setActiveTab('live');
            }}
            onLogout={handleLogout}
            onGoToLive={() => setActiveTab('live')}
          />
        )}
      </main>

      {/* Pop-up Auth Modal fallback */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => {
          if (loggedUser) setUser(loggedUser);
          setIsAuthOpen(false);
        }}
      />
    </div>
  );
}
