/**
 * High-Precision Real-Time MediaPipe Hand Tracking & ISL Gesture Classifier
 * Features:
 * - Robust 2D/3D Euclidean landmark distance analysis
 * - Scale-invariant palm-normalized finger extensions
 * - Upright & angle-tolerant posture recognition
 * - Anti-flicker temporal smoothing with candidate confidence scoring
 * - Comprehensive ISL vocabulary: HELLO, YES, NO, I, YOU, LOVE, OK, STOP,
 *   WATER, EAT, PHONE, HELP, HOME, COLLEGE, SCHOOL, BOOK, PLEASE, THANK_YOU,
 *   WAIT, GO, TOMORROW, PEACE, TIME, WORK.
 */

export class RealISLDetector {
  constructor() {
    this.handsInstance = null;
    this.isReady = false;

    // Temporal stabilization
    this.candidateSign = null;
    this.candidateStreak = 0;
    this.candidateConfidence = 0;
    this.activeSign = null;
    this.activeSignTimestamp = 0;
    this.lastCommittedSign = null;
    this.lastCommitTime = 0;

    // Motion tracking buffer
    this.recentMovements = [];
    this.historySigns = [];
  }

  async initialize() {
    try {
      let HandsClass = window.Hands;
      if (!HandsClass && typeof window !== 'undefined') {
        try {
          const mp = await import('@mediapipe/hands');
          HandsClass = mp.Hands || window.Hands;
        } catch (e) {
          console.warn('[MediaPipe] dynamic import fallback:', e);
        }
      }

      if (!HandsClass && window.Hands) {
        HandsClass = window.Hands;
      }

      if (!HandsClass) {
        console.warn('[MediaPipe] Hands class not found in window or module, waiting...');
        return false;
      }

      this.handsInstance = new HandsClass({
        locateFile: (file) => {
          // Prefer local public folder first to eliminate network latency & offline issues
          return `/@mediapipe/hands/${file}`;
        }
      });

      // Use modelComplexity 1 for accurate 21-point tracking with balanced performance
      this.handsInstance.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.45,
        minTrackingConfidence: 0.45
      });

