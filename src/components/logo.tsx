import { Zap } from "lucide-react";

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
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="docGrad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#e8eaed" />
            <stop offset="100%" stopColor="#c8ccd4" />
          </linearGradient>
          <linearGradient id="arrowGrad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        <rect
          x="10"
          y="4"
          width="24"
          height="36"
          rx="5"
          fill="url(#docGrad)"
        />
        <rect
          x="10"
          y="4"
          width="24"
          height="36"
          rx="5"
          stroke="#ffffff"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <path
          d="M10 22h24"
          stroke="#9aa3af"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 15h12"
          stroke="#9aa3af"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <path
          d="M34 16l6 6-6 6"
          stroke="url(#arrowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M38 22H12"
          stroke="url(#arrowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M26 42h6"
          stroke="url(#arrowGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      <span className="absolute bottom-0 right-0 flex items-center justify-center">
        <Zap size={size * 0.28} className="text-primary" fill="currentColor" />
      </span>
    </div>
  );
}
