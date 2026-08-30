"use client";

import { useEffect, useState } from "react";

interface Star {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

function generateStars(count: number): Star[] {
  const out: Star[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: `${Math.random() * 5}s`,
      duration: `${3 + Math.random() * 4}s`,
      opacity: 0.3 + Math.random() * 0.5,
    });
  }
  return out;
}

/**
 * Soft twinkling star-field used as the page background.
 * Pure CSS animations, no JS per-frame cost.
 *
 * Stars are generated client-side after mount (via the `mounted` flag)
 * to avoid SSR/CSR hydration mismatches from Math.random().
 */
export function StarField({ count = 60 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // One-time mount flag so we only generate random stars on the client,
    // avoiding SSR/CSR hydration mismatches. The lint rule flags this
    // pattern, but it is the React-recommended way to gate client-only work.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const stars = mounted ? generateStars(count) : [];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `twinkle ${s.duration} ease-in-out ${s.delay} infinite`,
            boxShadow: "0 0 6px rgba(255,255,255,0.6)",
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
