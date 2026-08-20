"use client";

import { motion } from "framer-motion";
import { SIGN_META, ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/astro/signs";
import type { SignId } from "@/lib/astro/types";

interface SignBadgeProps {
  signId: SignId;
  role: string;        // "Sun", "Moon", "Rising"
  roleLabel?: string;  // plain-English tag like "Core Self", "Emotions"
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export function SignBadge({ signId, role, roleLabel, subtitle, size = "md" }: SignBadgeProps) {
  const meta = SIGN_META[signId];
  const color = ELEMENT_COLORS[meta.element];

  const sizeMap = {
    sm: { box: "w-16 h-16", glyph: "text-2xl" },
    md: { box: "w-20 h-20", glyph: "text-3xl" },
    lg: { box: "w-28 h-28", glyph: "text-5xl" },
  };
  const s = sizeMap[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-3 text-center"
    >
      <div className="space-y-1">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">
          {role}
        </div>
        {roleLabel && (
          <div className="text-[10px] text-amber-200/80 font-medium">
            {roleLabel}
          </div>
        )}
      </div>
      <div
        className={`${s.box} relative rounded-full flex items-center justify-center`}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}33, transparent 70%), rgba(255,255,255,0.04)`,
          border: `1px solid ${color}55`,
          boxShadow: `0 0 28px ${color}22, inset 0 0 18px ${color}1a`,
        }}
      >
        <span className={`${s.glyph} font-serif`} style={{ color }}>
          {meta.glyph}
        </span>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${color}22 60deg, transparent 120deg, ${color}22 240deg, transparent 300deg)`,
            animation: "rotate 18s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes rotate { to { transform: rotate(360deg); } }
        `}</style>
      </div>
      <div>
        <div className="text-lg font-semibold text-white">{meta.name}</div>
        <div className="text-xs text-white/50">
          {subtitle || `${ELEMENT_LABELS[meta.element]} · ${meta.modality}`}
        </div>
      </div>
    </motion.div>
  );
}
