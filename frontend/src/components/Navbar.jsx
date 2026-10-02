import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  BookOpen, 
  History, 
  GraduationCap, 
  User, 
  LogOut, 
  Activity, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { checkBackendHealth, getStoredUser, removeStoredToken, removeStoredUser } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, user: propUser, setUser: propSetUser }) {
  const [user, setUser] = useState(() => propUser || getStoredUser());
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });

  const refreshUser = () => {
    setUser(getStoredUser());
  };

  useEffect(() => {
    if (propUser !== undefined) {
      setUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    refreshUser();
    const handleAuthEvent = (e) => {
      setUser(e.detail);
    };
    window.addEventListener('auth-change', handleAuthEvent);

    const interval = setInterval(async () => {
      const health = await checkBackendHealth();
      setBackendStatus({ online: health.online, checking: false, details: health });
    }, 4000);
    checkBackendHealth().then(h => setBackendStatus({ online: h.online, checking: false, details: health }));

    return () => {
      window.removeEventListener('auth-change', handleAuthEvent);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    removeStoredToken();
    removeStoredUser();
    setUser(null);
    if (propSetUser) propSetUser(null);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'live', label: 'Live Translator', icon: Camera, badge: 'LIVE' },
    { id: 'practice', label: 'Practice Mode', icon: GraduationCap },
    { id: 'vocabulary', label: 'Vocabulary (1-5)', icon: BookOpen },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 28px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
            fontSize: '1.4rem'
          }}>
            🤟
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontWeight: 800, 
                fontSize: '1.18rem', 
                letterSpacing: '-0.02em',
                color: '#ffffff'
              }}>
                ISL <span className="gradient-text">Continuous AI</span>
              </span>
              <span className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>v2.0</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Indian Sign Language • Real-Time Vision
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(13, 20, 36, 0.6)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 10px rgba(37, 99, 235, 0.4)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(6, 182, 212, 0.25)',
                    color: isActive ? '#ffffff' : 'var(--accent-cyan)',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side: Backend status indicator & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Backend Connection badge */}
          <div 
            title={backendStatus.online ? "Backend API & Temporal Engine Online" : "Backend Offline - Running In-Browser Engine"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '9999px',
              background: backendStatus.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${backendStatus.online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: backendStatus.online ? '#34d399' : '#fbbf24'
            }}
          >
            <div className={`pulse-dot ${backendStatus.online ? 'active' : 'inactive'}`} />
            <span>{backendStatus.online ? 'AI Server Online' : 'Local AI Mode'}</span>
          </div>

          {/* User profile / login */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#ffffff'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="btn btn-secondary btn-sm"
                style={{ padding: '8px' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
              style={{ gap: '6px' }}
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
