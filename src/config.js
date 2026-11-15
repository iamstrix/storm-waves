/* AI assistance: Codex implemented this original game from Claude Code's design/spec. */
export const CONFIG = Object.freeze({
  runLength: 8,
  fixedStep: 1 / 60,
  maximumFrameTime: 0.25,
  initialPower: 70,
  initialAir: 100,
  initialCrew: 100,
  maximumMeter: 100,
  solarRechargePerSecond: 4,
  shieldPowerPerSecond: 10,
  shieldRearmMinimum: 4,
  // A reserve keeps automatic solar charging from erasing the air tradeoff.
  airPowerReserve: 20,
  airRecoveryPerSecond: 2,
  airLossPerSecond: 8,
  directCrewLossPerSecond: 12,
  glancingCrewLossPerSecond: 6,
  speedMinimum: 218,
  speedMaximum: 1048,
  warningSlowSeconds: 9,
  warningFastSeconds: 4,
  angleMinimum: 10,
  angleMaximum: 50,
  stormShortSeconds: 2,
  stormLongSeconds: 4.5,
  sciencePower: 15,
  scienceStars: 1,
  restPower: 15,
  restCrew: 20,
  chargePower: 25,
  goodCoverage: 0.9,
  goodEarlySeconds: 1.5,
  practiceWarningMultiplier: 2,
  practiceButtonUnlockSeconds: 1.2,
  comparisonDistanceKm: 960,
  pilotStars: 3,
  commanderStars: 6,
  speechRate: 0.95,
  capturedLabel: '15 Nov 2026',
  donkiUrl: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/',
});

export const clamp = (value, minimum = 0, maximum = CONFIG.maximumMeter) => Math.min(maximum, Math.max(minimum, value));
export const interpolate = (value, low, high, from, to) => from + clamp((value - low) / (high - low), 0, 1) * (to - from);
export const warningSeconds = event => interpolate(event.speedKmS, CONFIG.speedMinimum, CONFIG.speedMaximum, CONFIG.warningSlowSeconds, CONFIG.warningFastSeconds);
export const stormSeconds = event => interpolate(event.halfAngleDeg, CONFIG.angleMinimum, CONFIG.angleMaximum, CONFIG.stormShortSeconds, CONFIG.stormLongSeconds);
