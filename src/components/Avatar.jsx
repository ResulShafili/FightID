import React, { useId } from "react";

const PLACEHOLDER_MARKERS = ["thispersondoesnotexist.com", "fighter-portrait.png", "fightid-logo"];

export function hasRealPhoto(url) {
  return Boolean(url) && !PLACEHOLDER_MARKERS.some((marker) => url.includes(marker));
}

export function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "FB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTE = [
  ["#e5202d", "#6f0910"],
  ["#3b82f6", "#0b2a4a"],
  ["#f3b433", "#7a4a00"],
  ["#12b6a0", "#0a4a44"],
  ["#7c5cff", "#241670"],
  ["#f0653f", "#6f2110"],
  ["#e0457a", "#5a0f33"],
];

function paletteFor(name = "") {
  let hash = 0;
  const value = String(name);
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/**
 * Renders a real photo when one exists, otherwise a deterministic gradient
 * monogram. The monogram is SVG so it scales cleanly to any container size.
 */
export function Avatar({ name, photoUrl, className = "" }) {
  const id = useId().replace(/:/g, "");
  if (hasRealPhoto(photoUrl)) {
    return <img src={photoUrl} alt={name || ""} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  const [from, to] = paletteFor(name);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} role="img" aria-label={name || "Fighter"}>
      <defs>
        <linearGradient id={`av-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#av-${id})`} />
      <text x="50" y="50" dy="0.35em" textAnchor="middle" fontFamily="Oswald, Inter, sans-serif" fontSize="38" fontWeight="700" fill="rgba(255,255,255,0.92)" letterSpacing="1">
        {initialsFromName(name)}
      </text>
    </svg>
  );
}

export default Avatar;
