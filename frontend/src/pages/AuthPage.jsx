import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Eye, 
  EyeOff, 
  LogIn, 
  UserPlus, 
  KeyRound,
  LogOut
} from 'lucide-react';
import { loginUser, registerUser, removeStoredToken, removeStoredUser } from '../services/api';

export default function AuthPage({ user, onAuthSuccess, onLogout, onGoToLive }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        res = await registerUser(name, email, password);
        setSuccessMsg(`Welcome, ${res.user.name}! Your account was created successfully.`);
      } else {
        res = await loginUser(email, password);
        setSuccessMsg(`Signed in successfully as ${res.user.name}!`);
      }

      if (onAuthSuccess) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login Handler
  const handleDemoLogin = async () => {
    setEmail('varnika@example.com');
    setPassword('password123');
    setError(null);
    setLoading(true);

    try {
      let res;
      try {
        res = await loginUser('varnika@example.com', 'password123');
      } catch {
        res = await registerUser('Varnikakomali', 'varnika@example.com', 'password123');
      }
      setSuccessMsg('Signed in as Demo User (Varnikakomali)!');
      if (onAuthSuccess) {
        onAuthSuccess(res.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '540px',
      margin: '32px auto 80px',
      padding: '0 20px',
      width: '100%'
    }}>
      {/* If currently logged in, show status banner */}
      {user && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderRadius: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: '#ffffff'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                Signed in as <span style={{ color: '#34d399' }}>{user.name}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {user.email}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onGoToLive}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 14px' }}
            >
              <span>Live Translator</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={onLogout}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '6px 12px', color: '#fb7185' }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Login / Register Card */}
      <div style={{
        background: '#090e1a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(14, 165, 233, 0.1)'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '36px 32px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(37, 99, 235, 0.12) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {/* Logo Icon */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.9rem',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)'
          }}>
            🤟
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '6px'
          }}>
            {isRegister ? 'Create Your Account' : 'Sign in to ISL Translator'}
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto' }}>
            {isRegister
              ? 'Join to access continuous ISL live translations, save histories, and practice gestures.'
              : 'Enter your credentials to manage your translation sessions and saved history.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 11, 20, 0.6)'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: !isRegister ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
              color: !isRegister ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.94rem',
              borderBottom: !isRegister ? '2px solid #38bdf8' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: isRegister ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
              color: isRegister ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.94rem',
              borderBottom: isRegister ? '2px solid #38bdf8' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px 32px' }}>
          
          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
              fontSize: '0.88rem',
              marginBottom: '18px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              fontSize: '0.88rem',
              marginBottom: '18px'
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Full Name (Only on Register) */}
            {isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: '#cbd5e1' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Varnika Komali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '44px', height: '48px', borderRadius: '12px' }}
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: '#cbd5e1' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '44px', height: '48px', borderRadius: '12px' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#cbd5e1' }}>
                  Password
                </label>
                {!isRegister && (
                  <span style={{ fontSize: '0.78rem', color: '#38bdf8', cursor: 'pointer' }}>
                    Forgot password?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '15px', color: '#64748b' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '44px', paddingRight: '44px', height: '48px', borderRadius: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '14px',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #1d68ed 0%, #2563eb 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(29, 104, 237, 0.4)',
                marginTop: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={handleDemoLogin}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'rgba(56, 189, 248, 0.08)',
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <KeyRound size={16} />
              <span>One-Click Demo Sign In (Varnikakomali)</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
              fontSize: '0.76rem',
              color: '#64748b',
              marginTop: '14px'
            }}>
              <Shield size={13} style={{ color: '#10b981' }} />
              <span>Protected by JWT & Bcrypt Authentication in MongoDB</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
