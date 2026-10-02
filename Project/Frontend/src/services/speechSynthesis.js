class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.currentUtterance = null;
    this.selectedVoice = null;
    this.rate = 1.0;
    this.pitch = 1.0;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Prioritize English Indian (en-IN) or natural English voices
    const inVoice = this.voices.find(v => v.lang === 'en-IN');
    const usVoice = this.voices.find(v => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google')));
    const anyEn = this.voices.find(v => v.lang.startsWith('en'));
    this.selectedVoice = inVoice || usVoice || anyEn || this.voices[0] || null;
  }

  getVoices() {
    if (!this.voices.length && this.synth) {
      this.loadVoices();
    }
    return this.voices.filter(v => v.lang.startsWith('en'));
  }

  setVoice(voiceUri) {
    const v = this.voices.find(voice => voice.voiceURI === voiceUri);
    if (v) this.selectedVoice = v;
  }

  setRate(speed) {
    this.rate = Math.max(0.5, Math.min(2.0, speed));
  }

  speak(text, onStart, onEnd, onError) {
    if (!this.synth || !text) return;

    this.stop(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking() {
    return !!(this.synth && this.synth.speaking);
  }

  isPaused() {
    return !!(this.synth && this.synth.paused);
  }
}

export const speechService = new SpeechService();
