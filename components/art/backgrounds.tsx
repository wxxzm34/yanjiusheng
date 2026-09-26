"use client";

import { useId } from "react";
import type { OutfitMotif } from "@/lib/packs";

export function BackgroundScene({
  motif,
  className = "",
}: {
  motif: OutfitMotif;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      aria-hidden="true"
    >
      {motif === "cool" && <CoolScene id={uid} />}
      {motif === "happy" && <HappyScene id={uid} />}
      {motif === "wild" && <WildScene id={uid} />}
    </svg>
  );
}

function CoolScene({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-cool`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e141c" />
          <stop offset="1" stopColor="#243140" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-cool)`} />
      <circle cx="300" cy="96" r="18" fill="#d7e1ec" />
      <circle cx="308" cy="90" r="16" fill="#0e141c" />
      <path d="M40 180h320M40 184h200" stroke="#8aa4bf" strokeWidth="1" opacity="0.7" />
      <rect x="48" y="420" width="36" height="160" fill="#1a2633" />
      <rect x="100" y="360" width="28" height="220" fill="#243140" />
      <rect x="148" y="470" width="48" height="110" fill="#1a2633" />
      <rect x="220" y="320" width="22" height="260" fill="#314356" />
      <rect x="260" y="400" width="40" height="180" fill="#1a2633" />
      <rect x="316" y="450" width="30" height="130" fill="#243140" />
    </g>
  );
}

function HappyScene({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-happy`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd7a8" />
          <stop offset="1" stopColor="#fff6e4" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-happy)`} />
      <circle cx="312" cy="110" r="36" fill="#ffd60a" />
      <ellipse cx="90" cy="140" rx="46" ry="18" fill="#fff" />
      <ellipse cx="124" cy="132" rx="28" ry="16" fill="#fff" />
      <ellipse cx="200" cy="180" rx="40" ry="14" fill="#fff" opacity="0.85" />
      <circle cx="70" cy="280" r="16" fill="#ff8fab" />
      <circle cx="96" cy="268" r="12" fill="#ffd60a" />
      <circle cx="118" cy="286" r="10" fill="#ffb703" />
      <path d="M0 520c70-50 130-20 200-46s120 10 200 24v302H0z" fill="#ffb703" opacity="0.35" />
      <path d="M0 590c80-36 150-8 220-24s110 16 180 8v226H0z" fill="#ff8c42" opacity="0.28" />
    </g>
  );
}

function WildScene({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wild`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#120014" />
          <stop offset="1" stopColor="#3b0764" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-wild)`} />
      <path d="M-10 120 L140 40 L120 160 Z" fill="#ff2bd6" />
      <path d="M260 80 L420 20 L390 180 Z" fill="#00f0ff" opacity="0.85" />
      <path d="M40 300 L200 240 L160 420 L20 380 Z" fill="#ffe600" />
      <path d="M220 340 L390 280 L360 520 L190 460 Z" fill="#39ff14" opacity="0.9" />
      <circle cx="80" cy="560" r="46" fill="#ff2bd6" />
      <circle cx="300" cy="620" r="70" fill="#00f0ff" />
      <circle cx="180" cy="700" r="36" fill="#ffe600" />
      <path d="M0 160 L80 200 L40 280 L140 240 L100 360" stroke="#fff" strokeWidth="6" fill="none" />
      <path d="M240 480 L320 420 L280 560 L380 500" stroke="#ff2bd6" strokeWidth="8" fill="none" />
    </g>
  );
}
