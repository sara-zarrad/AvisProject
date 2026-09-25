import React, { useState } from 'react';
import { Star } from 'lucide-react';

const LABELS = {
  1: '1/5 - Décevant',
  2: '2/5 - Moyen',
  3: '3/5 - Bon',
  4: '4/5 - Très bon',
  5: '5/5 - Exceptionnel ! ⚡',
};

export const RatingInput = ({ value = 0, onChange, error }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const activeRating = hoverValue || value;

  return (
    <div className="rating-input-container">
      <div className="flex items-center gap-1.5" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              type="button"
              key={star}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverValue(star)}
              onMouseLeave={() => setHoverValue(0)}
              className="rating-star-btn"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                transition: 'transform 0.15s ease, filter 0.15s ease',
                transform: hoverValue === star ? 'scale(1.2)' : 'scale(1)',
                outline: 'none',
              }}
              aria-label={`Attribuer la note de ${star} sur 5`}
            >
              <Star
                size={30}
                strokeWidth={1.5}
                color={isFilled ? '#fbbf24' : '#475569'}
                fill={isFilled ? '#fbbf24' : 'transparent'}
                style={{
                  filter: isFilled ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            </button>
          );
        })}

        <span
          style={{
            marginLeft: '0.75rem',
            fontSize: '0.88rem',
            fontWeight: '600',
            color: activeRating > 0 ? '#fbbf24' : 'var(--text-muted)',
            minWidth: '150px',
          }}
        >
          {LABELS[activeRating] || 'Sélectionnez une note'}
        </span>
      </div>

      {error && <div className="form-error">{error}</div>}
    </div>
  );
};

export default RatingInput;
