export function NoiseOverlay() {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-[1000] opacity-40">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}