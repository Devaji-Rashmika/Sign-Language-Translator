import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Trophy, 
  ArrowRight,
  HelpCircle,
  Camera,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchPracticeSentences, evaluatePracticeSubmission } from '../services/api';

export default function PracticeModePage() {
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detectedSequence, setDetectedSequence] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchPracticeSentences().then(data => {
      if (data && data.length) setSentences(data);
    });
  }, []);

  const currentTarget = sentences[currentIndex] || {
    target_sentence: 'I am going to school.',
    target_signs: ['I', 'GO', 'SCHOOL'],
    difficulty: 'Beginner',
    category: 'Daily Activities',
    hint: 'Point to chest for "I", flick forward for "GO", clap flat palms horizontally twice for "SCHOOL".'
  };

  const handleStartPractice = async () => {
    setIsPracticing(true);
    setDetectedSequence([]);
    setEvaluationResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      // Fallback if camera not granted
    }
  };

  const handleStopPractice = () => {
    setIsPracticing(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Simulate or Add Sign during practice
  const handleAddSign = (sign) => {
    if (!detectedSequence.includes(sign)) {
      setDetectedSequence(prev => [...prev, sign]);
    }
  };

  const handleEvaluate = async () => {
    const res = await evaluatePracticeSubmission(currentTarget.target_signs, detectedSequence);
    setEvaluationResult(res);

    if (res.passed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextExercise = () => {
    setDetectedSequence([]);
    setEvaluationResult(null);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % sentences.length);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 16px',
          borderRadius: '9999px',
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#c084fc',
          fontSize: '0.84rem',
          fontWeight: 600,
          marginBottom: '14px'
        }}>
          <GraduationCap size={16} />
          <span>Interactive ISL Evaluation Lab</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
          Practice & <span className="gradient-text">Mastery Mode</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          Perform the required continuous ISL gestures in front of the camera and get instant AI feedback on sign accuracy, sequence order, and missing signs.
        </p>
      </div>

      {/* Exercise Carousel Bar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '16px',
        marginBottom: '24px'
      }}>
        {sentences.map((sent, idx) => (
          <button
            key={sent.id || idx}
            onClick={() => {
              setCurrentIndex(idx);
              setDetectedSequence([]);
              setEvaluationResult(null);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: currentIndex === idx ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              background: currentIndex === idx ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.2))' : 'rgba(13, 20, 36, 0.6)',
              color: currentIndex === idx ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            Exercise {idx + 1}: {sent.target_signs.join(' ')}
          </button>
        ))}
      </div>

      {/* Main Target Card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-cyan">{currentTarget.category}</span>
            <span className="badge badge-emerald">{currentTarget.difficulty}</span>
          </div>

          <button
            onClick={() => setShowHint(!showHint)}
            className="btn btn-secondary btn-sm"
          >
            <HelpCircle size={15} />
            <span>{showHint ? 'Hide Hint' : 'View Sign Hint'}</span>
          </button>
        </div>

        {/* Target Sentence Display */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Target English Sentence
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#ffffff' }}>
            “{currentTarget.target_sentence}”
          </h2>
        </div>

        {/* Expected Signs Sequence */}
        <div style={{
          background: 'rgba(10, 15, 29, 0.7)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
            Expected Continuous Sign Order
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {currentTarget.target_signs.map((sign, idx, arr) => (
              <React.Fragment key={idx}>
                <span className="sign-chip" style={{ fontSize: '1.05rem', padding: '8px 18px' }}>
                  {sign}
                </span>
                {idx < arr.length - 1 && (
                  <span className="sign-arrow" style={{ fontSize: '1.2rem' }}>➔</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Hint banner */}
        {showHint && (
          <div style={{
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#7dd3fc',
            fontSize: '0.92rem',
            marginBottom: '24px',
            lineHeight: 1.5
          }}>
            💡 <strong>Gesture Guide:</strong> {currentTarget.hint}
          </div>
        )}

        {/* Live Practice Controls & Interactive Tester */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left: Camera / Performance Area */}
          <div style={{
            background: '#040711',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              height: '260px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#070a14'
            }}>
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: isPracticing ? 'block' : 'none' }}
              />

              {!isPracticing && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Camera size={36} style={{ color: 'var(--accent-cyan)', margin: '0 auto 10px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Click "Activate Camera" to perform gestures in front of the lens.
                  </p>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', display: 'flex', gap: '10px' }}>
              <button
                onClick={isPracticing ? handleStopPractice : handleStartPractice}
                className={`btn ${isPracticing ? 'btn-danger' : 'btn-primary'} btn-sm`}
                style={{ flex: 1 }}
              >
                <Camera size={16} />
                <span>{isPracticing ? 'Stop Camera' : 'Activate Camera'}</span>
              </button>

              <button
                onClick={() => setDetectedSequence([])}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Right: Detected Signs & Interactive Palette */}
          <div>
            <div style={{
              background: 'rgba(13, 20, 36, 0.65)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '18px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Detected Signs from User
              </span>
              <div className="sign-sequence-container" style={{ minHeight: '60px' }}>
                {detectedSequence.length > 0 ? (
                  detectedSequence.map((sign, idx) => (
                    <span key={idx} className="sign-chip">{sign}</span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                    Perform signs in camera or click below to simulate detection...
                  </span>
                )}
              </div>

              {/* Quick simulation pills for testing without full webcam gesture */}
              <div style={{ marginTop: '14px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Simulate detected signs:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {currentTarget.target_signs.map(sign => (
                    <button
                      key={sign}
                      onClick={() => handleAddSign(sign)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    >
                      + {sign}
                    </button>
                  ))}
                  {/* Extra sign for testing error handling */}
                  <button
                    onClick={() => handleAddSign('PHONE')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', padding: '4px 10px', opacity: 0.7 }}
                  >
                    + PHONE (Extra)
                  </button>
                </div>
              </div>
            </div>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluate}
              disabled={detectedSequence.length === 0}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <Sparkles size={18} />
              <span>Evaluate My Performance</span>
            </button>
          </div>
        </div>

        {/* Evaluation Results Card */}
        {evaluationResult && (
          <div className="glass-panel" style={{
            marginTop: '32px',
            padding: '28px',
            border: `1px solid ${evaluationResult.passed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            background: evaluationResult.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {evaluationResult.passed ? (
                  <CheckCircle2 size={32} style={{ color: 'var(--accent-emerald)' }} />
                ) : (
                  <AlertCircle size={32} style={{ color: 'var(--accent-amber)' }} />
                )}
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                    {evaluationResult.passed ? 'Passed! Excellent Match' : 'Needs Practice'}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {evaluationResult.feedback}
                  </p>
                </div>
              </div>

              {/* Accuracy % */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Sentence Match
                </span>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: evaluationResult.passed ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                }}>
                  {evaluationResult.accuracy_percentage}%
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ padding: '12px', background: 'rgba(10, 15, 29, 0.6)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sign Order:</span>
                <div style={{ fontWeight: 700, color: evaluationResult.sign_order_correct ? '#34d399' : '#fb7185' }}>
                  {evaluationResult.sign_order_correct ? 'Correct Order ✓' : 'Incorrect Order ✗'}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(10, 15, 29, 0.6)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Missing Signs:</span>
                <div style={{ fontWeight: 700, color: evaluationResult.missing_signs.length === 0 ? '#34d399' : '#fb7185' }}>
                  {evaluationResult.missing_signs.length > 0 ? evaluationResult.missing_signs.join(', ') : 'None ✓'}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(10, 15, 29, 0.6)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extra Signs:</span>
                <div style={{ fontWeight: 700, color: evaluationResult.extra_signs.length === 0 ? '#34d399' : '#fbbf24' }}>
                  {evaluationResult.extra_signs.length > 0 ? evaluationResult.extra_signs.join(', ') : 'None ✓'}
                </div>
              </div>
            </div>

            {/* Next exercise CTA */}
            <button
              onClick={handleNextExercise}
              className="btn btn-primary"
              style={{ gap: '8px' }}
            >
              <span>Next Practice Sentence</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
