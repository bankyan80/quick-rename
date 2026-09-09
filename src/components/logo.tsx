export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
      aria-label="Quick Rename logo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logoquickrename.png"
        alt="Quick Rename"
        width={size}
        height={size}
        className="object-contain"
        draggable={false}
      />
    </div>
  );
}