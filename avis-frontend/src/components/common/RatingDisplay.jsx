import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export const RatingDisplay = ({
  score = 0,
  count = null,
  size = 'md',
  showText = true,
  showScore = true,
}) => {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;
  
  const sizeMap = {
    sm: { starSize: 14, fontSize: '0.78rem', badgePadding: '0.15rem 0.4rem' },
    md: { starSize: 18, fontSize: '0.88rem', badgePadding: '0.2rem 0.55rem' },
    lg: { starSize: 24, fontSize: '1.1rem', badgePadding: '0.35rem 0.75rem' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((index) => {
          const isFull = numericScore >= index;
          const isHalf = !isFull && numericScore >= index - 0.75 && numericScore > index - 1;

          if (isHalf) {
            return (
              <StarHalf
                key={index}
                size={currentSize.starSize}
                color="#fbbf24"
                fill="#fbbf24"
                style={{ filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.4))' }}
              />
            );
          }

          return (
            <Star
              key={index}
              size={currentSize.starSize}
              color={isFull ? '#fbbf24' : '#334155'}
              fill={isFull ? '#fbbf24' : 'transparent'}
              style={{
                filter: isFull ? 'drop-shadow(0 0 5px rgba(251, 191, 36, 0.45))' : 'none',
              }}
            />
          );
        })}
      </div>

      {showScore && (
        <span
          style={{
            background: 'var(--electric-yellow-dim)',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '6px',
            padding: currentSize.badgePadding,
            fontSize: currentSize.fontSize,
            fontWeight: '700',
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {numericScore > 0 ? numericScore.toFixed(1) : 'Nouveau'}
        </span>
      )}

      {showText && count !== null && (
        <span
          style={{
            color: 'var(--text-dim)',
            fontSize: currentSize.fontSize,
            marginLeft: '0.1rem',
          }}
        >
          ({count} {count > 1 ? 'avis' : 'avis'})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
