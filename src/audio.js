/* AI assistance: original Codex composition and synthesized sound design; no borrowed music or Undertale assets. */
const midi = note => 440 * 2 ** ((note - 69) / 12);
const CHORDS = [[38, 57, 60, 64, 69], [34, 53, 57, 60, 65], [41, 57, 60, 64, 67], [36, 55, 60, 62, 67]];
const MELODY = [74, 81, 77, 76, 72, 77, 81, 79, 76, 72, 69, 74, 79, 74, 72, 67];

export class SpaceAudio {
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.context = null;
    this.started = false;
    this.lastPhase = '';
    this.lastShield = false;
    this.lastCountdown = -1;
    this.stats = { letters: 0, musicNotes: 0, effects: 0 };
  }

  async unlock() {
    if (!this.enabled) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (!this.context) {
      this.context = new Audio();
      const c = this.context;
      this.master = c.createGain(); this.master.gain.value = .7;
      this.limiter = c.createDynamicsCompressor();
      this.limiter.threshold.value = -12; this.limiter.knee.value = 12; this.limiter.ratio.value = 4;
      this.master.connect(this.limiter); this.limiter.connect(c.destination);
      this.music = c.createGain(); this.music.gain.value = .85; this.music.connect(this.master);
      this.effects = c.createGain(); this.effects.gain.value = .6; this.effects.connect(this.master);
      this.delay = c.createDelay(2); this.delay.delayTime.value = .5625;
      const feedback = c.createGain(); feedback.gain.value = .27;
      const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2100;
      const wet = c.createGain(); wet.gain.value = .26;
      this.delay.connect(filter); filter.connect(feedback); feedback.connect(this.delay);
      filter.connect(wet); wet.connect(this.music);
      this.noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.startMusic();
    }
    try { if (this.context.state === 'suspended') await this.context.resume(); } catch { /* Visual play works when audio is unavailable. */ }
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
    if (!this.context) { if (this.enabled) this.unlock(); return; }
    this.master.gain.setTargetAtTime(this.enabled ? .7 : 0, this.context.currentTime, .05);
    if (this.enabled) this.unlock();
  }

  startMusic() {
    this.started = true;
    this.epoch = this.context.currentTime + .15;
    this.nextChord = 0; this.nextNote = 0;
    this.schedule();
    this.timer = setInterval(() => this.schedule(), 400);
  }

  schedule() {
    const c = this.context;
    if (!c || c.state === 'closed' || c.state === 'suspended') return;
    const horizon = c.currentTime + 2.5;
    while (this.epoch + this.nextChord * 12 < horizon) {
      const at = this.epoch + this.nextChord * 12;
      const chord = CHORDS[this.nextChord % CHORDS.length];
      chord.forEach((note, i) => this.pad(midi(note), at, i === 0 ? .022 : .012, (i - 2) * .3));
      this.nextChord++;
    }
    while (this.epoch + this.nextNote * 1.5 < horizon) {
      const at = this.epoch + this.nextNote * 1.5;
      this.tone(midi(MELODY[this.nextNote % MELODY.length]), at, 2.2, .026, 'sine', this.music, true);
      this.stats.musicNotes++; this.nextNote++;
    }
  }

  pad(frequency, at, volume, pan) {
    const c = this.context, gain = c.createGain(), filter = c.createBiquadFilter();
    const stereo = c.createStereoPanner(); stereo.pan.value = pan;
    filter.type = 'lowpass'; filter.frequency.value = 750;
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(volume, at + 2.5);
    gain.gain.setValueAtTime(volume * .8, at + 10); gain.gain.linearRampToValueAtTime(0, at + 15);
    gain.connect(filter); filter.connect(stereo); stereo.connect(this.music);
    const a = c.createOscillator(), b = c.createOscillator();
    a.type = 'sine'; b.type = 'triangle'; a.frequency.value = b.frequency.value = frequency;
    a.detune.value = -4; b.detune.value = 4;
    a.connect(gain); b.connect(gain); a.start(at); b.start(at); a.stop(at + 15.1); b.stop(at + 15.1);
    b.onended = () => { a.disconnect(); b.disconnect(); gain.disconnect(); filter.disconnect(); stereo.disconnect(); };
    this.stats.musicNotes++;
  }

  tone(frequency, at, duration, volume, type = 'sine', bus = this.effects, echo = false) {
    const c = this.context; if (!c) return;
    const oscillator = c.createOscillator(), gain = c.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(volume, at + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain); gain.connect(bus); if (echo) gain.connect(this.delay);
    oscillator.start(at); oscillator.stop(at + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  letter(character, index) {
    if (!this.enabled || !this.context || this.context.state !== 'running' || !/[a-z0-9]/i.test(character)) return;
    this.tone(660 + (character.charCodeAt(0) % 5) * 45 + (index % 3) * 12, this.context.currentTime, .025, .032, 'triangle');
    this.stats.letters++;
  }

  click() {
    if (!this.enabled || this.context?.state !== 'running') return;
    this.tone(440, this.context.currentTime, .055, .045, 'sine');
    this.tone(660, this.context.currentTime + .025, .07, .025, 'sine');
  }

  chime() {
    if (!this.enabled || this.context?.state !== 'running') return;
    [74, 77, 81].forEach((note, i) => this.tone(midi(note), this.context.currentTime + i * .11, .65, .07, 'sine', this.effects, true));
    this.stats.effects++;
  }

  whoosh() {
    if (!this.enabled || this.context?.state !== 'running') return;
    const c = this.context, source = c.createBufferSource(), gain = c.createGain(), filter = c.createBiquadFilter();
    source.buffer = this.noise; filter.type = 'lowpass'; filter.frequency.setValueAtTime(300, c.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1900, c.currentTime + .4);
    filter.frequency.exponentialRampToValueAtTime(200, c.currentTime + 1.4);
    gain.gain.setValueAtTime(0, c.currentTime); gain.gain.linearRampToValueAtTime(.1, c.currentTime + .25); gain.gain.linearRampToValueAtTime(0, c.currentTime + 1.5);
    source.connect(filter); filter.connect(gain); gain.connect(this.effects); source.start(); source.stop(c.currentTime + 1.6);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); }; this.stats.effects++;
  }

  shield(on) {
    if (!this.context) return;
    const c = this.context;
    if (on && this.enabled) {
      this.hum = c.createOscillator(); this.hum.type = 'sine'; this.hum.frequency.value = 96;
      this.humGain = c.createGain(); this.humGain.gain.setValueAtTime(0, c.currentTime); this.humGain.gain.linearRampToValueAtTime(.033, c.currentTime + .15);
      this.hum.connect(this.humGain); this.humGain.connect(this.effects); this.hum.start();
      this.tone(330, c.currentTime, .2, .055, 'sine');
    } else if (this.hum) {
      const oscillator = this.hum, gain = this.humGain;
      gain.gain.setTargetAtTime(0, c.currentTime, .04); oscillator.stop(c.currentTime + .2);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); }; this.hum = null;
    }
  }

  update(game) {
    const s = game.state;
    if (s.shield !== this.lastShield) { this.shield(s.shield); this.lastShield = s.shield; }
    if (s.phase !== this.lastPhase) {
      if (s.phase === 'storm') this.whoosh();
      if (s.phase === 'debrief' && s.lastResult?.quality !== 'missed') this.chime();
      if (s.phase === 'report' && s.outcome === 'won') this.chime();
      this.lastPhase = s.phase; this.lastCountdown = -1;
    }
    if (this.enabled && this.context?.state === 'running' && s.phase === 'warning' && !s.paused) {
      const count = Math.ceil(game.warningRemaining);
      if (count <= 3 && count > 0 && count !== this.lastCountdown) this.tone(220 + (3 - count) * 55, this.context.currentTime, .13, .04);
      this.lastCountdown = count;
    }
  }

  suspend() { if (this.context?.state === 'running') this.context.suspend().catch(() => {}); }
}
