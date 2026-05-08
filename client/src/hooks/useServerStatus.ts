import { useState, useEffect, useRef, useCallback } from "react";

export type ServerStatus = "online" | "connecting" | "offline";

export interface ServerStatusState {
  status: ServerStatus;
  latency: number | null;   // ms
  lastChecked: Date | null;
  retryCount: number;
}

interface UseServerStatusOptions {
  /** Health-check URL. Defaults to VITE_API_BASE_URL + /health */
  url?: string;
  /** Polling interval in ms when online. Default: 30 000 */
  pollInterval?: number;
  /** Polling interval in ms when offline (faster retry). Default: 5 000 */
  retryInterval?: number;
  /** Number of consecutive failures before marking offline. Default: 2 */
  failureThreshold?: number;
  /** Request timeout in ms. Default: 5 000 */
  timeout?: number;
}

const DEFAULT_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)
    ? `${import.meta.env.VITE_API_BASE_URL}/health`
    : "http://localhost:4000/api/health";

export function useServerStatus(options: UseServerStatusOptions = {}): ServerStatusState {
  const {
    url = DEFAULT_URL,
    pollInterval = 30_000,
    retryInterval = 5_000,
    failureThreshold = 2,
    timeout = 5_000,
  } = options;

  const [state, setState] = useState<ServerStatusState>({
    status: "connecting",
    latency: null,
    lastChecked: null,
    retryCount: 0,
  });

  const failureCount  = useRef(0);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef      = useRef<AbortController | null>(null);
  const mountedRef    = useRef(true);

  const check = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const t0 = performance.now();

    try {
      const timeoutId = setTimeout(() => abortRef.current?.abort(), timeout);

      const res = await fetch(url, { method: "GET", signal, cache: "no-store" });
      clearTimeout(timeoutId);

      if (!mountedRef.current) return;

      const latency = Math.round(performance.now() - t0);

      if (res.ok) {
        failureCount.current = 0;
        setState({
          status: "online",
          latency,
          lastChecked: new Date(),
          retryCount: 0,
        });
        scheduleNext(pollInterval);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      if ((err as Error).name === "AbortError") return; // intentional abort

      failureCount.current += 1;

      if (failureCount.current >= failureThreshold) {
        setState(prev => ({
          status: "offline",
          latency: null,
          lastChecked: new Date(),
          retryCount: prev.retryCount + 1,
        }));
      } else {
        // First failure — stay "connecting" until threshold reached
        setState(prev => ({ ...prev, status: "connecting", lastChecked: new Date() }));
      }

      scheduleNext(retryInterval);
    }
  }, [url, pollInterval, retryInterval, failureThreshold, timeout]); // eslint-disable-line

  const scheduleNext = useCallback(
    (delay: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(check, delay);
    },
    [check]
  );

  // Kick off on mount + re-check immediately on tab focus
  useEffect(() => {
    mountedRef.current = true;
    check();

    const onFocus = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [check]);

  return state;
}