import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../utils/api';

const PomodoroContext = createContext(null);

const DURATIONS = {
  work: 25 * 60,
  break: 5 * 60,
};

const STORAGE_KEY = 'flashmaster:pomodoro:v1';
export const STUDY_TIME_RECORDED_EVENT = 'flashmaster:study-time-recorded';

const reportElapsedStudySeconds = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return;

  // Emit client-side event so Progress cards can update immediately.
  window.dispatchEvent(new CustomEvent(STUDY_TIME_RECORDED_EVENT, {
    detail: { seconds: Math.floor(seconds) },
  }));

  const minutes = Number((seconds / 60).toFixed(2));
  if (minutes <= 0) return;

  api.post('/progress/study-time', { minutes }).catch((err) => {
    console.error('Failed to sync study time:', err?.response?.status, err?.response?.data || err?.message);
  });
};

const readInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        mode: 'work',
        durationSec: DURATIONS.work,
        secondsLeft: DURATIONS.work,
        running: false,
        endAt: null,
        focusStartAtMs: null,
        transitionAt: null,
      };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid saved state');

    const savedMode = parsed.mode === 'break' ? 'break' : 'work';
    const savedDuration = DURATIONS[savedMode];
    const savedSeconds = Number.isFinite(parsed.secondsLeft)
      ? Math.max(0, Math.min(savedDuration, Math.floor(parsed.secondsLeft)))
      : savedDuration;
    const savedRunning = Boolean(parsed.running);
    const savedEndAt = Number.isFinite(parsed.endAt) ? parsed.endAt : null;
    const savedFocusStartAtMs = Number.isFinite(parsed.focusStartAtMs)
      ? Math.floor(parsed.focusStartAtMs)
      : null;

    if (!savedRunning || !savedEndAt) {
      return {
        mode: savedMode,
        durationSec: savedDuration,
        secondsLeft: savedSeconds,
        running: false,
        endAt: null,
        focusStartAtMs: null,
        transitionAt: null,
      };
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((savedEndAt - now) / 1000));

    return {
      mode: savedMode,
      durationSec: savedDuration,
      secondsLeft: remaining,
      running: true,
      endAt: savedEndAt,
      focusStartAtMs: savedMode === 'work' ? (savedFocusStartAtMs || now) : null,
      transitionAt: null,
    };
  } catch {
    return {
      mode: 'work',
      durationSec: DURATIONS.work,
      secondsLeft: DURATIONS.work,
      running: false,
      endAt: null,
      focusStartAtMs: null,
      transitionAt: null,
    };
  }
};

const playTimerSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    const toneA = audioContext.createOscillator();
    const toneB = audioContext.createOscillator();
    const gain = audioContext.createGain();

    toneA.type = 'sine';
    toneB.type = 'triangle';
    toneA.frequency.value = 880;
    toneB.frequency.value = 660;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    toneA.connect(gain);
    toneB.connect(gain);
    gain.connect(audioContext.destination);

    toneA.start(now);
    toneB.start(now + 0.08);
    toneA.stop(now + 0.45);
    toneB.stop(now + 0.45);

    setTimeout(() => {
      audioContext.close().catch(() => {});
    }, 700);
  } catch {
    // Ignore environments where audio context is not available.
  }
};

const notifySessionSwitch = (nextMode) => {
  const isBreak = nextMode === 'break';
  const title = isBreak ? 'Break time started' : 'Focus time started';
  const body = isBreak
    ? 'Great work. Take a 5-minute break now.'
    : 'Break is done. Time to get back to focus mode.';

  playTimerSound();

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
    } catch {
      // Ignore notification errors silently.
    }
  }
};

