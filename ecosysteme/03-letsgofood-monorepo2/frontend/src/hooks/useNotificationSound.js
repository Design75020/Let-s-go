import { useCallback, useRef, useState } from "react";

// Generates notification sounds + vibration using Web Audio API & Navigator.vibrate
export function useNotificationSound() {
  const audioContextRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("foodrush_sound_enabled");
    return saved !== "false";
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem("foodrush_vibration_enabled");
    return saved !== "false";
  });

  const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;

  const vibrate = useCallback((pattern) => {
    if (!vibrationEnabled || !canVibrate) return;
    try { navigator.vibrate(pattern); } catch { /* noop */ }
  }, [vibrationEnabled, canVibrate]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playChime = useCallback(() => {
    vibrate([100, 50, 100]); // short-pause-short
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } catch { /* noop */ }
  }, [soundEnabled, vibrate, getAudioContext]);

  const playUrgent = useCallback(() => {
    vibrate([200, 100, 200, 100, 400]); // long pulse pattern for urgency
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      [0, 0.3].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
        osc.start(now + delay);
        osc.stop(now + delay + 0.25);
      });
    } catch { /* noop */ }
  }, [soundEnabled, vibrate, getAudioContext]);

  const playSuccess = useCallback(() => {
    vibrate([50, 30, 50]); // gentle double tap
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch { /* noop */ }
  }, [soundEnabled, vibrate, getAudioContext]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("foodrush_sound_enabled", String(next));
      if (next) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = ctx;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          osc.frequency.value = 660;
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch { /* noop */ }
      }
      return next;
    });
  }, []);

  const toggleVibration = useCallback(() => {
    setVibrationEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("foodrush_vibration_enabled", String(next));
      if (next && canVibrate) {
        try { navigator.vibrate([50, 30, 50]); } catch { /* noop */ }
      }
      return next;
    });
  }, [canVibrate]);

  return { playChime, playUrgent, playSuccess, soundEnabled, toggleSound, vibrationEnabled, toggleVibration, canVibrate };
}
