/**
 * Client-Side Real-Time ISL Feature Extraction & Temporal Sign Recognizer
 * Evaluates hand, pose, and facial landmark coordinates at 60 FPS directly on the client canvas.
 */

export class ClientGestureEngine {
  constructor() {
    this.frameBuffer = [];
    this.maxBufferFrames = 30;
    this.lastRecognizedSign = null;
    this.signConsecutiveCount = 0;
    this.activeSequence = [];
    this.lastSignTimestamp = 0;
  }

  reset() {
    this.frameBuffer = [];
    this.lastRecognizedSign = null;
    this.signConsecutiveCount = 0;
    this.activeSequence = [];
    this.lastSignTimestamp = 0;
  }

  // Calculate Euclidean distance between two 3D landmarks
  dist(p1, p2) {
    if (!p1 || !p2) return 999;
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + 
      Math.pow(p1.y - p2.y, 2) + 
      Math.pow((p1.z || 0) - (p2.z || 0), 2)
    );
  }

  // Extract extended fingers state
  getFingerStates(hand) {
    if (!hand || hand.length < 21) return { extended: [], wrist: null, palm: null };
    const wrist = hand[0];
    const palm = {
      x: (hand[0].x + hand[5].x + hand[17].x) / 3,
      y: (hand[0].y + hand[5].y + hand[17].y) / 3,
      z: ((hand[0].z || 0) + (hand[5].z || 0) + (hand[17].z || 0)) / 3
    };

    const fingers = [
      { name: 'THUMB', tip: 4, pip: 2 },
      { name: 'INDEX', tip: 8, pip: 6 },
      { name: 'MIDDLE', tip: 12, pip: 10 },
      { name: 'RING', tip: 16, pip: 14 },
      { name: 'PINKY', tip: 20, pip: 18 }
    ];

    const extended = [];
    for (const f of fingers) {
      const dTip = this.dist(hand[f.tip], wrist);
      const dPip = this.dist(hand[f.pip], wrist);
      if (dTip > dPip * 1.18) {
        extended.push(f.name);
      }
    }

    return {
      extended,
      wrist,
      palm,
      indexTip: hand[8],
      thumbTip: hand[4],
      middleTip: hand[12]
    };
  }

  // Analyze single frame and return prediction
  evaluateFrame(results, timestamp) {
    const hands = results.multiHandLandmarks || [];
    const pose = results.poseLandmarks || [];

    // Check Person Presence
    if (hands.length === 0 && pose.length === 0) {
      return {
        status: 'NO_PERSON',
        message: 'No person detected. Please position yourself in front of the camera.',
        sign: null,
        confidence: 0
      };
    }

    // Check Hand Visibility
    if (hands.length === 0) {
      return {
        status: 'HANDS_UNCLEAR',
        message: 'Hands not clearly visible. Please raise your hands to sign.',
        sign: 'BLANK',
        confidence: 0.95
      };
    }

    // Determine hands
    const hand1 = this.getFingerStates(hands[0]);
    const hand2 = hands.length > 1 ? this.getFingerStates(hands[1]) : null;

    // Temporal velocity calculation
    let speed = 0;
    let vy = 0;
    let vx = 0;
    if (this.frameBuffer.length > 2) {
      const prev = this.frameBuffer[this.frameBuffer.length - 1];
      if (prev && prev.wrist && hand1.wrist) {
        vx = hand1.wrist.x - prev.wrist.x;
        vy = hand1.wrist.y - prev.wrist.y;
        speed = Math.sqrt(vx * vx + vy * vy);
      }
    }

    this.frameBuffer.push({ wrist: hand1.wrist, timestamp });
    if (this.frameBuffer.length > this.maxBufferFrames) {
      this.frameBuffer.shift();
    }

    // Elevation zones from nose/shoulders
    let noseY = 0.28;
    let chestY = 0.52;
    if (pose.length > 12) {
      noseY = pose[0].y;
      chestY = (pose[11].y + pose[12].y) / 2;
    }

    const isNearFace = hand1.wrist.y < chestY - 0.05;
    const isChestLevel = hand1.wrist.y >= chestY - 0.05 && hand1.wrist.y <= 0.82;
    const isLow = hand1.wrist.y > 0.82;

    if (isLow && !hand2) {
      return { status: 'WAITING', sign: 'BLANK', confidence: 0.95 };
    }

    const ext1 = hand1.extended;
    const extCount1 = ext1.length;

    // --- TWO HANDED SIGNS ---
    if (hand2 && hand2.wrist) {
      const ext2 = hand2.extended;
      const handsDist = this.dist(hand1.wrist, hand2.wrist);

      if (extCount1 >= 4 && ext2.length >= 4) {
        if (handsDist < 0.25 && speed > 0.05) {
          return { status: 'TRANSLATING', sign: 'STOP', confidence: 0.95 };
        }
        if (handsDist < 0.18 && isNearFace) {
          return { status: 'TRANSLATING', sign: 'HOME', confidence: 0.94 };
        }
        if (handsDist < 0.22 && isChestLevel) {
          return { status: 'TRANSLATING', sign: 'BOOK', confidence: 0.93 };
        }
        if (vy < -0.04) {
          return { status: 'TRANSLATING', sign: 'COLLEGE', confidence: 0.95 };
        }
        return { status: 'TRANSLATING', sign: 'WHAT', confidence: 0.91 };
      }

      if (ext1.includes('INDEX') && ext2.includes('INDEX') && extCount1 <= 2 && ext2.length <= 2) {
        if (handsDist < 0.16) {
          return { status: 'TRANSLATING', sign: 'FRIEND', confidence: 0.93 };
        }
        return { status: 'TRANSLATING', sign: 'PAIN', confidence: 0.94 };
      }

      if (extCount1 <= 1 && ext2.length <= 1 && handsDist > 0.22 && handsDist < 0.5) {
        return { status: 'TRANSLATING', sign: 'BUS', confidence: 0.92 };
      }
    }

    // --- SINGLE HAND / DOMINANT HAND SIGNS ---
    // 1. Pointing (INDEX ONLY)
    if (extCount1 === 1 && ext1.includes('INDEX')) {
      if (isChestLevel) {
        // Pointing inward toward chest = I
        if (Math.abs(hand1.indexTip.x - 0.5) < 0.2) {
          return { status: 'TRANSLATING', sign: 'I', confidence: 0.96 };
        }
        if (speed > 0.04) {
          return { status: 'TRANSLATING', sign: 'GO', confidence: 0.94 };
        }
        return { status: 'TRANSLATING', sign: 'YOU', confidence: 0.93 };
      }
      if (isNearFace) {
        if (Math.abs(hand1.indexTip.y - noseY) < 0.12) {
          return { status: 'TRANSLATING', sign: 'WHO', confidence: 0.92 };
        }
        return { status: 'TRANSLATING', sign: 'WHERE', confidence: 0.94 };
      }
    }

    // 2. Open Palm (4-5 fingers)
    if (extCount1 >= 4) {
      if (isNearFace) {
        if (speed > 0.03) {
          return { status: 'TRANSLATING', sign: 'THANK_YOU', confidence: 0.95 };
        }
        return { status: 'TRANSLATING', sign: 'SLEEP', confidence: 0.93 };
      }
      if (isChestLevel) {
        if (speed < 0.02) {
          return { status: 'TRANSLATING', sign: 'MY', confidence: 0.95 };
        }
        return { status: 'TRANSLATING', sign: 'PLEASE', confidence: 0.93 };
      }
      if (isLow) {
        return { status: 'TRANSLATING', sign: 'HUNGRY', confidence: 0.91 };
      }
    }

    // 3. Pinch / Mouth Gesture
    if (extCount1 === 0 || (extCount1 === 1 && ext1.includes('THUMB'))) {
      if (isNearFace) {
        return { status: 'TRANSLATING', sign: 'EAT', confidence: 0.94 };
      }
      if (isChestLevel) {
        return { status: 'TRANSLATING', sign: 'MONEY', confidence: 0.92 };
      }
    }

    // 4. Phone Y-handshape
    if (extCount1 === 2 && ext1.includes('THUMB') && ext1.includes('PINKY')) {
      if (isNearFace) {
        return { status: 'TRANSLATING', sign: 'PHONE', confidence: 0.96 };
      }
      return { status: 'TRANSLATING', sign: 'WHY', confidence: 0.92 };
    }

    // 5. Thumb up
    if (extCount1 === 1 && ext1.includes('THUMB')) {
      if (isNearFace) {
        return { status: 'TRANSLATING', sign: 'TOMORROW', confidence: 0.94 };
      }
      return { status: 'TRANSLATING', sign: 'YES', confidence: 0.91 };
    }

    // 6. Water W-hand
    if (extCount1 === 3 && ext1.includes('INDEX') && ext1.includes('MIDDLE') && ext1.includes('RING')) {
      if (isNearFace) {
        return { status: 'TRANSLATING', sign: 'WATER', confidence: 0.94 };
      }
    }

    // 7. No / V-hand
    if (extCount1 === 2 && ext1.includes('INDEX') && ext1.includes('MIDDLE')) {
      if (speed > 0.04) {
        return { status: 'TRANSLATING', sign: 'NO', confidence: 0.94 };
      }
      return { status: 'TRANSLATING', sign: 'READ', confidence: 0.91 };
    }

    return {
      status: 'UNCERTAIN',
      message: 'Waiting for a clearer sign...',
      sign: null,
      confidence: 0.58
    };
  }

  // Synthesize sequence into English
  translateSequenceToEnglish(sequence) {
    if (!sequence || sequence.length === 0) return '';
    const key = sequence.join(' ');
    
    const rules = {
      // Single signs
      'HELLO': 'Hello!',
      'YES': 'Yes.',
      'NO': 'No.',
      'I': 'I',
      'YOU': 'You',
      'LOVE': 'I love you.',
      'OK': 'Okay, sounds good.',
      'STOP': 'Please stop.',
      'WATER': 'Water.',
      'EAT': 'Food / Eat.',
      'PHONE': 'Phone call.',
      'HELP': 'I need help.',
      'HOME': 'Home.',
      'COLLEGE': 'College.',
      'SCHOOL': 'School.',
      'BOOK': 'Book.',
      'PLEASE': 'Please.',
      'THANK_YOU': 'Thank you!',
      'WAIT': 'Please wait a moment.',
      'TOMORROW': 'Tomorrow.',
      'WORK': 'Work.',
      'FRIEND': 'Friend.',
      'BUS': 'Bus.',

      // 2-sign combinations
      'HELLO FRIEND': 'Hello, my friend!',
      'HOW YOU': 'How are you?',
      'HELLO YOU': 'Hello to you!',
      'PLEASE HELP': 'Please help me.',
      'I HELP': 'I can help you.',
      'YOU HELP': 'Can you help me?',
      'WATER PLEASE': 'May I have some water, please?',
      'FOOD PLEASE': 'May I have some food, please?',
      'THANK_YOU FRIEND': 'Thank you, my friend.',
      'STOP WAIT': 'Please stop and wait.',
      'YES UNDERSTAND': 'Yes, I understand.',
      'NO UNDERSTAND': 'No, I do not understand.',
      'I OK': 'I am okay.',
      'YOU OK': 'Are you okay?',
      'I TIRED': 'I am tired.',
      'I HUNGRY': 'I am hungry.',
      'I THIRSTY': 'I am thirsty.',
      'WHERE BUS': 'Where is the bus stop?',
      'WHERE HOSPITAL': 'Where is the hospital?',
      'WHERE TOILET': 'Where is the restroom / toilet?',
      'WHERE HOME': 'Where is your home?',
      'MY FRIEND': 'My friend.',
      'MY HOME': 'My home.',
      'MY NAME': 'My name.',
      'GO HOME': 'Go home.',
      'GO COLLEGE': 'Go to college.',
      'GO SCHOOL': 'Go to school.',
      'PHONE PLEASE': 'Please give me the phone.',
      'READ BOOK': 'Reading a book.',
      'I STUDENT': 'I am a student.',

      // 3-sign combinations
      'I LOVE YOU': 'I love you.',
      'HELLO HOW YOU': 'Hello, how are you?',
      'I GO HOME': 'I am going home.',
      'I GO COLLEGE': 'I am going to college.',
      'I GO SCHOOL': 'I am going to school.',
      'I NEED HELP': 'I need help.',
      'I WANT WATER': 'I want some water.',
      'I WANT FOOD': 'I want some food.',
      'I EAT FOOD': 'I am eating food.',
      'I DRINK WATER': 'I am drinking water.',
      'MY NAME LAHARI': 'My name is Lahari.',
      'I LIKE MUSIC': 'I like music.',
      'YOU LIKE MUSIC': 'Do you like music?',
      'I WORK HOME': 'I am working from home.',
      'PLEASE STOP WAIT': 'Please stop and wait.',
      'TOMORROW I GO': 'I will go tomorrow.',
      'WHERE MY FRIEND': 'Where is my friend?',
      'I PAIN MEDICINE': 'I am in pain and I need medicine.',

      // 4+ continuous sequences
      'I GO COLLEGE TOMORROW': 'I will go to college tomorrow.',
      'I GO SCHOOL TOMORROW': 'I will go to school tomorrow.',
      'I GO HOME TOMORROW': 'I will go home tomorrow.',
      'HELLO MY NAME LAHARI': 'Hello, my name is Lahari.',
      'HELLO HOW YOU TODAY': 'Hello, how are you today?',
      'I HUNGRY WANT FOOD': 'I am hungry and I want food.',
      'I THIRSTY WANT WATER': 'I am thirsty and I want water.',
      'WHERE HOSPITAL EMERGENCY': 'Where is the hospital? It is an emergency.',
      'I PAIN NEED MEDICINE': 'I am in pain and I need medicine.',
      'WHY YOU SAD TODAY': 'Why are you sad today?'
    };

    if (rules[key]) return rules[key];

    // Generic natural synthesis
    let hasTomorrow = sequence.includes('TOMORROW');
    let hasGo = sequence.includes('GO');
    let place = sequence.find(s => ['COLLEGE', 'SCHOOL', 'HOME', 'HOSPITAL', 'SHOP', 'OFFICE'].includes(s));
    
    if (sequence.includes('I') && hasGo && place) {
      const p = place === 'HOME' ? 'home' : `to the ${place.toLowerCase()}`;
      return hasTomorrow ? `I will go ${p} tomorrow.` : `I am going ${p}.`;
    }

    if (sequence.includes('WHERE') && place) {
      return `Where is the ${place.toLowerCase()}?`;
    }

    // Capitalized sentence
    return sequence.map(w => w.charAt(0) + w.slice(1).toLowerCase().replace('_', ' ')).join(' ') + '.';
  }
}

export const clientGestureEngine = new ClientGestureEngine();
