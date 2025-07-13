import React from 'react';
import { colors } from '../../constants/colors';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left'
}) => {
  const baseStyles = `
    font-family: 'Montserrat', Arial, sans-serif;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-decoration: none;
    outline: none;
    position: relative;
  `;

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantStyles = {
    primary: `
      background-color: ${colors.primary.blue};
      color: ${colors.text.inverse};
      &:hover:not(:disabled) {
        background-color: ${colors.primary.blueLight};
        transform: translateY(-1px);
        box-shadow: ${colors.shadow.md};
      }
      &:active:not(:disabled) {
        background-color: ${colors.primary.blueDark};
        transform: translateY(0);
      }
    `,
    secondary: `
      background-color: ${colors.neutral.gray100};
      color: ${colors.text.primary};
      border: 1px solid ${colors.border.medium};
      &:hover:not(:disabled) {
        background-color: ${colors.neutral.gray200};
        transform: translateY(-1px);
        box-shadow: ${colors.shadow.sm};
      }
      &:active:not(:disabled) {
        background-color: ${colors.neutral.gray300};
        transform: translateY(0);
      }
    `,
    outline: `
      background-color: transparent;
      color: ${colors.primary.blue};
      border: 2px solid ${colors.primary.blue};
      &:hover:not(:disabled) {
        background-color: ${colors.primary.blue};
        color: ${colors.text.inverse};
        transform: translateY(-1px);
        box-shadow: ${colors.shadow.sm};
      }
      &:active:not(:disabled) {
        background-color: ${colors.primary.blueDark};
        transform: translateY(0);
      }
    `,
    ghost: `
      background-color: transparent;
      color: ${colors.text.secondary};
      &:hover:not(:disabled) {
        background-color: ${colors.neutral.gray100};
        color: ${colors.text.primary};
        transform: translateY(-1px);
      }
      &:active:not(:disabled) {
        background-color: ${colors.neutral.gray200};
        transform: translateY(0);
      }
    `,
    danger: `
      background-color: ${colors.status.error};
      color: ${colors.text.inverse};
      &:hover:not(:disabled) {
        background-color: ${colorUtils.darken(colors.status.error, 20)};
        transform: translateY(-1px);
        box-shadow: ${colors.shadow.md};
      }
      &:active:not(:disabled) {
        background-color: ${colorUtils.darken(colors.status.error, 40)};
        transform: translateY(0);
      }
    `,
    success: `
      background-color: ${colors.status.success};
      color: ${colors.text.inverse};
      &:hover:not(:disabled) {
        background-color: ${colorUtils.darken(colors.status.success, 20)};
        transform: translateY(-1px);
        box-shadow: ${colors.shadow.md};
      }
      &:active:not(:disabled) {
        background-color: ${colorUtils.darken(colors.status.success, 40)};
        transform: translateY(0);
      }
    `
  };

  const disabledStyles = `
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  `;

  const fullWidthStyles = fullWidth ? 'w-full' : '';

  const combinedStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled || loading ? disabledStyles : ''}
    ${fullWidthStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
          Cargando...
        </>
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          {children}
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedStyles}
             style={{
         fontFamily: 'Montserrat, Arial, sans-serif',
         fontWeight: 600,
         borderRadius: '8px',
         cursor: disabled || loading ? 'not-allowed' : 'pointer',
         transition: 'all 0.2s ease-in-out',
         display: 'inline-flex',
         alignItems: 'center',
         justifyContent: 'center',
         gap: '8px',
         textDecoration: 'none',
         outline: 'none',
         position: 'relative',
         width: fullWidth ? '100%' : 'auto',
         padding: size === 'sm' ? '8px 12px' : size === 'md' ? '12px 16px' : '16px 24px',
         fontSize: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px',
         backgroundColor: variant === 'primary' ? colors.primary.blue : 
                         variant === 'secondary' ? colors.neutral.gray100 :
                         variant === 'outline' ? 'transparent' :
                         variant === 'ghost' ? 'transparent' :
                         variant === 'danger' ? colors.status.error :
                         variant === 'success' ? colors.status.success : colors.primary.blue,
         color: variant === 'outline' ? colors.primary.blue :
                variant === 'ghost' ? colors.text.secondary :
                colors.text.inverse,
         border: variant === 'secondary' ? `1px solid ${colors.border.medium}` :
                 variant === 'outline' ? `2px solid ${colors.primary.blue}` : 'none',
         opacity: disabled || loading ? 0.6 : 1,
         transform: disabled || loading ? 'none' : undefined,
         boxShadow: disabled || loading ? 'none' : undefined
       }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = variant === 'outline' || variant === 'ghost' ? 
            colors.shadow.sm : colors.shadow.md;
          if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = colors.primary.blue;
            e.currentTarget.style.color = colors.text.inverse;
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = colors.neutral.gray100;
            e.currentTarget.style.color = colors.text.primary;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = colors.neutral.gray200;
          } else if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = colors.primary.blueLight;
          } else if (variant === 'danger') {
            e.currentTarget.style.backgroundColor = colorUtils.darken(colors.status.error, 20);
          } else if (variant === 'success') {
            e.currentTarget.style.backgroundColor = colorUtils.darken(colors.status.success, 20);
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.primary.blue;
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.text.secondary;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = colors.neutral.gray100;
          } else if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = colors.primary.blue;
          } else if (variant === 'danger') {
            e.currentTarget.style.backgroundColor = colors.status.error;
          } else if (variant === 'success') {
            e.currentTarget.style.backgroundColor = colors.status.success;
          }
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          if (variant === 'outline') {
            e.currentTarget.style.backgroundColor = colors.primary.blueDark;
          } else if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = colors.neutral.gray200;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = colors.neutral.gray300;
          } else if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = colors.primary.blueDark;
          } else if (variant === 'danger') {
            e.currentTarget.style.backgroundColor = colorUtils.darken(colors.status.error, 40);
          } else if (variant === 'success') {
            e.currentTarget.style.backgroundColor = colorUtils.darken(colors.status.success, 40);
          }
        }
      }}
    >
      {renderContent()}
    </button>
  );
};

// Función de utilidad para oscurecer colores
const colorUtils = {
  darken: (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - amount);
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
};

export default Button; 