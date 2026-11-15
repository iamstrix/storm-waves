/* AI assistance: Codex implementation of Claude Code's spec; NASA DONKI records are supplied data. */
import { CONFIG, warningSeconds, stormSeconds } from './config.js?v=2';

export function prepareEvents(snapshot) {
  if (!Array.isArray(snapshot?.events)) throw new Error('The saved storm data could not be read.');
  const seen = new Set();
  const events = snapshot.events.filter(event => {
    const valid = event.marsModelArrival && Number.isFinite(Date.parse(event.startTime)) && Number.isFinite(Date.parse(event.marsModelArrival)) &&
      Number.isFinite(event.speedKmS) && event.speedKmS > 0 && Number.isFinite(event.halfAngleDeg) && event.halfAngleDeg > 0 &&
      typeof event.id === 'string' && !seen.has(event.id);
    if (valid) seen.add(event.id);
    return valid;
  }).map(event => Object.freeze({ ...event })).sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
  if (events.length < CONFIG.runLength) throw new Error('Not enough saved storms to start a mission.');
  return events;
}

export async function loadEvents() {
  const response = await fetch(new URL('../data/cme-snapshot.json', import.meta.url));
  if (!response.ok) throw new Error('The saved storm file could not load. Please try again.');
  return prepareEvents(await response.json());
}

export function buildRun(events, { random = Math.random, startIndex, previousStart = -1 } = {}) {
  const possibilities = events.length - CONFIG.runLength + 1;
  let start = Number.isInteger(startIndex) ? Math.min(possibilities - 1, Math.max(0, startIndex)) : Math.floor(random() * possibilities);
  if (!Number.isInteger(startIndex) && possibilities > 1 && start === previousStart) start = (start + 1) % possibilities;
  return { start, events: events.slice(start, start + CONFIG.runLength) };
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const eventDate = event => dateFormatter.format(new Date(event.startTime));
export const travelDays = event => Math.max(0, Math.round((Date.parse(event.marsModelArrival) - Date.parse(event.startTime)) / 86_400_000));
export const speedLabel = event => event.speedKmS < 400 ? 'Slow' : event.speedKmS < 700 ? 'Medium speed' : 'Fast';
export const sizeLabel = event => event.halfAngleDeg < 20 ? 'Small' : event.halfAngleDeg < 35 ? 'Medium size' : 'Big';
export const encounterLabel = event => event.marsGlancingBlow ? 'Predicted glancing encounter' : 'Predicted direct encounter';
export const protectionCost = event => Math.ceil(stormSeconds(event) * CONFIG.shieldPowerPerSecond);
export const reserveTarget = event => protectionCost(event) + CONFIG.airPowerReserve;
export const roundedWarning = event => Math.round(warningSeconds(event));
