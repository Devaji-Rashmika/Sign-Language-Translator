import React from 'react';
import { 
  Camera, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Volume2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  TrendingUp,
  Brain
} from 'lucide-react';

export default function HomePage({ onStartTranslating, onExploreVocabulary }) {
  const pipelineSteps = [
    {
      step: '01',
      title: 'Camera',
      icon: Camera,
      badge: '30-60 FPS',
      desc: 'Live high-frame-rate video captures your signing gestures without delays or manual buttons.',
      color: '#06b6d4'
    },
    {
      step: '02',
      title: 'Sign Recognition',
      icon: Cpu,
      badge: 'MediaPipe + Temporal',
      desc: 'Extracts 3D hand, finger, body pose, and facial landmarks with trajectory velocity tracking.',
      color: '#3b82f6'
    },
    {
      step: '03',
      title: 'AI Translation',
      icon: Brain,
      badge: 'Linguistic Engine',
      desc: 'Converts telegraphic ISL gloss sequences into coherent, grammatically fluent English sentences.',
      color: '#8b5cf6'
    },
    {
      step: '04',
      title: 'English & Voice',
      icon: Volume2,
      badge: 'TTS & Real-Time',
      desc: 'Live natural English text updates on-screen with instant, synchronized voice synthesis.',
      color: '#10b981'
    }
  ];

  const featureCards = [
    {
      icon: Zap,
      title: 'Continuous Flow',
      desc: 'No button presses needed between signs. Stand in front of your camera, sign naturally, and watch English appear seamlessly.',
      badge: 'Zero Clicks'
    },
    {
      icon: Layers,
      title: 'Temporal Motion Model',
      desc: 'Analyzes movement over time across rolling frame windows. Understands dynamic motion, hand orientation, and speed.',
      badge: 'Sequence Buffer'
    },
    {
      icon: TrendingUp,
      title: '5-Level Vocabulary',
      desc: 'Spans the alphabet A-Z, numbers 0-100+, essential daily signs, emergency words, feelings, and multi-word sentences.',
      badge: 'Full ISL Spec'
    },
    {
      icon: Volume2,
      title: 'Speech Synthesis (TTS)',
      desc: 'Listen to your translations with natural speech output, adjustable speed controls, and one-click replay.',
      badge: 'Voice Output'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Preserved',
      desc: 'Frames are processed locally in real-time. No webcam video footage is permanently retained or stored.',
      badge: '100% Private'
    },
    {
      icon: Brain,
      title: 'Sentence Segmentation',
      desc: 'Detects natural pauses, transitions, and questions to break continuous signing into proper distinct sentences.',
      badge: 'Smart Pauses'
    }
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '40px 24px 80px' }}>
      
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '50px 20px 70px',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '9999px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: 'var(--accent-cyan)',
          fontSize: '0.86rem',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Sparkles size={16} />
          <span>Next-Gen Computer Vision & Temporal AI</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '24px',
          maxWidth: '920px',
          margin: '0 auto 24px'
        }}>
          Continuous Indian Sign Language <span className="gradient-text">Translator</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
          color: 'var(--text-secondary)',
          maxWidth: '740px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Translate Indian Sign Language into English continuously using AI and your camera.
          No buttons after every sign — just fluid, real-time communication.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '60px'
        }}>
          <button 
            onClick={onStartTranslating}
            className="btn btn-primary btn-lg"
            style={{ gap: '10px' }}
          >
            <Camera size={20} />
            <span>Start Translating</span>
            <ArrowRight size={18} />
          </button>

          <a 
            href="#how-it-works"
            className="btn btn-secondary btn-lg"
          >
            Learn How It Works
          </a>
        </div>

        {/* Visual Continuous Example Showcase */}
        <div className="glass-panel" style={{
          maxWidth: '880px',
          margin: '0 auto',
          padding: '28px 32px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: 'linear-gradient(135deg, rgba(13, 20, 36, 0.85), rgba(15, 23, 42, 0.9))',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), var(--glow-cyan)'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            Live Continuous Recognition Demo
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            {['I', 'GO', 'COLLEGE', 'TOMORROW'].map((word, idx, arr) => (
              <React.Fragment key={word}>
                <span className="sign-chip" style={{ fontSize: '1.1rem', padding: '8px 18px' }}>
                  {word}
                </span>
                {idx < arr.length - 1 && (
                  <span className="sign-arrow" style={{ fontSize: '1.3rem' }}>➔</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{
            padding: '16px 20px',
            background: 'rgba(6, 182, 212, 0.08)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Translated:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              “I will go to college tomorrow.”
            </span>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Section: Camera -> Sign Recognition -> AI Translation -> English */}
      <section id="how-it-works" style={{ marginTop: '50px', marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, marginBottom: '12px' }}>
            The <span className="gradient-text">Continuous AI Pipeline</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Watch how temporal landmark streams are transformed into natural spoken English in fractions of a second.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          position: 'relative'
        }}>
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.step}
                className="glass-card"
                style={{
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: `rgba(${parseInt(step.color.slice(1,3),16)}, ${parseInt(step.color.slice(3,5),16)}, ${parseInt(step.color.slice(5,7),16)}, 0.15)`,
                    border: `1px solid ${step.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: step.color
                  }}>
                    <Icon size={24} />
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)'
                  }}>
                    STEP {step.step}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{step.title}</h3>
                  </div>
                  <span className="badge" style={{
                    fontSize: '0.72rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    color: step.color,
                    borderColor: `${step.color}40`,
                    marginBottom: '8px'
                  }}>
                    {step.badge}
                  </span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, marginBottom: '12px' }}>
            Built for Real-World <span className="gradient-text">Accessibility</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Engineered with deep computer vision and linguistic rules to solve continuous gesture recognition.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.title}
                className="glass-card"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'rgba(6, 182, 212, 0.12)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-cyan)'
                    }}>
                      <Icon size={20} />
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: '#ffffff' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ready to Begin Bottom Banner */}
      <section className="glass-panel" style={{
        padding: '48px 36px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
        border: '1px solid var(--border-glow)'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '14px', color: '#ffffff' }}>
          Experience Continuous Sign Translation Now
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 28px' }}>
          Stand in front of your camera, perform Indian Sign Language signs in natural sequence, and see English text generated live.
        </p>
        <button
          onClick={onStartTranslating}
          className="btn btn-primary btn-lg"
          style={{ gap: '10px' }}
        >
          <Camera size={20} />
          <span>Launch Live Camera</span>
        </button>
      </section>

    </div>
  );
}
