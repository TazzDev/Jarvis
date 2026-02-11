import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    electron?: {
      onWakeWord: (cb: () => void) => (() => void) | undefined;
      setWakeWordEnabled: (enabled: boolean) => void;
      getWakeWordState: () => Promise<{ enabled: boolean; available: boolean }>;
    };
  }
}

export interface WakeWordState {
  enabled: boolean;
  available: boolean;
}

/**
 * Subscribe to wake-word detection and optionally get/set enabled state.
 * Only runs in Electron (window.electron); no-op in browser.
 */
export function useWakeWord(onDetected: () => void) {
  const [state, setState] = useState<WakeWordState>({ enabled: false, available: false });
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  useEffect(() => {
    const api = window.electron;
    if (!api) return;

    api.getWakeWordState().then(setState).catch(() => setState({ enabled: false, available: false }));

    const handler = () => {
      console.log("[Wake word flow] 2. useWakeWord: wake word received, invoking callback");
      onDetectedRef.current();
    };

    // Listen for CustomEvent dispatched from main via executeJavaScript (reliable when IPC doesn't reach preload)
    window.addEventListener("wake-word-detected", handler);

    const unsubscribe = api.onWakeWord(handler);

    return () => {
      window.removeEventListener("wake-word-detected", handler);
      unsubscribe?.();
    };
  }, []);

  const setEnabled = (enabled: boolean) => {
    const api = window.electron;
    if (!api) return;
    api.setWakeWordEnabled(enabled);
    api.getWakeWordState().then(setState).catch(() => setState({ enabled: false, available: false }));
  };

  return { state, setEnabled };
}
