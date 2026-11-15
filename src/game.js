/* AI assistance: Codex wrote this original game model from Claude Code's design/spec. */
import { CONFIG, clamp, warningSeconds, stormSeconds } from './config.js?v=2';
import { buildRun } from './data.js?v=2';

export class StormGame {
  constructor(events, { random = Math.random } = {}) {
    this.events = events;
    this.random = random;
    this.previousStart = -1;
    this.revision = 0;
    this.state = this.freshState();
  }

  freshState() {
    return {
      phase: 'start', storyPanel: 0, paused: false, practice: false,
      run: [], index: 0, phaseTime: 0, activeSeconds: 0,
      power: CONFIG.initialPower, air: CONFIG.initialAir, crew: CONFIG.initialCrew, stars: 0,
      shield: false, shieldInput: false, exhausted: false, completed: 0,
      history: [], wave: null, lastResult: null, outcome: null, reason: '',
    };
  }

  touch() { this.revision++; }
  get event() { return this.state.run[this.state.index] || this.events[0]; }
  get nextEvent() { return this.state.run[this.state.index + 1]; }
  get isActive() { return ['warning', 'storm'].includes(this.state.phase) && !this.state.paused; }
  get warningDuration() { return warningSeconds(this.event) * (this.state.practice ? CONFIG.practiceWarningMultiplier : 1); }
  get stormDuration() { return stormSeconds(this.event); }
  get warningRemaining() { return Math.max(0, this.warningDuration - this.state.phaseTime); }
  get canRaiseShield() {
    const s = this.state;
    if (!this.isActive || s.exhausted || s.power < CONFIG.shieldRearmMinimum) return false;
    return !(s.practice && s.phase === 'warning' && this.warningRemaining > CONFIG.practiceButtonUnlockSeconds);
  }

  begin({ withStory = false, startIndex } = {}) {
    const run = buildRun(this.events, { random: this.random, previousStart: this.previousStart, startIndex });
    this.previousStart = run.start;
    this.state = { ...this.freshState(), run: run.events, phase: withStory ? 'story' : 'intro' };
    this.touch();
  }

  advanceStory() {
    if (this.state.phase !== 'story') return;
    if (this.state.storyPanel < 3) this.state.storyPanel++;
    else this.beginPractice();
    this.touch();
  }

  beginPractice() {
    Object.assign(this.state, { phase: 'tutorial', practice: true, paused: false, phaseTime: 0 });
    this.releaseShield();
    this.touch();
  }

  ready() {
    if (!['intro', 'tutorial'].includes(this.state.phase)) return;
    const s = this.state;
    Object.assign(s, { phase: 'warning', phaseTime: 0, paused: false, exhausted: false });
    this.releaseShield();
    s.wave = { covered: 0, early: 0, powerSpent: 0, crewBefore: s.crew, airBefore: s.air };
    this.touch();
  }

  setShield(pressed) {
    const s = this.state;
    if (!pressed) {
      const changed = s.shield || s.shieldInput || s.exhausted;
      s.shield = false; s.shieldInput = false; s.exhausted = false;
      if (changed) this.touch();
      return true;
    }
    if (s.shieldInput) return s.shield;
    s.shieldInput = true;
    s.shield = this.canRaiseShield;
    this.touch();
    return s.shield;
  }

  releaseShield() { this.setShield(false); }

  pause() {
    if (!this.isActive) return;
    this.releaseShield(); this.state.paused = true; this.touch();
  }

  resume() {
    if (!this.state.paused) return;
    this.state.paused = false; this.releaseShield(); this.touch();
  }

