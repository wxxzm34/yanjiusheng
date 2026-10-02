import type { DrinkType } from "@/lib/types";
import type { Skin } from "@/lib/packs";

export function HeroFigure({
  skin,
  firing = false,
  className = "",
}: {
  skin: Skin;
  firing?: boolean;
  className?: string;
}) {
  const bob = firing ? "gag-hero" : "idle-bob";
  return (
    <svg viewBox="0 0 170 190" className={`h-40 w-36 ${bob} ${className}`} aria-hidden="true">
      <ellipse cx="84" cy="176" rx="36" ry="8" fill="#000" opacity="0.12" />
      <path d="M64 118 C36 132 28 170 40 176 C52 156 66 146 80 142 Z" fill={skin.cape} />
      <rect x="58" y="112" width="54" height="46" rx="18" fill={skin.heroBody} />
      <rect x="66" y="154" width="14" height="22" rx="7" fill={skin.heroBody} />
      <rect x="90" y="154" width="14" height="22" rx="7" fill={skin.heroBody} />
      <circle cx="73" cy="176" r="8" fill={skin.heroEmblem} />
      <circle cx="97" cy="176" r="8" fill={skin.heroEmblem} />
      <circle cx="86" cy="78" r="34" fill={skin.heroTrim} />
      <path d="M54 74c2-28 62-28 64 0" fill={skin.heroBody} />
      <polygon
        points="86,42 89,49 96,49 90,54 92,61 86,57 80,61 82,54 76,49 83,49"
        fill={skin.heroEmblem}
      />
      <circle cx="74" cy="82" r="4" fill="#1c2430" />
      <circle cx="98" cy="82" r="4" fill="#1c2430" />
      <circle cx="75.5" cy="80.5" r="1.4" fill="#fff" />
      <circle cx="99.5" cy="80.5" r="1.4" fill="#fff" />
      <path d="M74 94c6 6 16 6 22 0" stroke="#1c2430" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="66" cy="92" r="4" fill="#ff8fab" opacity="0.8" />
      <circle cx="106" cy="92" r="4" fill="#ff8fab" opacity="0.8" />
      <Arm firing={firing} skin={skin} />
    </svg>
  );
}

function Arm({ firing, skin }: { firing: boolean; skin: Skin }) {
  const d = firing ? "M108 124 C132 120 148 116 156 112" : "M108 128 C126 122 136 108 140 96";
  const hand = firing ? [156, 112] : [140, 96];
  return (
    <g>
      <path d={d} stroke={skin.heroBody} strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx={hand[0]} cy={hand[1]} r="7" fill={skin.heroTrim} />
      {firing && <circle cx={hand[0]} cy={hand[1]} r="4" fill={skin.laserCore} />}
    </g>
  );
}

