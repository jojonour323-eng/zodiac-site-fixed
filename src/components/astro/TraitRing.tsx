"use client";

import { motion } from "framer-motion";

interface TraitRingProps {
  label: string;
  value: number;       // 0-100
  size?: number;       // px
  stroke?: number;     // px
  hue?: number;        // base hue for the ring
  delay?: number;      // animation delay (s)
}

/**
 * Animated circular progress ring (like a progress ring / donut).
 * Pure SVG + Framer Motion. No external chart lib needed.
 */
export function TraitRing({
  label,
  value,
  size = 130,
  stroke = 10,
  hue = 265,
  delay = 0,
}: TraitRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c * (1 - pct / 100);

  // Color follows the score: red (0-39), yellow/orange (40-69), green (70-100).
  // The `hue` prop is ignored — the color is driven entirely by the score band.
  const scoreColor = (v: number) => {
    if (v >= 70) return { hue: 140, label: "strong" };   // green
    if (v >= 40) return { hue: 45, label: "medium" };    // yellow/orange
    return { hue: 0, label: "weak" };                    // red
  };
  const { hue: scoreHue, label: scoreLabel } = scoreColor(pct);
  const colorFrom = `hsl(${scoreHue}, 75%, 55%)`;
  const colorTo = `hsl(${(scoreHue + 15) % 360}, 80%, 60%)`;
  const trackColor = "rgba(255,255,255,0.08)";
  const gradId = `grad-${label.replace(/\s+/g, "-").toLowerCase()}-${scoreLabel}`;

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{ width: size }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={trackColor}
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-semibold tabular-nums"
            style={{ color: colorFrom }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.4 }}
          >
            {Math.round(pct)}
          </motion.span>
          <span className="text-[10px] uppercase tracking-wider text-white/50">
            / 100
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-white/80 text-center">
        {label}
      </span>
    </div>
  );
}
