'use client';
import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Generates notification sounds + vibration using Web Audio API & Navigator.vibrate
 * Includes a persistent alarm that repeats every 30s until the order is accepted.
 */
export function useNotificationSound() {
  const audioContextRef = useRef(null);
  const persistentAlarmRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('foodrush_sound_enabled');
    return saved !== 'false';
  });

  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('foodrush_vibration_enabled');
    return saved !== 'false';
  });

  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = useCallback((pattern) => {
    if (!vibrationEnabled || !canVibrate) return;
    try { navigator.vibrate(pattern); } catch { /* noop */ }
  }, [vibrationEnabled, canVibrate]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  /** Soft chime — for general updates */
  const playChime = useCallback(() => {
    vibrate([100, 50, 100]);
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
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } catch { /* noop */ }
  }, [soundEnabled, vibrate, getAudioContext]);

  /** Urgent alarm — for new orders */
  const playUrgent = useCallback(() => {
    vibrate([200, 100, 200, 100, 400]);
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      [0, 0.3, 0.6].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.25, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
        osc.start(now + delay);
        osc.stop(now + delay + 0.3);
      });
    } catch { /* noop */ }
  }, [soundEnabled, vibrate, getAudioContext]);

  /** Success sound — for order accepted/completed */
  const playSuccess = useCallback(() => {
    vibrate([50, 30, 50]);
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch { /* noop */ }
  }, [soundEnabled, vibrate, getAudioContext]);

  /**
   * Start a persistent alarm that repeats every 30 seconds.
   * Call stopPersistentAlarm() when the order is accepted.
   * @param {string} orderId - used to avoid duplicate alarms
   */
  const startPersistentAlarm = useCallback((orderId) => {
    // Avoid duplicate alarms for the same order
    if (persistentAlarmRef.current?.orderId === orderId) return;
    // Clear any previous alarm
    if (persistentAlarmRef.current?.interval) {
      clearInterval(persistentAlarmRef.current.interval);
    }
    // Play immediately
    playUrgent();
    // Then repeat every 30 seconds
    const interval = setInterval(() => {
      playUrgent();
    }, 30000);
    persistentAlarmRef.current = { orderId, interval };
  }, [playUrgent]);

  /**
   * Stop the persistent alarm (call when order is accepted or cancelled)
   */
  const stopPersistentAlarm = useCallback(() => {
    if (persistentAlarmRef.current?.interval) {
      clearInterval(persistentAlarmRef.current.interval);
      persistentAlarmRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (persistentAlarmRef.current?.interval) {
        clearInterval(persistentAlarmRef.current.interval);
      }
    };
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('foodrush_sound_enabled', String(next));
      return next;
    });
  }, []);

  const toggleVibration = useCallback(() => {
    setVibrationEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('foodrush_vibration_enabled', String(next));
      return next;
    });
  }, []);

  return {
    playChime,
    playUrgent,
    playSuccess,
    startPersistentAlarm,
    stopPersistentAlarm,
    soundEnabled,
    toggleSound,
    vibrationEnabled,
    toggleVibration,
    canVibrate,
  };
}