export function UserFigure({
  hit = false,
  className = "",
}: {
  hit?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 150 190"
      className={`h-40 w-32 ${hit ? "gag-user" : "idle-bob"} ${className}`}
      aria-hidden="true"
    >
      <ellipse cx="78" cy="176" rx="32" ry="8" fill="#000" opacity="0.12" />
      <rect x="48" y="112" width="62" height="50" rx="20" fill="#ef8354" />
      <rect x="58" y="156" width="14" height="20" rx="7" fill="#3d2c29" />
      <rect x="86" y="156" width="14" height="20" rx="7" fill="#3d2c29" />
      <circle cx="65" cy="176" r="7" fill="#2b2118" />
      <circle cx="93" cy="176" r="7" fill="#2b2118" />
      <circle cx="78" cy="74" r="32" fill="#ffd8be" />
      <path d="M50 70c4-30 52-34 60-4c-8-12-20-16-30-14c-8 1-18 6-30 18z" fill="#3d2c29" />
      <circle cx="108" cy="62" r="8" fill="#3d2c29" />
      {hit ? (
        <g stroke="#2b2118" strokeWidth="2.4" strokeLinecap="round">
          <path d="M62 70l10 10M72 70l-10 10" />
          <path d="M90 70l10 10M100 70l-10 10" />
          <path d="M68 96h16" />
        </g>
      ) : (
        <g>
          <circle cx="66" cy="76" r="3.4" fill="#2b2118" />
          <circle cx="90" cy="76" r="3.4" fill="#2b2118" />
          <path d="M68 90c6 6 14 6 20 0" stroke="#2b2118" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="58" cy="86" r="4" fill="#ff8fab" opacity="0.75" />
          <circle cx="98" cy="86" r="4" fill="#ff8fab" opacity="0.75" />
        </g>
      )}
      {!hit && (
        <g>
          <rect x="104" y="126" width="22" height="28" rx="3" fill="#fffaf3" stroke="#2b2118" strokeWidth="2" />
          <path d="M108 134h14M108 140h14M108 146h10" stroke="#ff5a36" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}

export function LaserBeam({ skin }: { skin: Skin }) {
  return (
    <svg viewBox="0 0 120 48" className="gag-laser h-12 w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`beam-${skin.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={skin.laserCore} />
          <stop offset="1" stopColor={skin.laser} />
        </linearGradient>
      </defs>
      <rect x="4" y="18" width="100" height="12" rx="6" fill={`url(#beam-${skin.id})`} />
      <circle cx="104" cy="24" r="8" fill={skin.laserCore} />
      <circle cx="30" cy="10" r="3" fill={skin.heroEmblem} />
      <circle cx="62" cy="38" r="2.5" fill={skin.laserCore} />
      <circle cx="84" cy="8" r="2" fill="#fff" />
    </svg>
  );
}

export function DrinkProp({ type, label }: { type: DrinkType; label: string }) {
  if (type === "红酒") {
    return (
      <svg viewBox="0 0 120 140" className="swirl h-28 w-24" aria-hidden="true">
        <path d="M40 18h40l-8 48c-2 16-22 16-24 0z" fill="#7b2d3b" />
        <path d="M46 28h22l-2 16H50z" fill="#ff8fab" opacity="0.7" />
        <rect x="56" y="66" width="8" height="36" fill="#e7d7c1" />
        <rect x="44" y="100" width="32" height="6" rx="3" fill="#e7d7c1" />
        <circle cx="30" cy="40" r="8" fill="#9b2226" />
        <circle cx="92" cy="30" r="6" fill="#ae2012" />
      </svg>
    );
  }
  if (type === "白酒") {
    return (
      <svg viewBox="0 0 120 140" className="h-28 w-24" aria-hidden="true">
        <rect x="48" y="48" width="24" height="36" rx="6" fill="#f8f4e8" stroke="#d4c4a8" />
        <path d="M52 48c4-16 16-16 18 0" fill="#fff" />
        <path className="steam" d="M54 36c6-8 2-14 8-20" stroke="#fff" strokeWidth="3" fill="none" />
        <path className="steam" d="M70 34c4-8 0-12 6-18" stroke="#fff" strokeWidth="3" fill="none" style={{ animationDelay: "0.3s" }} />
      </svg>
    );
  }
  if (type === "啤酒") {
    return (
      <svg viewBox="0 0 120 140" className="h-28 w-24" aria-hidden="true">
        <rect x="36" y="48" width="44" height="62" rx="8" fill="#f4d35e" />
        <path d="M80 58h12c8 0 12 8 10 16s-8 14-16 12" fill="none" stroke="#f4d35e" strokeWidth="6" />
        <ellipse className="foam" cx="58" cy="46" rx="24" ry="12" fill="#fffaf0" />
        <circle cx="46" cy="40" r="6" fill="#fff" />
        <circle cx="64" cy="34" r="5" fill="#fff" />
      </svg>
    );
  }
  if (type === "家酿") {
    return (
      <svg viewBox="0 0 120 140" className="h-28 w-24" aria-hidden="true">
        <path d="M40 50h40l6 58H34z" fill="#c9e4ca" stroke="#52796f" strokeWidth="3" />
        <rect x="46" y="36" width="28" height="16" rx="4" fill="#52796f" />
        <circle className="steam" cx="52" cy="70" r="3" fill="#fff" />
        <circle className="steam" cx="66" cy="84" r="2.5" fill="#fff" style={{ animationDelay: "0.4s" }} />
        <circle className="steam" cx="58" cy="96" r="2" fill="#fff" style={{ animationDelay: "0.2s" }} />
      </svg>
    );
  }
  if (type === "黄酒") {
    return (
      <svg viewBox="0 0 120 140" className="h-28 w-24" aria-hidden="true">
        <path d="M38 58h36c2 20-2 40-6 48H46c-6-8-10-28-8-48z" fill="#d4a373" />
        <rect x="48" y="46" width="18" height="14" rx="4" fill="#bb9457" />
        <circle className="swirl" cx="92" cy="36" r="14" fill="#ffb703" opacity="0.9" />
        <rect x="90" y="48" width="4" height="28" fill="#6d4c41" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 140 140" className="h-28 w-28" aria-hidden="true">
      <rect x="48" y="40" width="36" height="48" rx="8" fill="#fff" stroke="#2b2118" strokeWidth="3" />
      <path d="M56 40c4-12 20-12 22 0" fill="#ffd6e0" />
      <text x="66" y="70" textAnchor="middle" fontSize="16" fill="#ff5a36">
        ?
      </text>
      <rect x="28" y="18" width="84" height="22" rx="8" fill="#fff3b0" stroke="#2b2118" />
      <text x="70" y="34" textAnchor="middle" fontSize="12" fill="#2b2118">
        {label.slice(0, 6)}
      </text>
    </svg>
  );
}
