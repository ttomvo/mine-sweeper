const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

const playTone = (freq, type, duration, vol = 0.1) => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
};

export const playClick = () => {
    // High pitched "bloop"
    playTone(800, 'sine', 0.1, 0.05);
};

export const playFlag = () => {
    // Soft "tick"
    playTone(600, 'triangle', 0.05, 0.05);
};

export const playExplosion = () => {
    const ctx = initAudio();
    const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);

    // Lowpass filter to make it sound more like an explosion and less like static
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
};

export const playWin = () => {
    // Victory fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; // C E G C G C
    const times = [0, 100, 200, 300, 450, 600];

    times.forEach((t, i) => {
        setTimeout(() => {
            playTone(notes[i], 'square', 0.2, 0.1);
        }, t);
    });
};
