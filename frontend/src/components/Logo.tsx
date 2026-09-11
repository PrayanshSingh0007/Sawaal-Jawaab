/**
 * The mark: a question, and an answer coming back. Two shapes, one accent.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sj-mark" x1="4" y1="2" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8764A" />
          <stop offset="0.55" stopColor="#F2622E" />
          <stop offset="1" stopColor="#C74A1C" />
        </linearGradient>
        <filter id="sj-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2.2" stdDeviation="2.4" floodColor="#786860" floodOpacity="0.32" />
        </filter>
      </defs>
      {/* the reply, sitting behind */}
      <path
        d="M18.5 14h12A5.5 5.5 0 0 1 36 19.5v6a5.5 5.5 0 0 1-5.5 5.5h-2.2l.1 5.2-5.6-5.2h-4.3A5.5 5.5 0 0 1 13 25.5v-6a5.5 5.5 0 0 1 5.5-5.5Z"
        fill="var(--surface)"
        filter="url(#sj-soft)"
      />
      <circle cx="24.5" cy="22.5" r="2.1" fill="var(--accent)" />
      {/* the question, in front */}
      <path
        d="M8 2h11.5A6 6 0 0 1 25.5 8v6.5a6 6 0 0 1-6 6h-5.4L7.4 26.4l.1-5.9H8a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z"
        fill="url(#sj-mark)"
      />
      <path
        d="M10.4 9.2c0-1.9 1.5-3.2 3.5-3.2s3.4 1.2 3.4 3c0 1.5-.8 2.3-2.1 3-.9.5-1.3.9-1.3 1.7v.4"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="13.9" cy="17.1" r="1.35" fill="#fff" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="wordmark">
      Sawaal <em>Jawaab</em>
    </span>
  )
}

/**
 * Welcome illustration: a question card, and an answer coming back to it.
 * Built from the same ceramic surfaces as the rest of the interface, so it
 * belongs to the product rather than sitting on top of it.
 */
export function WelcomeArt() {
  return (
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sj-card" x1="40" y1="20" x2="200" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFEFC" />
          <stop offset="1" stopColor="#F1EEE9" />
        </linearGradient>
        <linearGradient id="sj-hot" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F8764A" />
          <stop offset="1" stopColor="#C74A1C" />
        </linearGradient>
        <filter id="sj-drop" x="-30%" y="-30%" width="170%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#786860" floodOpacity="0.28" />
        </filter>
        <filter id="sj-drop-sm" x="-40%" y="-40%" width="190%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#786860" floodOpacity="0.24" />
        </filter>
      </defs>

      {/* the arc: a question travelling out and an answer coming back */}
      <path
        d="M78 150c26 34 118 34 146-6"
        stroke="var(--accent)"
        strokeOpacity="0.4"
        strokeWidth="2"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />

      {/* answer card, behind */}
      <g filter="url(#sj-drop-sm)" style={{ transformOrigin: '230px 70px', animation: 'float-b 7s ease-in-out infinite' }}>
        <rect x="182" y="26" width="104" height="80" rx="22" fill="url(#sj-card)" />
        <rect x="200" y="48" width="52" height="8" rx="4" fill="#DCD6CE" />
        <rect x="200" y="64" width="68" height="8" rx="4" fill="#E6E2DC" />
        <circle cx="206" cy="88" r="7" fill="var(--accent-soft)" />
        <path d="M203 88.2l2.2 2.2 4-4.4" stroke="var(--accent-deep)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* question card, in front */}
      <g filter="url(#sj-drop)" style={{ transformOrigin: '96px 100px', animation: 'float-a 6s ease-in-out infinite' }}>
        <rect x="18" y="52" width="150" height="112" rx="28" fill="url(#sj-card)" />
        <rect x="40" y="80" width="94" height="11" rx="5.5" fill="#CFC8BF" />
        <rect x="40" y="99" width="70" height="11" rx="5.5" fill="#DED9D1" />
        <rect x="40" y="122" width="58" height="26" rx="13" fill="url(#sj-hot)" />
        <path d="M52 135h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M61 130.5l4.5 4.5-4.5 4.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