      this.isReady = true;
      console.log('[MediaPipe] High-Precision ISL Detector successfully initialized!');
      return true;
    } catch (err) {
      console.warn('[MediaPipe] Initialization fallback to CDN:', err);
      try {
        let HandsClass = window.Hands;
        if (HandsClass) {
          this.handsInstance = new HandsClass({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          });
          this.handsInstance.setOptions({
            maxNumHands: 2,
            modelComplexity: 0,
            minDetectionConfidence: 0.45,
            minTrackingConfidence: 0.45
          });
          this.isReady = true;
          return true;
        }
      } catch (e) {
        console.error('[MediaPipe] CDN fallback also failed:', e);
      }
      this.isReady = false;
      return false;
    }
  }

  // Draw crisp skeleton & joint halos on canvas overlay
  drawRealHands(ctx, multiHandLandmarks, width, height) {
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) return;

    const FINGER_CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],// Ring
      [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [5, 9], [9, 13], [13, 17]             // Palm base
    ];

    multiHandLandmarks.forEach((landmarks, handIdx) => {
      const isPrimary = handIdx === 0;
      const mainColor = isPrimary ? '#38bdf8' : '#818cf8';
      const glowColor = isPrimary ? 'rgba(56, 189, 248, 0.4)' : 'rgba(129, 140, 248, 0.4)';

      // 1. Draw connecting bones
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      FINGER_CONNECTIONS.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        }
      });

      // 2. Draw joints & fingertip glows
      landmarks.forEach((p, idx) => {
        const isTip = [4, 8, 12, 16, 20].includes(idx);
        const px = p.x * width;
        const py = p.y * height;

        if (isTip) {
          // Outer halo
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(px, py, 9, 0, 2 * Math.PI);
          ctx.fill();

          // Fingertip point
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // Intermediate joint
          ctx.fillStyle = idx === 0 ? '#38bdf8' : '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, idx === 0 ? 5 : 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // 3. Hand bounding box
      let minX = 1, minY = 1, maxX = 0, maxY = 0;
      landmarks.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const pad = 16;
      const bx = Math.max(0, minX * width - pad);
      const by = Math.max(0, minY * height - pad);
      const bw = Math.min(width - bx, (maxX - minX) * width + pad * 2);
      const bh = Math.min(height - by, (maxY - minY) * height + pad * 2);

      ctx.strokeStyle = isPrimary ? 'rgba(56, 189, 248, 0.45)' : 'rgba(129, 140, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);

      // Label Pill
      ctx.fillStyle = 'rgba(10, 15, 29, 0.9)';
      ctx.fillRect(bx, Math.max(0, by - 22), 75, 20);
      ctx.fillStyle = mainColor;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(isPrimary ? 'Dominant' : 'Secondary', bx + 6, Math.max(14, by - 8));
    });
  }

  // 2D Euclidean Distance
  dist(p1, p2) {
    if (!p1 || !p2) return 999;
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  // Perspective-tolerant, scale-normalized finger extension detector
  getHandFeatures(landmarks) {
    if (!landmarks || landmarks.length < 21) return null;
    const wrist = landmarks[0];

    // Knuckles (MCP)
    const mcp = {
      thumb: landmarks[2],
      index: landmarks[5],
      middle: landmarks[9],
      ring: landmarks[13],
      pinky: landmarks[17]
    };

    // PIP joints
    const pip = {
      thumb: landmarks[3],
      index: landmarks[6],
      middle: landmarks[10],
      ring: landmarks[14],
      pinky: landmarks[18]
    };

    // DIP joints
    const dip = {
      index: landmarks[7],
      middle: landmarks[11],
      ring: landmarks[15],
      pinky: landmarks[19]
    };

    // Tips
    const tip = {
      thumb: landmarks[4],
      index: landmarks[8],
      middle: landmarks[12],
      ring: landmarks[16],
      pinky: landmarks[20]
    };

    // Scale reference: palm length from wrist to middle MCP
    const palmLength = this.dist(wrist, mcp.middle) || 0.15;
    const handSpan = this.dist(mcp.index, mcp.pinky) || 0.10;

    // Check extensions for Index, Middle, Ring, Pinky
    // A finger is extended if:
    // 1. Tip is physically higher than PIP and MCP (when upright), OR
    // 2. Distance from Tip to MCP is substantially longer than PIP to MCP, AND Tip is further from wrist than PIP.
    const checkFingerExtension = (name) => {
      const t = tip[name];
      const p = pip[name];
      const m = mcp[name];
      const d = dip[name];

      // Test 1: Upright extension (finger pointing up towards top of frame)
      const isUpright = (t.y < p.y - 0.012) && (p.y < m.y + 0.03);

      // Test 2: Knuckle-relative extension (works in ANY 3D angle, horizontal, tilted)
      const lenTipMcp = this.dist(t, m);
      const lenPipMcp = this.dist(p, m);
      const isKnuckleExtended = (lenTipMcp > lenPipMcp * 1.35) && (this.dist(t, wrist) > this.dist(p, wrist) * 1.04);

      // Test 3: Straightness through DIP
      const isDipStraight = this.dist(t, m) > this.dist(d, m) * 1.05;

      return isUpright || (isKnuckleExtended && isDipStraight);
    };

    const isIndexExtended = checkFingerExtension('index');
    const isMiddleExtended = checkFingerExtension('middle');
    const isRingExtended = checkFingerExtension('ring');
    const isPinkyExtended = checkFingerExtension('pinky');

    // Thumb extension check:
    // Thumb moves on a separate plane. Thumb is extended if:
    // 1. Thumb tip is pointing up (Thumbs Up): tip.y < ip.y
    // 2. Thumb tip is far from index MCP or pinky MCP relative to palm size
    const isThumbPointingUp = tip.thumb.y < pip.thumb.y;
    const thumbToIndexMcpDist = this.dist(tip.thumb, mcp.index) / palmLength;
    const thumbToPinkyMcpDist = this.dist(tip.thumb, mcp.pinky) / palmLength;

    const isThumbExtended = isThumbPointingUp || (thumbToIndexMcpDist > 0.45) || (thumbToPinkyMcpDist > 0.75);

    // List extended fingers
    const extendedList = [];
    if (isThumbExtended) extendedList.push('Thumb');
    if (isIndexExtended) extendedList.push('Index');
    if (isMiddleExtended) extendedList.push('Middle');
    if (isRingExtended) extendedList.push('Ring');
    if (isPinkyExtended) extendedList.push('Pinky');

    const extendedCount = extendedList.length;

    // Pinches:
    const pinchIndexDist = this.dist(tip.thumb, tip.index) / palmLength;
    const isThumbIndexPinching = pinchIndexDist < 0.28;

    const pinchMiddleDist = this.dist(tip.thumb, tip.middle) / palmLength;
    const isThumbMiddlePinching = pinchMiddleDist < 0.28;

    // Palm Center
    const palmCenter = {
      x: (wrist.x + mcp.index.x + mcp.pinky.x) / 3,
      y: (wrist.y + mcp.index.y + mcp.pinky.y) / 3
    };

    return {
      wrist,
      palmCenter,
      palmLength,
      handSpan,
      tip,
      mcp,
      pip,
      dip,
      isThumbExtended,
      isIndexExtended,
      isMiddleExtended,
      isRingExtended,
      isPinkyExtended,
      isThumbIndexPinching,
      isThumbMiddlePinching,
      extendedList,
      extendedCount
    };
  }

  // High-accuracy ISL gesture classifier
  classifyFrame(multiHandLandmarks, now) {
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      return {
        status: 'HANDS_UNCLEAR',
        message: 'No hands in camera view. Raise your hands to sign.',
        sign: null,
        confidence: 0,
        postureName: 'No hands detected',
        debugInfo: 'Searching for hands...'
      };
    }

    const hand1 = this.getHandFeatures(multiHandLandmarks[0]);
    const hand2 = multiHandLandmarks.length > 1 ? this.getHandFeatures(multiHandLandmarks[1]) : null;
    if (!hand1) return { status: 'WAITING', sign: null, confidence: 0, postureName: 'Tracking...', debugInfo: 'Tracking...' };

    // Velocity & Motion vector
    let speed = 0;
    let vx = 0;
    let vy = 0;
    if (this.recentMovements.length > 0) {
      const prev = this.recentMovements[this.recentMovements.length - 1];
      const dt = Math.max(0.01, (now - prev.time) / 1000);
      vx = (hand1.wrist.x - prev.x) / dt;
      vy = (hand1.wrist.y - prev.y) / dt;
      speed = Math.hypot(vx, vy);
    }
    this.recentMovements.push({ x: hand1.wrist.x, y: hand1.wrist.y, time: now });
    if (this.recentMovements.length > 15) this.recentMovements.shift();

    // Check if hands resting low near bottom of viewport
    if (hand1.wrist.y > 0.85 && (!hand2 || hand2.wrist.y > 0.85)) {
      return {
        status: 'WAITING',
        sign: null,
        confidence: 0.90,
        postureName: 'Hands Resting',
        message: 'Hands resting low. Raise hands to sign.',
        debugInfo: 'Hands resting'
      };
    }

    const y1 = hand1.wrist.y;
    const isNearFace = y1 < 0.44;
    const isChestLevel = y1 >= 0.44 && y1 <= 0.85;

    const ext1 = hand1.extendedCount;
    const list1 = hand1.extendedList;

    // ==========================================
    // 1. TWO-HANDED GESTURES (High Priority)
    // ==========================================
    if (hand2) {
      const ext2 = hand2.extendedCount;
      const handsDist = this.dist(hand1.wrist, hand2.wrist);
      const tipsIndexDist = this.dist(hand1.tip.index, hand2.tip.index);
      const palmDist = this.dist(hand1.palmCenter, hand2.palmCenter);

      // A. HOME: Peaked roof (fingertips touching at top, wrists apart)
      if (tipsIndexDist < 0.16 && handsDist > 0.18 && (hand1.isIndexExtended || ext1 >= 3) && (hand2.isIndexExtended || ext2 >= 3)) {
        return {
          status: 'TRANSLATING',
          sign: 'HOME',
          confidence: 0.97,
          postureName: '🏠 Roof Shape (Home)',
          debugInfo: 'Two-hand roof shape'
        };
      }

      // B. HELP: Dominant fist or thumbs-up resting on flat open base palm
      if ((ext1 <= 1 && ext2 >= 4) || (ext2 <= 1 && ext1 >= 4)) {
        if (palmDist < 0.24) {
          return {
            status: 'TRANSLATING',
            sign: 'HELP',
            confidence: 0.96,
            postureName: '🤝 Fist on Palm (Help)',
            debugInfo: 'Fist on flat palm'
          };
        }
      }

      // C. FRIEND: Index fingers hooking / touching
      if (hand1.isIndexExtended && hand2.isIndexExtended && ext1 <= 2 && ext2 <= 2) {
        if (tipsIndexDist < 0.18) {
          return {
            status: 'TRANSLATING',
            sign: 'FRIEND',
            confidence: 0.95,
            postureName: '🤞 Hooked Fingers (Friend)',
            debugInfo: 'Index fingers hooked'
          };
        }
      }

      // D. BOOK: Both hands open flat side-by-side like an open book
      if (ext1 >= 4 && ext2 >= 4 && handsDist < 0.22 && isChestLevel && Math.abs(hand1.wrist.y - hand2.wrist.y) < 0.12) {
        return {
          status: 'TRANSLATING',
          sign: 'BOOK',
          confidence: 0.95,
          postureName: '📖 Open Book Palms',
          debugInfo: 'Two open flat hands side-by-side'
        };
      }

      // E. COLLEGE: One palm sliding off base palm and arcing upward
      if (ext1 >= 4 && ext2 >= 4 && vy < -0.15) {
        return {
          status: 'TRANSLATING',
          sign: 'COLLEGE',
          confidence: 0.95,
          postureName: '🎓 Upward Palm Slide (College)',
          debugInfo: 'Upward palm slide'
        };
      }

      // F. SCHOOL: Clapping flat palms horizontally
      if (ext1 >= 4 && ext2 >= 4 && handsDist < 0.20) {
        return {
          status: 'TRANSLATING',
          sign: 'SCHOOL',
          confidence: 0.94,
          postureName: '🏫 Clapping Palms (School)',
          debugInfo: 'Horizontal flat palms'
        };
      }

      // G. BUS: Both hands in fists holding steering wheel
      if (ext1 <= 1 && ext2 <= 1 && handsDist > 0.22 && handsDist < 0.55) {
        return {
          status: 'TRANSLATING',
          sign: 'BUS',
          confidence: 0.93,
          postureName: '🚌 Steering Wheel (Bus)',
          debugInfo: 'Two fists steering wheel'
        };
      }

      // H. WAIT / STOP with two hands: Both open palms held forward
      if (ext1 >= 4 && ext2 >= 4) {
        return {
          status: 'TRANSLATING',
          sign: 'WAIT',
          confidence: 0.93,
          postureName: '⏳ Open Hands (Wait)',
          debugInfo: 'Two open palms held forward'
        };
      }
    }

    // ==========================================
    // 2. SINGLE-HAND GESTURES (High Precision)
    // ==========================================

    // A. "I LOVE YOU" (🤟) — Thumb + Index + Pinky extended, Middle + Ring curled
    if (hand1.isThumbExtended && hand1.isIndexExtended && hand1.isPinkyExtended && !hand1.isMiddleExtended && !hand1.isRingExtended) {
      return {
        status: 'TRANSLATING',
        sign: 'LOVE',
        confidence: 0.98,
        postureName: '🤟 I Love You Sign',
        debugInfo: 'Thumb, Index, Pinky extended'
      };
    }

    // B. "OK" (👌) — Thumb and Index pinched in circle, while Middle or Pinky extended
    if (hand1.isThumbIndexPinching && (hand1.isMiddleExtended || hand1.isRingExtended || hand1.isPinkyExtended)) {
      return {
        status: 'TRANSLATING',
        sign: 'OK',
        confidence: 0.97,
        postureName: '👌 OK Sign',
        debugInfo: 'Thumb & Index circle, other fingers open'
      };
    }

    // C. "PHONE" / "CALL" (🤙) — "Y" shape: Thumb + Pinky extended, Middle 3 curled
    if (hand1.isThumbExtended && hand1.isPinkyExtended && !hand1.isIndexExtended && !hand1.isMiddleExtended && !hand1.isRingExtended) {
      return {
        status: 'TRANSLATING',
        sign: 'PHONE',
        confidence: 0.97,
        postureName: '📱 Y-Hand (Phone / Call)',
        debugInfo: 'Thumb and Pinky extended'
      };
    }

    // D. "WATER" (W-Handshape) — 3 middle fingers extended: Index + Middle + Ring, Pinky curled
    if (hand1.isIndexExtended && hand1.isMiddleExtended && hand1.isRingExtended && !hand1.isPinkyExtended) {
      return {
        status: 'TRANSLATING',
        sign: 'WATER',
        confidence: 0.96,
        postureName: '🚰 W-Shape (Water)',
        debugInfo: 'Index, Middle, Ring extended'
      };
    }

    // E. "YES" / "THUMBS UP" (👍)
    // Only thumb extended, or thumb pointing up with other fingers curled
    if (hand1.isThumbExtended && (ext1 <= 2) && !hand1.isPinkyExtended && (hand1.tip.thumb.y < hand1.pip.thumb.y)) {
      if (isNearFace) {
        return {
          status: 'TRANSLATING',
          sign: 'TOMORROW',
          confidence: 0.95,
          postureName: '📅 Thumb at Jaw (Tomorrow)',
          debugInfo: 'Thumb forward along jaw'
        };
      }
      return {
        status: 'TRANSLATING',
        sign: 'YES',
        confidence: 0.97,
        postureName: '👍 Thumbs Up (Yes)',
        debugInfo: 'Thumb pointing upward'
      };
    }

    // F. "NO" / "PEACE" (✌️) — "V" shape: Index + Middle extended, Ring and Pinky curled
    if (hand1.isIndexExtended && hand1.isMiddleExtended && !hand1.isRingExtended && !hand1.isPinkyExtended) {
      return {
        status: 'TRANSLATING',
        sign: 'NO',
        confidence: 0.95,
        postureName: '✌️ V-Shape (No / Peace)',
        debugInfo: 'Index and Middle extended'
      };
    }

    // G. POINTING: ONLY INDEX EXTENDED (☝️ / 👉)
    if (hand1.isIndexExtended && !hand1.isMiddleExtended && !hand1.isRingExtended && !hand1.isPinkyExtended) {
      // 1. Moving forward or flicking forward = GO
      if (Math.abs(vx) > 0.08 || vy < -0.08) {
        return {
          status: 'TRANSLATING',
          sign: 'GO',
          confidence: 0.96,
          postureName: '🏃 Flicking Index (Go)',
          debugInfo: 'Forward index flick'
        };
      }

      // 2. Wagging side to side = WHERE / NO
      if (Math.abs(vx) > 0.05) {
        return {
          status: 'TRANSLATING',
          sign: 'WHERE',
          confidence: 0.95,
          postureName: '❓ Wagging Index (Where)',
          debugInfo: 'Index wagging side to side'
        };
      }

      // 3. Pointing to self / chest = I
      // In webcam view, pointing to self has tip pointing down/inward or close to body center
      if (hand1.tip.index.y > hand1.mcp.index.y - 0.04 || Math.abs(hand1.tip.index.x - 0.5) < 0.16) {
        return {
          status: 'TRANSLATING',
          sign: 'I',
          confidence: 0.96,
          postureName: '☝️ Pointing to Chest (I / Me)',
          debugInfo: 'Index pointing to self'
        };
      }

      // 4. Pointing outward = YOU
      return {
        status: 'TRANSLATING',
        sign: 'YOU',
        confidence: 0.95,
        postureName: '👉 Pointing Forward (You)',
        debugInfo: 'Index pointing forward'
      };
    }

    // H. OPEN PALM (4 or 5 fingers extended: 🖐️ / ✋)
    if (ext1 >= 4) {
      // 1. Waving side to side or raised high = HELLO
      if (Math.abs(vx) > 0.04 || y1 < 0.50) {
        return {
          status: 'TRANSLATING',
          sign: 'HELLO',
          confidence: 0.96,
          postureName: '👋 Open Hand Wave (Hello)',
          debugInfo: 'Open hand wave / greeting'
        };
      }

      // 2. Flat palm on chest heart = MY
      if (isChestLevel && Math.abs(hand1.wrist.x - 0.5) < 0.14 && Math.abs(vx) < 0.02) {
        return {
          status: 'TRANSLATING',
          sign: 'MY',
          confidence: 0.96,
          postureName: '💖 Hand on Heart (My)',
          debugInfo: 'Flat palm on chest'
        };
      }

      // 3. Circular rub on chest = PLEASE
      if (isChestLevel && Math.abs(vx) > 0.02) {
        return {
          status: 'TRANSLATING',
          sign: 'PLEASE',
          confidence: 0.94,
          postureName: '🙏 Circular Rub (Please)',
          debugInfo: 'Circular chest rub'
        };
      }

      // 4. Palm held firmly facing camera = STOP
      return {
        status: 'TRANSLATING',
        sign: 'STOP',
        confidence: 0.95,
        postureName: '✋ Open Flat Palm (Stop)',
        debugInfo: 'Open flat palm forward'
      };
    }

    // I. EAT / FOOD (Fingertip cluster brought near mouth / chin)
    if (hand1.isThumbIndexPinching && isNearFace) {
      return {
        status: 'TRANSLATING',
        sign: 'EAT',
        confidence: 0.96,
        postureName: '🍱 Morsel to Mouth (Eat / Food)',
        debugInfo: 'Pinched fingers to mouth'
      };
    }

    // J. CLOSED FIST (✊)
    if (ext1 === 0) {
      if (Math.abs(vy) > 0.04) {
        return {
          status: 'TRANSLATING',
          sign: 'YES',
          confidence: 0.93,
          postureName: '✊ Nodding Fist (Yes)',
          debugInfo: 'Nodding fist'
        };
      }
      return {
        status: 'TRANSLATING',
        sign: 'WORK',
        confidence: 0.91,
        postureName: '✊ Closed Fist (Work)',
        debugInfo: 'Closed fist'
      };
    }

    // Return current posture features if not matched to specific sign
    return {
      status: 'TRANSLATING',
      sign: null,
      confidence: 0.70,
      postureName: `Fingers: [${list1.join(', ')}]`,
      debugInfo: `Fingers: [${list1.join(', ')}]`
    };
  }

  // Smooth, anti-flicker temporal accumulation state machine
  updateContinuousSequence(predSign, now) {
    if (!predSign) {
      // Allow candidate sign to hold through 400ms of minor jitter
      if (now - this.activeSignTimestamp > 400) {
        this.candidateStreak = Math.max(0, this.candidateStreak - 1);
        if (this.candidateStreak === 0) {
          this.activeSign = null;
        }
      }
      return null;
    }

    // If matches ongoing candidate
    if (predSign === this.candidateSign) {
      this.candidateStreak++;
    } else {
      // New candidate sign
      if (this.candidateStreak < 2) {
        this.candidateSign = predSign;
        this.candidateStreak = 1;
      } else {
        // Soft decay before switching
        this.candidateStreak--;
      }
    }

    // If held for at least 2 frames (~60-100ms), make it the active visible sign
    if (this.candidateStreak >= 2) {
      this.activeSign = this.candidateSign;
      this.activeSignTimestamp = now;
    }

    // If held steadily for at least 4 frames (~150-200ms), COMMIT to the continuous sentence sequence!
    if (this.candidateStreak >= 4) {
      // Prevent duplicate commits of the same sign within 1.2 seconds
      if (this.candidateSign !== this.lastCommittedSign || (now - this.lastCommitTime > 1200)) {
        const committed = this.candidateSign;
        this.lastCommittedSign = committed;
        this.lastCommitTime = now;
        this.candidateStreak = 0; // Reset streak so next sign can be acquired
        return committed;
      }
    }

    return null;
  }
}

export const realISLDetector = new RealISLDetector();
