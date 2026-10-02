import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Square, 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Copy, 
  Download, 
  Maximize2, 
  ChevronDown, 
  Sparkles, 
  Search, 
  AlertTriangle,
  HelpCircle,
  Activity,
  Hand
} from 'lucide-react';
import { speechService } from '../services/speechSynthesis';
import { clientGestureEngine } from '../services/clientGestureEngine';
import { realISLDetector } from '../services/realLandmarkDetector';
import { saveTranslationToHistory, fetchTranslationHistory, clearTranslationHistory } from '../services/api';

export default function LiveTranslatorPage({ user, onOpenProfile }) {
  // Detection States
  const [isTranslating, setIsTranslating] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [fps, setFps] = useState(0);
  const [handsCount, setHandsCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState('Standby');

  // Translation States
  const [recognizedSigns, setRecognizedSigns] = useState([]);
  const [currentSign, setCurrentSign] = useState(null);
  const [currentConfidence, setCurrentConfidence] = useState(0.93);
  const [englishTranslation, setEnglishTranslation] = useState('');
  const [status, setStatus] = useState('WAITING');
  
  // Audio & UI
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // History State
  const [historyItems, setHistoryItems] = useState([
    {
      id: 'h_initial',
      timestamp: '02:56:24 pm',
      confidence: 0.85,
      detected_signs: ['WAIT'],
      translation: 'Wait.'
    }
  ]);

  // DOM Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const isProcessingFrameRef = useRef(false);
  const activeSignsRef = useRef([]);
  const lastHandSeenRef = useRef(0);

  useEffect(() => {
    loadHistory();
    realISLDetector.initialize();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchTranslationHistory();
      if (data && data.length > 0) {
        setHistoryItems(data);
      }
    } catch {
      // Fallback
    }
  };

  const toggleCamera = async () => {
    if (isTranslating) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (!realISLDetector.isReady) {
        await realISLDetector.initialize();
      }

      setIsTranslating(true);
      startDetectionLoop();
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access required. Please allow camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    setIsTranslating(false);
    setFps(0);
    setHandsCount(0);
    setCurrentSign(null);
    setDebugInfo('Standby');
    setStatus('WAITING');
  };

  useEffect(() => {
    return () => {
      stopCamera();
      speechService.stop();
    };
  }, []);

  const startDetectionLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (realISLDetector.handsInstance) {
      realISLDetector.handsInstance.onResults((results) => {
        isProcessingFrameRef.current = false;
        handleMediaPipeResults(results);
      });
    }

    const onFrame = async (now) => {
      if (!mediaStreamRef.current) return;

      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (video.readyState >= 2 && realISLDetector.handsInstance && !isProcessingFrameRef.current) {
        isProcessingFrameRef.current = true;
        try {
          await realISLDetector.handsInstance.send({ image: video });
        } catch {
          isProcessingFrameRef.current = false;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(onFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(onFrame);
  };

  const handleMediaPipeResults = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Flipped mirror video
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = performance.now();
    const multiHands = results.multiHandLandmarks || [];
    setHandsCount(multiHands.length);

    if (multiHands.length > 0) {
      realISLDetector.drawRealHands(ctx, multiHands, canvas.width, canvas.height);
      lastHandSeenRef.current = now;
    }
    ctx.restore();

    if (multiHands.length === 0) {
      setStatus('HANDS_UNCLEAR');
      setDebugInfo('Searching for hands...');
      setCurrentSign(null);

      // Segment sentence if user paused and rested hands for > 1.8 seconds
      if (activeSignsRef.current.length > 0 && (now - lastHandSeenRef.current > 1800)) {
        completeSentence();
      }
      return;
    }

    // Run gesture classification on real hands
    const evalResult = realISLDetector.classifyFrame(multiHands, now);
    setStatus(evalResult.status);
    if (evalResult.confidence) setCurrentConfidence(evalResult.confidence);
    if (evalResult.debugInfo) setDebugInfo(evalResult.debugInfo);

    if (evalResult.sign) {
      setCurrentSign(evalResult.sign);
      const committed = realISLDetector.updateContinuousSequence(evalResult.sign, now);
      if (committed) {
        onSignCommitted(committed);
      }
    } else {
      realISLDetector.updateContinuousSequence(null, now);
      setCurrentSign(null);
    }
  };

  const onSignCommitted = (sign) => {
    setRecognizedSigns(prev => {
      const next = [...prev, sign];
      activeSignsRef.current = next;
      const eng = clientGestureEngine.translateSequenceToEnglish(next);
      setEnglishTranslation(eng);
      return next;
    });
  };

  const completeSentence = () => {
    if (activeSignsRef.current.length === 0) return;
    const sentenceText = clientGestureEngine.translateSequenceToEnglish(activeSignsRef.current);
    if (sentenceText) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).toLowerCase();
      const newEntry = {
        id: 'h_' + Date.now(),
        timestamp: nowStr,
        confidence: currentConfidence,
        detected_signs: [...activeSignsRef.current],
        translation: sentenceText
      };
      setHistoryItems(prev => [newEntry, ...prev.slice(0, 9)]);
      saveTranslationToHistory(activeSignsRef.current, sentenceText, currentConfidence);

      if (autoSpeak) {
        speechService.speak(sentenceText);
      }
    }

    activeSignsRef.current = [];
    setRecognizedSigns([]);
    setEnglishTranslation('');
  };

  const handleClear = () => {
    activeSignsRef.current = [];
    setRecognizedSigns([]);
    setEnglishTranslation('');
    setCurrentSign(null);
  };

  const handleCopyHistory = () => {
    const text = historyItems.map(h => `${h.translation}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleDownloadHistory = () => {
    const text = historyItems.map(h => `[${h.timestamp}] ${(h.detected_signs || []).join(' ')} -> "${h.translation}"`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISL_Translations_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick Sign Trigger for testing gestures with one click
  const triggerQuickSign = (sign) => {
    setCurrentSign(sign);
    setCurrentConfidence(0.95);
    onSignCommitted(sign);
  };

  const quickSigns = [
    { label: 'WAIT', icon: '⏳' },
    { label: 'I', icon: '☝️' },
    { label: 'GO', icon: '🏃' },
    { label: 'COLLEGE', icon: '🎓' },
    { label: 'TOMORROW', icon: '📅' },
    { label: 'HOME', icon: '🏠' },
    { label: 'WATER', icon: '🚰' },
    { label: 'EAT', icon: '🍱' },
    { label: 'HELP', icon: '🤝' },
    { label: 'STOP', icon: '✋' },
    { label: 'MY', icon: '💖' },
    { label: 'YOU', icon: '👉' },
    { label: 'PHONE', icon: '📱' },
    { label: 'HELLO', icon: '👋' },
    { label: 'YES', icon: '👍' },
    { label: 'NO', icon: '👎' }
  ];

  const displayName = user?.name || 'Varnikakomali';

  return (
    <div style={{ flex: 1, padding: '24px 32px 60px', overflowY: 'auto' }}>
      
      {/* Top Header Bar matching user's screenshot format */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Left: Mode Tag + Title */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(30, 58, 138, 0.35)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38bdf8',
            fontSize: '0.72rem',
            fontWeight: 700,
            marginBottom: '6px'
          }}>
            <Sparkles size={12} />
            <span>Continuous Translation Mode</span>
          </div>
          <h1 style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            Live ISL Translation
          </h1>
        </div>

        {/* Right: Actions + Profile Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Start / Stop Camera Button */}
          <button
            onClick={toggleCamera}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '9999px',
              border: 'none',
              background: isTranslating
                ? 'linear-gradient(135deg, #e11d48, #be123c)'
                : 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)'
            }}
          >
            {isTranslating ? <Square size={16} /> : <Play size={16} fill="#ffffff" />}
            <span>{isTranslating ? 'Stop Camera' : 'Start Camera'}</span>
          </button>

          {/* Auto-Speak Button */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: autoSpeak ? 'rgba(30, 58, 138, 0.5)' : 'rgba(15, 23, 42, 0.7)',
              color: autoSpeak ? '#38bdf8' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Auto-Speak</span>
          </button>

          {/* Guide icon */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            title="Gesture Cheat Sheet"
            style={{
              padding: '10px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HelpCircle size={16} />
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.7)',
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={15} />
            <span>Clear</span>
          </button>

          {/* User Profile Widget */}
          <div 
            onClick={onOpenProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px 6px 8px',
              borderRadius: '9999px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              marginLeft: '6px'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
            }} />
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                User
              </div>
            </div>
            <ChevronDown size={14} style={{ color: '#64748b', marginLeft: '2px' }} />
          </div>
        </div>
      </div>

      {/* Guide Drawer */}
      {showGuide && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '20px'
        }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8', marginBottom: '8px' }}>
            Quick ISL Gesture Reference:
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            fontSize: '0.82rem',
            color: '#cbd5e1'
          }}>
            <div>• <strong style={{ color: '#ffffff' }}>WAIT:</strong> Both hands held open in front</div>
            <div>• <strong style={{ color: '#ffffff' }}>I:</strong> Point index finger to chest center</div>
            <div>• <strong style={{ color: '#ffffff' }}>GO:</strong> Flick index finger forward</div>
            <div>• <strong style={{ color: '#ffffff' }}>COLLEGE:</strong> Flat palm sliding up in arc</div>
            <div>• <strong style={{ color: '#ffffff' }}>HOME:</strong> Both hands touching fingertips (roof)</div>
            <div>• <strong style={{ color: '#ffffff' }}>WATER:</strong> "W" shape (3 fingers) tapping chin</div>
            <div>• <strong style={{ color: '#ffffff' }}>HELP:</strong> Fist on flat open base palm</div>
            <div>• <strong style={{ color: '#ffffff' }}>STOP:</strong> Open flat hand facing forward / chop</div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Camera Card & Right Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.45fr 1fr',
        gap: '20px',
        alignItems: 'stretch',
        marginBottom: '20px'
      }}>

        {/* LEFT: Camera Viewport Card */}
        <div style={{
          background: '#090d18',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '480px'
        }}>
          
          {/* Card Top Sub-header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(10, 15, 28, 0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isTranslating ? '#10b981' : '#64748b',
                boxShadow: isTranslating ? '0 0 8px #10b981' : 'none'
              }} />
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#94a3b8' }}>
                {isTranslating ? 'Active' : 'Standby'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Search size={13} />
                <span>{handsCount > 0 ? `${handsCount} Hand${handsCount > 1 ? 's' : ''} Tracked` : 'Searching'}</span>
              </span>

              <span style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                color: fps > 0 ? '#38bdf8' : '#64748b',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                {fps} FPS
              </span>

              <Maximize2 size={15} style={{ color: '#64748b', cursor: 'pointer' }} />
            </div>
          </div>

          {/* Viewport Interior */}
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#040711'
          }}>
            <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: isTranslating ? 'block' : 'none'
              }}
            />

            {/* Standby Placeholder matching screenshot */}
            {!isTranslating && (
              <div style={{
                textAlign: 'center',
                padding: '40px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  marginBottom: '18px',
                  boxShadow: '0 0 25px rgba(14, 165, 233, 0.2)'
                }}>
                  <Camera size={28} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  Camera Ready
                </h3>

                <p style={{
                  fontSize: '0.88rem',
                  color: '#64748b',
                  maxWidth: '380px',
                  lineHeight: 1.5,
                  marginBottom: '24px'
                }}>
                  Start the camera and sign continuously. The AI will detect signs and translate them into English sentences.
                </p>

                <button
                  onClick={startCamera}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 18px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  <Play size={15} fill="#ffffff" />
                  <span>Start Camera</span>
                </button>
              </div>
            )}

            {/* Real-time posture pill at bottom of active video */}
            {isTranslating && (
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(10, 15, 29, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)'
              }}>
                Pose: {debugInfo}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Two Stacked Cards matching screenshot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TOP RIGHT: CURRENT SIGN CARD */}
          <div style={{
            background: '#090d18',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '220px',
            position: 'relative'
          }}>
            {/* Header label in card top-left */}
            <div style={{
              position: 'absolute',
              top: '18px',
              left: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
                CURRENT SIGN
              </span>
            </div>

            <div style={{
              fontSize: '0.76rem',
              color: '#64748b',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px',
              marginTop: '16px'
            }}>
              DETECTED ISL SIGN
            </div>

            {/* Giant detected sign in bright cyan */}
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)',
              fontWeight: 900,
              color: '#38bdf8',
              letterSpacing: '0.04em',
              textShadow: '0 0 30px rgba(56, 189, 248, 0.4)',
              lineHeight: 1.1,
              marginBottom: '14px',
              textAlign: 'center'
            }}>
              {currentSign || (recognizedSigns.length > 0 ? recognizedSigns[recognizedSigns.length - 1] : (isTranslating ? 'READY' : 'STANDBY'))}
            </div>

            {/* Confidence pill in green */}
            <div style={{
              padding: '4px 14px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.78rem',
              fontWeight: 700
            }}>
              {currentSign ? `${Math.round(currentConfidence * 100)}% confidence` : 'Active Detection Ready'}
            </div>
          </div>

          {/* BOTTOM RIGHT: TRANSLATION HISTORY CARD matching screenshot */}
          <div style={{
            background: '#090d18',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '18px',
            padding: '20px 24px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem' }}>🕒</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  Translation History ({historyItems.length})
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopyHistory}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#cbd5e1',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>

                <button
                  onClick={handleDownloadHistory}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#cbd5e1',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={12} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* History Feed */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto',
              maxHeight: '220px'
            }}>
              {historyItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    background: 'rgba(13, 20, 36, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '14px 16px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {item.timestamp}
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399' }}>
                      {Math.round((item.confidence || 0.85) * 100)}%
                    </span>
                  </div>

                  {/* Sign Tag */}
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(30, 58, 138, 0.5)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: '#38bdf8',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      {(item.detected_signs || ['WAIT']).join(' ➔ ')}
                    </span>
                  </div>

                  {/* Translated Text & Speaker */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      "{item.translation}"
                    </div>

                    <button
                      onClick={() => speechService.speak(item.translation)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* QUICK SIGN SELECTOR BAR (For instant 1-click test of any sign) */}
      <div style={{
        background: '#090d18',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '14px 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Quick Sign Test Palette (Click any sign to test translation instantly):
          </span>
          {recognizedSigns.length > 0 && (
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>
              Sequence: {recognizedSigns.join(' ➔ ')}
            </span>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {quickSigns.map((qs) => (
            <button
              key={qs.label}
              onClick={() => triggerQuickSign(qs.label)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.7)',
                color: '#cbd5e1',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(37, 99, 235, 0.25)';
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.color = '#38bdf8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              <span>{qs.icon}</span>
              <span>{qs.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
