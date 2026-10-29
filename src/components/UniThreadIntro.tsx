import React, { useEffect } from 'react';

interface UniThreadIntroProps { onComplete: () => void; }

const inkDrops = [
  { left: '36%', delay: '0ms', duration: '850ms' },
  { left: '43%', delay: '180ms', duration: '760ms' },
  { left: '51%', delay: '60ms', duration: '920ms' },
  { left: '59%', delay: '280ms', duration: '780ms' },
  { left: '66%', delay: '120ms', duration: '900ms' },
  { left: '39%', delay: '440ms', duration: '820ms' },
  { left: '56%', delay: '390ms', duration: '860ms' },
  { left: '63%', delay: '520ms', duration: '780ms' },
];

export const UniThreadIntro: React.FC<UniThreadIntroProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 5200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="unithread-intro fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#050506] text-white" aria-label="Uni Threads">
      <style>{`
        @keyframes ink-fall {
          0% { opacity: 0; transform: translate3d(0,-12vh,0) scale(.7); }
          8% { opacity: .95; }
          78% { opacity: 1; transform: translate3d(0,61vh,0) scale(1); }
          100% { opacity: 0; transform: translate3d(0,62vh,0) scale(.35); }
        }
        @keyframes ink-splash {
          0%, 72% { opacity: 0; transform: scale(.1,.3); }
          78% { opacity: .95; transform: scale(.65,.7); }
          100% { opacity: 0; transform: scale(1.8,.35); }
        }
        @keyframes splash-speck {
          0%, 72% { opacity: 0; transform: translate(0,0) scale(.2); }
          80% { opacity: .9; }
          100% { opacity: 0; transform: translate(var(--dx),var(--dy)) scale(.45); }
        }
        @keyframes signature-write {
          from { clip-path: inset(0 100% 0 0); opacity: .15; filter: blur(5px); }
          to { clip-path: inset(0 0 0 0); opacity: 1; filter: blur(0); }
        }
        @keyframes signature-glow {
          0%,100% { text-shadow: 0 0 0 rgba(255,255,255,0); }
          65% { text-shadow: 0 0 26px rgba(255,255,255,.22); }
        }
        .intro-drop {
          position: absolute; top: -12vh; width: 7px; height: 17px; border-radius: 60% 60% 65% 65%;
          background: radial-gradient(ellipse at 35% 25%, #fff 0 20%, #e7e7e7 48%, rgba(255,255,255,.3) 100%);
          filter: drop-shadow(0 0 7px rgba(255,255,255,.8));
          animation: ink-fall var(--duration) cubic-bezier(.4,0,.8,.45) var(--delay) both;
        }
        .intro-splash {
          position: absolute; left: var(--left); top: 50%; width: 36px; height: 12px; margin: -6px 0 0 -18px;
          border-radius: 50%; background: rgba(255,255,255,.94); filter: blur(1px);
          animation: ink-splash 1s ease-out var(--delay) both;
        }
        .intro-speck {
          position: absolute; left: var(--left); top: 50%; width: 4px; height: 4px; border-radius: 50%;
          background: white; box-shadow: 0 0 5px rgba(255,255,255,.8);
          animation: splash-speck .72s ease-out var(--delay) both;
        }
        .intro-signature {
          opacity: 0; clip-path: inset(0 100% 0 0);
          animation: signature-write 2.25s cubic-bezier(.3,.7,.2,1) 2.35s forwards, signature-glow 2.25s ease-in-out 2.35s forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .intro-drop,.intro-splash,.intro-speck,.intro-signature { animation-duration: .01ms !important; animation-delay: 0ms !important; }
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.035),transparent_55%)]" />
      {inkDrops.map((drop, index) => (
        <React.Fragment key={index}>
          <span className="intro-drop" style={{ left: drop.left, '--delay': drop.delay, '--duration': drop.duration } as React.CSSProperties} />
          <span className="intro-splash" style={{ '--left': drop.left, '--delay': `calc(${drop.delay} + ${drop.duration})` } as React.CSSProperties} />
          {[
            ['-20px', '-15px'], ['-11px', '-24px'], ['0px', '-19px'], ['13px', '-20px'],
            ['22px', '-9px'], ['-18px', '8px'], ['-4px', '12px'], ['12px', '9px'],
          ].map(([dx, dy], speckIndex) => (
            <span
              key={speckIndex}
              className="intro-speck"
              style={{ '--left': drop.left, '--delay': `calc(${drop.delay} + ${drop.duration})`, '--dx': dx, '--dy': dy } as React.CSSProperties}
            />
          ))}
        </React.Fragment>
      ))}
      <h1 className="intro-signature font-cursive relative z-10 px-4 text-center text-6xl sm:text-8xl font-bold tracking-wide">Uni Threads</h1>
    </main>
  );
};
