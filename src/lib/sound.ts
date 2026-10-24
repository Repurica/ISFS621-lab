let audioContext: AudioContext | null = null;

export function playAcceptedChime(): void {
  if (typeof window === 'undefined') return;

  const AudioContextConstructor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) return;

  try {
    audioContext ??= new AudioContextConstructor();
    void audioContext.resume();

    const now = audioContext.currentTime + 0.02;
    const notes = [
      { frequency: 880, start: 0, duration: 0.16 },
      { frequency: 1318.51, start: 0.14, duration: 0.3 },
    ];

    for (const note of notes) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = now + note.start;

      oscillator.type = 'sine';
      oscillator.frequency.value = note.frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.11, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.duration);

      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + note.duration + 0.02);
    }
  } catch {
    // Audio is a nice-to-have; never block the payment confirmation.
  }
}
