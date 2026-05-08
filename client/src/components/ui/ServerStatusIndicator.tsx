import { useState, useRef, useEffect } from "react";
import { useServerStatus, type ServerStatus } from "../../hooks/useServerStatus";

// ─── config per status ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ServerStatus,
  { label: string; color: string; bg: string; ringColor: string; animation: string }
> = {
  online: {
    label: "Online",
    color: "text-emerald-400",
    bg: "bg-emerald-500",
    ringColor: "bg-emerald-500/30",
    animation: "animate-ping",           // pulse ring
  },
  connecting: {
    label: "Connecting",
    color: "text-amber-400",
    bg: "bg-amber-400",
    ringColor: "",
    animation: "animate-spin",           // spinner handled separately
  },
  offline: {
    label: "Offline",
    color: "text-red-400",
    bg: "bg-red-500",
    ringColor: "",
    animation: "animate-pulse",          // blink
  },
};

// ─── tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({
  latency,
  lastChecked,
  retryCount,
  status,
}: {
  latency: number | null;
  lastChecked: Date | null;
  retryCount: number;
  status: ServerStatus;
}) {
  const time = lastChecked
    ? lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-gray-900 border border-gray-700 text-xs text-gray-200 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
        <p className="font-semibold mb-1">Server Status</p>
        <p>
          Status:{" "}
          <span
            className={
              status === "online"
                ? "text-emerald-400"
                : status === "connecting"
                ? "text-amber-400"
                : "text-red-400"
            }
          >
            {STATUS_CONFIG[status].label}
          </span>
        </p>
        {latency !== null && <p>Latency: <span className="text-blue-300">{latency} ms</span></p>}
        {retryCount > 0 && <p>Retries: <span className="text-orange-300">{retryCount}</span></p>}
        <p className="text-gray-500 mt-1">Checked: {time}</p>
        {/* tooltip arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
      </div>
    </div>
  );
}

// ─── dot / spinner ────────────────────────────────────────────────────────────
function StatusDot({ status, cfg }: { status: ServerStatus; cfg: typeof STATUS_CONFIG[ServerStatus] }) {
  if (status === "connecting") {
    return (
      <span className="relative flex h-3 w-3">
        {/* spinning ring */}
        <span className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        {/* small center dot */}
        <span className="absolute inset-[3px] rounded-full bg-amber-400 opacity-60" />
      </span>
    );
  }

  if (status === "offline") {
    return (
      <span className="relative flex h-3 w-3">
        <span className={`absolute inset-0 rounded-full ${cfg.bg} animate-pulse`} />
      </span>
    );
  }

  // online — ping ring + solid dot
  return (
    <span className="relative flex h-3 w-3">
      <span className={`absolute inset-0 rounded-full ${cfg.bg} ${cfg.animation} opacity-75`} />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${cfg.bg}`} />
    </span>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
interface ServerStatusIndicatorProps {
  /** Show latency badge next to label when online */
  showLatency?: boolean;
  /** Hide text label (icon only) */
  compact?: boolean;
  /** Extra Tailwind classes on wrapper */
  className?: string;
}

export default function ServerStatusIndicator({
  showLatency = true,
  compact = false,
  className = "",
}: ServerStatusIndicatorProps) {
  const { status, latency, lastChecked, retryCount } = useServerStatus();
  const cfg = STATUS_CONFIG[status];

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [prevStatus, setPrevStatus]         = useState<ServerStatus>(status);
  const [flash, setFlash]                   = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Flash the pill on status change
  useEffect(() => {
    if (prevStatus !== status) {
      setPrevStatus(status);
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [status, prevStatus]);

  const showTip = () => {
    clearTimeout(hideTimer.current);
    setTooltipVisible(true);
  };
  const hideTip = () => {
    hideTimer.current = setTimeout(() => setTooltipVisible(false), 120);
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
      onFocus={showTip}
      onBlur={hideTip}
      role="status"
      aria-label={`Server is ${cfg.label}`}
      tabIndex={0}
    >
      {/* pill */}
      <div
        className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-full
          bg-gray-800/80 border border-gray-700/60
          backdrop-blur-sm cursor-default select-none
          transition-all duration-300
          ${flash ? "scale-110" : "scale-100"}
        `}
      >
        <StatusDot status={status} cfg={cfg} />

        {!compact && (
          <span className={`text-xs font-medium leading-none ${cfg.color} transition-colors duration-300`}>
            {cfg.label}
          </span>
        )}

        {showLatency && status === "online" && latency !== null && (
          <span className="text-[10px] font-mono text-gray-500 leading-none">{latency}ms</span>
        )}
      </div>

      {/* tooltip */}
      {tooltipVisible && (
        <Tooltip
          status={status}
          latency={latency}
          lastChecked={lastChecked}
          retryCount={retryCount}
        />
      )}
    </div>
  );
}