  step(dt = CONFIG.fixedStep) {
    if (!this.isActive || !(dt > 0)) return;
    const s = this.state;
    const remaining = (s.phase === 'warning' ? this.warningDuration : this.stormDuration) - s.phaseTime;
    const elapsed = Math.min(dt, Math.max(0, remaining));
    let shielded = 0;
    if (s.shield) {
      shielded = Math.min(elapsed, s.power / CONFIG.shieldPowerPerSecond);
      const spent = shielded * CONFIG.shieldPowerPerSecond;
      s.power = clamp(s.power - spent);
      s.wave.powerSpent += spent;
      if (s.phase === 'warning') s.wave.early += shielded;
      if (s.phase === 'storm') s.wave.covered += shielded;
      if (s.power <= 0.00001) {
        s.power = 0; s.shield = false; s.exhausted = true; this.touch();
      }
    }
    s.power = clamp(s.power + (elapsed - shielded) * CONFIG.solarRechargePerSecond);
    if (!s.practice) {
      s.air = clamp(s.air + elapsed * (s.power >= CONFIG.airPowerReserve ? CONFIG.airRecoveryPerSecond : -CONFIG.airLossPerSecond));
      if (s.phase === 'storm') {
        const damageRate = this.event.marsGlancingBlow ? CONFIG.glancingCrewLossPerSecond : CONFIG.directCrewLossPerSecond;
        s.crew = clamp(s.crew - (elapsed - shielded) * damageRate);
      }
    }
    s.phaseTime += elapsed;
    s.activeSeconds += elapsed;
    if (s.air <= 0 || s.crew <= 0) { this.finish(false, s.air <= 0 ? 'air' : 'crew'); return; }
    if (s.phase === 'warning' && s.phaseTime + 1e-8 >= this.warningDuration) {
      s.phase = 'storm'; s.phaseTime = 0; this.touch();
    } else if (s.phase === 'storm' && s.phaseTime + 1e-8 >= this.stormDuration) this.completeWave();
  }

  completeWave() {
    const s = this.state;
    const coverage = Math.min(1, s.wave.covered / this.stormDuration);
    s.lastResult = {
      event: this.event, coverage, earlySeconds: s.wave.early,
      powerSpent: s.wave.powerSpent, crewLost: Math.max(0, s.wave.crewBefore - s.crew),
      airLost: Math.max(0, s.wave.airBefore - s.air),
      quality: coverage >= CONFIG.goodCoverage ? (s.wave.early <= CONFIG.goodEarlySeconds ? 'great' : 'early') : 'missed',
    };
    if (!s.practice) { s.completed++; s.history.push(s.lastResult); }
    s.phase = 'debrief'; s.phaseTime = 0;
    this.releaseShield(); this.touch();
  }

  choose(choice) {
    const s = this.state;
    if (s.phase !== 'debrief' || !['science', 'rest', 'charge'].includes(choice)) return false;
    if (choice === 'science' && s.power + 1e-8 < CONFIG.sciencePower) return false;
    if (choice === 'rest' && s.power + 1e-8 < CONFIG.restPower) return false;
    if (choice === 'science') { s.power = clamp(s.power - CONFIG.sciencePower); s.stars += CONFIG.scienceStars; }
    if (choice === 'rest') { s.power = clamp(s.power - CONFIG.restPower); s.crew = clamp(s.crew + CONFIG.restCrew); }
    if (choice === 'charge') s.power = clamp(s.power + CONFIG.chargePower);
    if (s.practice) {
      Object.assign(s, { phase: 'intro', practice: false, phaseTime: 0, power: CONFIG.initialPower, air: CONFIG.initialAir, crew: CONFIG.initialCrew, stars: 0, activeSeconds: 0, lastResult: null });
    } else {
      s.history.at(-1).choice = choice;
      if (s.index + 1 >= s.run.length) this.finish(true);
      else { s.index++; s.phase = 'intro'; s.phaseTime = 0; }
    }
    this.touch(); return true;
  }

  finish(won, reason = '') {
    Object.assign(this.state, { phase: 'report', outcome: won ? 'won' : 'ended', reason, paused: false });
    this.releaseShield(); this.touch();
  }

  showStart() { this.releaseShield(); this.state.phase = 'start'; this.state.paused = false; this.touch(); }
  get rank() { return this.state.stars >= CONFIG.commanderStars ? 'Commander' : this.state.stars >= CONFIG.pilotStars ? 'Pilot' : 'Cadet'; }
}
