/* AI assistance: Codex wrote this original typewriter dialogue; blips are synthesized, not spoken TTS. */
export class Dialogue {
  constructor(audio) { this.audio = audio; this.frame = 0; this.typing = false; }

  show(element, text) {
    this.cancel();
    if (!element) return;
    this.element = element; this.text = text; this.position = 0;
    const layout = document.createElement('span'); layout.className = 'dialogue-layout'; layout.textContent = text; layout.setAttribute('aria-hidden', 'true');
    this.output = document.createElement('span'); this.output.className = 'dialogue-typed'; this.output.setAttribute('aria-hidden', 'true');
    const accessible = document.createElement('span'); accessible.className = 'sr-only'; accessible.textContent = text;
    element.replaceChildren(layout, this.output, accessible);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { this.output.textContent = text; return; }
    this.typing = true; element.classList.add('typing');
    let next = performance.now();
    const tick = now => {
      if (!this.typing || !this.element.isConnected) return;
      if (now >= next) {
        const letter = text[this.position]; this.output.textContent += letter;
        this.audio.letter(letter, this.position); this.position++;
        next = now + (/[,.!?]/.test(letter) ? 135 : 29);
        if (this.position >= text.length) { this.typing = false; element.classList.remove('typing'); return; }
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  finish() {
    if (!this.typing) return false;
    cancelAnimationFrame(this.frame); this.output.textContent = this.text;
    this.typing = false; this.element.classList.remove('typing'); return true;
  }

  cancel() {
    cancelAnimationFrame(this.frame); this.typing = false;
    this.element?.classList.remove('typing');
  }
}
