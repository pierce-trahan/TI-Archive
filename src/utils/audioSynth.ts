/**
 * Web Audio API & Speech Synthesis engine for Dota 2 Caster Calls
 * Generates energetic, arena-reverbed caster calls with crowd ambiance!
 */

export function playCasterCall(type: string, text: string) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // 1. Create Stadium Crowd Noise effect
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05; // soft crowd noise
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter crowd noise
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.2;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start();
    whiteNoise.stop(ctx.currentTime + 2.5);

    // 2. Play Caster Horn / Stadium Chime Sound effect
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

    oscGain.gain.setValueAtTime(0.12, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // 3. Speech Synthesis for Caster Line with high hype pitch & rate
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel previous
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Customize voice profile based on caster style
      if (type.includes('ceeb') || type.includes('echoslam')) {
        utterance.pitch = 1.3;
        utterance.rate = 1.1;
      } else if (type.includes('dingding') || type.includes('lakad')) {
        utterance.pitch = 1.4;
        utterance.rate = 1.2;
      } else if (type.includes('disastah') || type.includes('fountainhook')) {
        utterance.pitch = 1.2;
        utterance.rate = 1.15;
      } else {
        utterance.pitch = 1.1;
        utterance.rate = 1.05;
      }

      utterance.volume = 1.0;

      // Try to find an English voice
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.startsWith('en'));
      if (engVoice) utterance.voice = engVoice;

      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn("Web Audio API not supported or blocked by user gesture", err);
  }
}
