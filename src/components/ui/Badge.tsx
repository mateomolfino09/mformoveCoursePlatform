import React from 'react';
import { colors } from '../../constants/colors';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className = '',
  onClick,
  removable = false,
  onRemove
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary.blue,
          color: colors.text.inverse,
          border: `1px solid ${colors.primary.blue}`
        };
      case 'success':
        return {
          backgroundColor: colors.status.success,
          color: colors.text.inverse,
          border: `1px solid ${colors.status.success}`
        };
      case 'warning':
        return {
          backgroundColor: colors.status.warning,
          color: colors.text.inverse,
          border: `1px solid ${colors.status.warning}`
        };
      case 'error':
        return {
          backgroundColor: colors.status.error,
          color: colors.text.inverse,
          border: `1px solid ${colors.status.error}`
        };
      case 'info':
        return {
          backgroundColor: colors.status.info,
          color: colors.text.inverse,
          border: `1px solid ${colors.status.info}`
        };
      default:
        return {
          backgroundColor: colors.background.tertiary,
          color: colors.text.secondary,
          border: `1px solid ${colors.border.medium}`
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: rounded ? '12px' : '4px',
          gap: '4px'
        };
      case 'md':
        return {
          padding: '6px 12px',
          fontSize: '14px',
          borderRadius: rounded ? '16px' : '6px',
          gap: '6px'
        };
      case 'lg':
        return {
          padding: '8px 16px',
          fontSize: '16px',
          borderRadius: rounded ? '20px' : '8px',
          gap: '8px'
        };
      default:
        return {
          padding: '6px 12px',
          fontSize: '14px',
          borderRadius: rounded ? '16px' : '6px',
          gap: '6px'
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.color,
        border: variantStyles.border,
        borderRadius: sizeStyles.borderRadius,
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        fontFamily: 'Montserrat, Arial, sans-serif',
        gap: sizeStyles.gap,
        userSelect: 'none'
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = colors.shadow.sm;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <span>{children}</span>
      
      {removable && (
        <button
          type="button"
          onClick={handleRemove}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '0',
            margin: '0',
            fontSize: 'inherit',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            transition: 'all 0.2s ease-in-out',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colorUtils.withOpacity(colors.text.inverse, 0.2);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

// Función de utilidad para colores con opacidad
const colorUtils = {
  withOpacity: (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
};

export default Badge; 