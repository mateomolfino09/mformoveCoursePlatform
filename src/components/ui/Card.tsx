import React from 'react';
import { colors } from '../../constants/colors';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    height?: string;
  };
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  size = 'md',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
  header,
  footer,
  image,
  actions
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.background.primary,
          border: 'none',
          boxShadow: colors.shadow.md,
          hoverShadow: colors.shadow.lg
        };
      case 'outlined':
        return {
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.border.medium}`,
          boxShadow: 'none',
          hoverShadow: colors.shadow.sm
        };
      case 'filled':
        return {
          backgroundColor: colors.background.tertiary,
          border: 'none',
          boxShadow: 'none',
          hoverShadow: colors.shadow.sm
        };
      default:
        return {
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.border.light}`,
          boxShadow: colors.shadow.sm,
          hoverShadow: colors.shadow.md
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return '12px';
      case 'md':
        return '16px';
      case 'lg':
        return '24px';
      default:
        return '16px';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          borderRadius: '6px',
          fontSize: '14px'
        };
      case 'md':
        return {
          borderRadius: '8px',
          fontSize: '16px'
        };
      case 'lg':
        return {
          borderRadius: '12px',
          fontSize: '18px'
        };
      default:
        return {
          borderRadius: '8px',
          fontSize: '16px'
        };
    }
  };

  const variantStyles = getVariantStyles();
  const paddingStyles = getPaddingStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div
      style={{
        backgroundColor: variantStyles.backgroundColor,
        border: variantStyles.border,
        borderRadius: sizeStyles.borderRadius,
        boxShadow: variantStyles.boxShadow,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        cursor: onClick || hoverable ? 'pointer' : 'default',
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: sizeStyles.fontSize
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = variantStyles.hoverShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variantStyles.boxShadow;
        }
      }}
    >
      {/* Image */}
      {image && (
        <div style={{
          width: '100%',
          height: image.height || '200px',
          overflow: 'hidden'
        }}>
          <img
            src={image.src}
            alt={image.alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* Header */}
      {(header || title || subtitle) && (
        <div style={{
          padding: paddingStyles,
          paddingBottom: padding === 'none' ? '0' : '12px',
          borderBottom: header || title || subtitle ? `1px solid ${colors.border.light}` : 'none'
        }}>
          {header ? (
            header
          ) : (
            <>
              {title && (
                <h3 style={{
                  margin: 0,
                  marginBottom: subtitle ? '4px' : 0,
                  fontSize: '18px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: colors.text.secondary,
                  fontFamily: 'Montserrat, Arial, sans-serif'
                }}>
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{
        padding: paddingStyles,
        paddingTop: header || title || subtitle ? '12px' : paddingStyles,
        paddingBottom: footer || actions ? '12px' : paddingStyles
      }}>
        {children}
      </div>

      {/* Actions */}
      {actions && (
        <div style={{
          padding: paddingStyles,
          paddingTop: '12px',
          borderTop: `1px solid ${colors.border.light}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          {actions}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div style={{
          padding: paddingStyles,
          paddingTop: '12px',
          borderTop: `1px solid ${colors.border.light}`,
          backgroundColor: colors.background.secondary
        }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 