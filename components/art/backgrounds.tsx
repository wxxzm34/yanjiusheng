"use client";

import { useId } from "react";
import type { BackgroundMotif } from "@/lib/packs";

export function BackgroundScene({
  motif,
  className = "",
}: {
  motif: BackgroundMotif;
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
      {motif === "lamp" && <LampRoom id={uid} />}
      {motif === "balcony" && <Balcony id={uid} />}
      {motif === "rain" && <RainWindow id={uid} />}
      {motif === "sakura" && <SakuraRoad id={uid} />}
    </svg>
  );
}

function LampRoom({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc987" />
          <stop offset="0.62" stopColor="#ffe3c2" />
          <stop offset="1" stopColor="#f3c892" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-wall)`} />
      <rect x="36" y="70" width="120" height="90" rx="12" fill="#8ecae6" />
      <rect x="48" y="82" width="96" height="66" rx="8" fill="#fff6d8" />
      <circle cx="96" cy="108" r="14" fill="#ffe08a" />
      <path d="M36 160h120" stroke="#e7b07a" strokeWidth="8" />
      <rect x="250" y="120" width="92" height="70" rx="8" fill="#fffaf3" stroke="#e7b07a" strokeWidth="6" />
      <circle cx="278" cy="150" r="10" fill="#ff8fab" />
      <circle cx="306" cy="146" r="8" fill="#ffd166" />
      <path d="M0 560h400l-20 240H20z" fill="#e7b98a" />
      <ellipse cx="180" cy="640" rx="90" ry="26" fill="#ef6f4d" opacity="0.85" />
      <ellipse cx="180" cy="640" rx="54" ry="14" fill="#ffd166" />
      <rect x="292" y="250" width="10" height="210" rx="5" fill="#8d6a4a" />
      <path d="M250 250h96l-12 46H262z" fill="#ffb703" />
      <path d="M262 296h72l-8 18h-56z" fill="#ffe08a" />
      <circle cx="298" cy="250" r="46" fill="#ffd166" opacity="0.35" />
      <rect x="48" y="470" width="36" height="14" rx="3" fill="#6d4c41" />
      <rect x="54" y="456" width="28" height="14" rx="3" fill="#2a9d8f" />
      <rect x="60" y="444" width="22" height="12" rx="3" fill="#e76f51" />
    </g>
  );
}

function Balcony({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ec8e3" />
          <stop offset="0.55" stopColor="#c8f0ff" />
          <stop offset="1" stopColor="#fff3c4" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-sky)`} />
      <circle cx="320" cy="110" r="36" fill="#ffd166" />
      <ellipse cx="90" cy="120" rx="46" ry="18" fill="#fff" opacity="0.9" />
      <ellipse cx="120" cy="112" rx="28" ry="16" fill="#fff" />
      <ellipse cx="210" cy="160" rx="40" ry="14" fill="#fff" opacity="0.8" />
      <path d="M0 430c40-40 80-20 120-36s80 10 140-20 90-10 140 16v410H0z" fill="#95d5b2" />
      <path d="M0 500c60-30 100-10 160-28s90 16 140-8 70 0 100 20v316H0z" fill="#74c69d" />
      <rect x="28" y="168" width="16" height="16" rx="3" fill="#fff" />
      <path d="M20 184h150" stroke="#f4a261" strokeWidth="4" />
      <path d="M36 184v70" stroke="#f4a261" strokeWidth="3" />
      <rect x="40" y="196" width="70" height="52" rx="6" fill="#ff8fab" />
      <path d="M40 214h70M40 230h70" stroke="#fff" strokeWidth="4" />
      <rect x="300" y="360" width="28" height="36" rx="6" fill="#e76f51" />
      <ellipse cx="314" cy="348" rx="26" ry="16" fill="#2d6a4f" />
      <rect x="0" y="470" width="400" height="14" rx="4" fill="#f8f1e3" />
      <g stroke="#f8f1e3" strokeWidth="8">
        <path d="M30 484v90M80 484v90M130 484v90M180 484v90M230 484v90M280 484v90M330 484v90" />
      </g>
      <rect x="0" y="560" width="400" height="240" fill="#f6e7c1" />
    </g>
  );
}

function RainWindow({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14213d" />
          <stop offset="1" stopColor="#1b3a4b" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-night)`} />
      <circle cx="300" cy="90" r="18" fill="#f1faee" opacity="0.85" />
      <circle cx="60" cy="70" r="2" fill="#fff" />
      <circle cx="120" cy="110" r="1.5" fill="#fff" />
      <circle cx="240" cy="60" r="1.6" fill="#fff" />
      <rect x="70" y="150" width="260" height="300" rx="16" fill="#0d1b2a" />
      <rect x="86" y="166" width="108" height="124" fill="#1b3a4b" />
      <rect x="206" y="166" width="108" height="124" fill="#1b3a4b" />
      <rect x="86" y="302" width="108" height="124" fill="#243e55" />
      <rect x="206" y="302" width="108" height="124" fill="#243e55" />
      <rect x="214" y="314" width="70" height="48" rx="6" fill="#f4a261" opacity="0.85" />
      <rect x="70" y="450" width="260" height="16" rx="4" fill="#d8c3a5" />
      {Array.from({ length: 14 }).map((_, index) => (
        <rect
          key={index}
          className="rain-drop"
          x={30 + (index % 7) * 52}
          y={40 + (index % 4) * 30}
          width="3"
          height="18"
          rx="1.5"
          fill="#caf0f8"
          opacity="0.7"
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
      <rect x="0" y="560" width="400" height="240" fill="#1d2d44" />
      <rect x="48" y="600" width="64" height="18" rx="6" fill="#e9c46a" opacity="0.8" />
    </g>
  );
}

function SakuraRoad({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-pink`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffc2d4" />
          <stop offset="0.5" stopColor="#ffe5ec" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill={`url(#${id}-pink)`} />
      <circle cx="330" cy="100" r="28" fill="#fff1f2" />
      <rect x="48" y="250" width="18" height="220" rx="8" fill="#6d4c41" />
      <circle cx="40" cy="230" r="36" fill="#ff8fab" />
      <circle cx="78" cy="210" r="30" fill="#ffb3c6" />
      <circle cx="70" cy="250" r="28" fill="#fb6f92" />
      <path d="M80 520l120 280h-80z" fill="#f7cad0" />
      <path d="M200 560l90 240h-70z" fill="#e8a0bf" />
      <rect x="250" y="300" width="10" height="150" fill="#6d4c41" />
      <circle cx="255" cy="292" r="16" fill="#ffd166" opacity="0.9" />
      {[[120, 180], [180, 140], [240, 200], [300, 240], [160, 320], [90, 360]].map(([x, y], index) => (
        <ellipse
          key={index}
          className="petal"
          cx={x}
          cy={y}
          rx="7"
          ry="4"
          fill="#ff8fab"
          style={{ animationDelay: `${index * 0.4}s` }}
        />
      ))}
      <rect x="0" y="620" width="400" height="180" fill="#f8edeb" />
    </g>
  );
}
