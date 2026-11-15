/* AI assistance: Codex drew these original SVG UI symbols for the user's revised direction. */
const paths = {
  bolt: '<path d="m13 2-8 12h6l-1 8 9-13h-7z"/>',
  air: '<path d="M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M5 16h5a3 3 0 1 1-3 3"/>',
  heart: '<path d="M20.3 5.8c-2.3-2.3-6-1.7-8.3.8-2.3-2.5-6-3.1-8.3-.8-2.4 2.5-1.5 6.1.6 8.3L12 22l7.7-7.9c2.1-2.2 3-5.8.6-8.3Z"/>',
  star: '<path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8-6.1-3.2-6.1 3.2 1.2-6.8L2.2 9.2l6.8-1Z"/>',
  shield: '<path d="m12 2 8 3v6c0 5-3.7 9-8 11-4.3-2-8-6-8-11V5Z"/><path d="m8.5 11 2.4 2.5 4.6-5"/>',
  flask: '<path d="M9 3h6M10 3v6L4 19a1.4 1.4 0 0 0 1.2 2h13.6a1.4 1.4 0 0 0 1.2-2L14 9V3M7.5 14h9"/><path d="M10 17h.1m4 1h.1"/>',
  rest: '<path d="M3 18V6m0 8h18v7m-18-3h18M8 14V8h10a3 3 0 0 1 3 3v3M3 21v-3"/><path d="M4 10h4"/>',
  battery: '<rect x="3" y="6" width="17" height="12" rx="3"/><path d="M22 10v4M7 12h9m-4-3v6"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  sound: '<path d="m12 3-6 5H2v8h4l6 5ZM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted: '<path d="m12 3-6 5H2v8h4l6 5ZM17 9l5 6m0-6-5 6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.6 2.6 0 1 1 4.6 1.6c-1 1-2.1 1-2.1 3M12 17h.01"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 5 5L20 6"/>',
  book: '<path d="M12 5C9 3 6 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v16"/>',
  replay: '<path d="M3 9a9 9 0 1 1 0 7M3 3v6h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2 2m11.6 11.6 2 2M4.2 19.8l2-2M17.8 6.2l2-2"/>',
  fast: '<path d="m4 5 7 7-7 7m9-14 7 7-7 7"/>',
  planet: '<circle cx="12" cy="12" r="7"/><path d="M5.7 8C1 9-.3 11 2 13s12 4 18 1 3-5-2-5"/>',
  touch: '<path d="M8 12V5a2 2 0 0 1 4 0v7-3l3 1 3 1 2 2-2 8H9l-5-7a2 2 0 0 1 3-2l1 1"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
};
export function icon(name, className = '', size = 24) {
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
}
