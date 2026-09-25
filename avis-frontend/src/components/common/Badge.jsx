import React from 'react';

export const Badge = ({ children, variant = 'cyan', icon: Icon, className = '' }) => {
  const getBadgeClass = () => {
    switch (variant) {
      case 'lime':
      case 'success':
        return 'badge-lime';
      case 'yellow':
      case 'warning':
        return 'badge-yellow';
      case 'purple':
        return 'badge-purple';
      case 'admin':
        return 'badge-role-admin';
      case 'member':
      case 'membre':
        return 'badge-role-member';
      case 'cyan':
      default:
        return 'badge-cyan';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default Badge;