export const PomodoroProvider = ({ children }) => {
  const [pomodoro, setPomodoro] = useState(readInitialState);
  const handledTransitionRef = useRef(null);

  useEffect(() => {
    const { mode, secondsLeft, running, endAt, focusStartAtMs } = pomodoro;
    const safeSnapshot = {
      mode,
      secondsLeft,
      running,
      endAt,
      focusStartAtMs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSnapshot));
  }, [pomodoro]);

  useEffect(() => {
    if (!pomodoro.running) return undefined;

    const updateClock = () => {
      const now = Date.now();

      setPomodoro((prev) => {
        if (!prev.running || !prev.endAt) return prev;

        const remaining = Math.max(0, Math.ceil((prev.endAt - now) / 1000));

        if (remaining > 0) {
          if (remaining === prev.secondsLeft) return prev;
          return { ...prev, secondsLeft: remaining };
        }

        const nextMode = prev.mode === 'work' ? 'break' : 'work';
        const nextDuration = DURATIONS[nextMode];

        return {
          ...prev,
          mode: nextMode,
          durationSec: nextDuration,
          secondsLeft: nextDuration,
          running: true,
          endAt: now + nextDuration * 1000,
          focusStartAtMs: nextMode === 'work' ? now : null,
          transitionAt: now,
        };
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [pomodoro.running]);

  useEffect(() => {
    if (!pomodoro.transitionAt) return;
    if (handledTransitionRef.current === pomodoro.transitionAt) return;

    handledTransitionRef.current = pomodoro.transitionAt;

    if (pomodoro.mode === 'break') {
      // Entering break means one focus block was fully completed.
      reportElapsedStudySeconds(DURATIONS.work);
    }

    notifySessionSwitch(pomodoro.mode);
  }, [pomodoro.transitionAt, pomodoro.mode]);

  const start = () => {
    setPomodoro((prev) => {
      if (prev.running) return prev;

      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }

      return {
        ...prev,
        running: true,
        endAt: Date.now() + prev.secondsLeft * 1000,
        focusStartAtMs: prev.mode === 'work' ? Date.now() : null,
      };
    });
  };

  const pause = () => {
    if (!pomodoro.running || !pomodoro.endAt) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((pomodoro.endAt - now) / 1000));
    const studiedSeconds = pomodoro.mode === 'work' && pomodoro.focusStartAtMs
      ? Math.max(0, Math.floor((now - pomodoro.focusStartAtMs) / 1000))
      : 0;

    setPomodoro((prev) => {
      if (!prev.running || !prev.endAt) return prev;

      return {
        ...prev,
        running: false,
        secondsLeft: remaining,
        endAt: null,
        focusStartAtMs: null,
      };
    });

    if (studiedSeconds > 0) {
      reportElapsedStudySeconds(studiedSeconds);
    }
  };

  const toggle = () => {
    if (pomodoro.running) pause();
    else start();
  };

  const setMode = (mode) => {
    const nextMode = mode === 'break' ? 'break' : 'work';
    const nextDuration = DURATIONS[nextMode];
    const studiedSeconds = pomodoro.running && pomodoro.mode === 'work' && pomodoro.focusStartAtMs
      ? Math.max(0, Math.floor((Date.now() - pomodoro.focusStartAtMs) / 1000))
      : 0;

    setPomodoro((prev) => ({
      ...prev,
      mode: nextMode,
      durationSec: nextDuration,
      secondsLeft: nextDuration,
      running: false,
      endAt: null,
      focusStartAtMs: null,
    }));

    if (studiedSeconds > 0) {
      reportElapsedStudySeconds(studiedSeconds);
    }
  };

  const value = {
    mode: pomodoro.mode,
    secondsLeft: pomodoro.secondsLeft,
    durationSec: pomodoro.durationSec,
    running: pomodoro.running,
    currentFocusElapsedSec: pomodoro.running && pomodoro.mode === 'work' && pomodoro.focusStartAtMs
      ? Math.max(0, Math.floor((Date.now() - pomodoro.focusStartAtMs) / 1000))
      : 0,
    start,
    pause,
    toggle,
    setMode,
  };

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within PomodoroProvider');
  }
  return context;
};
