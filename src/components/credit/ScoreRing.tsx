'use client';

import { useEffect, useState } from 'react';
import { getTierColor, type ScoreTier } from '@/lib/creditScoring';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  tier: ScoreTier;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
}

export default function ScoreRing({
  score,
  maxScore = 900,
  tier,
  size = 200,
  strokeWidth = 14,
  animated = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const offset = circumference - progress * circumference;
  const tierColor = getTierColor(tier);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, animated]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[#E5E5E5] dark:text-gray-700"
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tierColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: animated ? 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-black tabular-nums"
          style={{ color: tierColor }}
        >
          {displayScore}
        </span>
        <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider mt-0.5">
          out of {maxScore}
        </span>
      </div>
    </div>
  );
}
