import React from 'react';
import { 
  Home, 
  Camera, 
  Target, 
  BookOpen, 
  Clock, 
  User, 
  LogOut, 
  LogIn, 
  Activity,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, onOpenAuth }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live', label: 'Live Translation', icon: Camera, badge: 'Live' },
    { id: 'practice', label: 'Practice Mode', icon: Target },
    { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'profile', label: 'Login / Profile', icon: User }
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: '#070a13',
      borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px 18px',
      zIndex: 50
    }}>
      {/* Top Brand Logo */}
      <div>
        <div 
          onClick={() => setActiveTab('live')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            padding: '4px 8px',
            marginBottom: '32px'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)'
          }}>
            🤟
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 800,
              fontSize: '1.15rem',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              ISL Translator
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
              Continuous AI
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'rgba(30, 58, 138, 0.4)' : 'transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.94rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} style={{ color: isActive ? '#38bdf8' : '#64748b' }} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User / Status */}
      <div>
        {user ? (
          <button
            onClick={() => {
              onLogout();
              setActiveTab('profile');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: '#f43f5e',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              marginBottom: '16px',
              width: '100%',
              transition: 'background 0.2s'
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              marginBottom: '16px',
              width: '100%'
            }}
          >
            <LogIn size={18} />
            <span>Sign In / Register</span>
          </button>
        )}

        {/* System Active Indicator */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc' }}>System Active</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
            ISL → English via Temporal AI
          </div>
        </div>
      </div>
    </aside>
  );
}
