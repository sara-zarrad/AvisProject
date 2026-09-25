import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ type = 'info', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      color: 'var(--electric-lime)',
      bg: 'var(--electric-lime-dim)',
      border: 'rgba(16, 185, 129, 0.4)',
    },
    error: {
      icon: XCircle,
      color: '#f43f5e',
      bg: 'var(--electric-rose-dim)',
      border: 'rgba(244, 63, 94, 0.4)',
    },
    warning: {
      icon: AlertTriangle,
      color: '#fbbf24',
      bg: 'var(--electric-yellow-dim)',
      border: 'rgba(251, 191, 36, 0.4)',
    },
    info: {
      icon: Info,
      color: 'var(--electric-cyan)',
      bg: 'var(--electric-cyan-dim)',
      border: 'rgba(0, 240, 255, 0.4)',
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.2rem',
        borderRadius: '12px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        backdropFilter: 'blur(10px)',
        color: 'var(--text-white)',
        fontSize: '0.9rem',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
        marginBottom: '1rem',
      }}
    >
      <Icon size={20} color={config.color} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Fermer l'alerte"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;
