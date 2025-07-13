import React, { forwardRef } from 'react';
import { colors } from '../../constants/colors';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success' | 'warning';
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  disabled = false,
  required = false,
  readOnly = false,
  autoComplete,
  autoFocus = false,
  name,
  id,
  className = '',
  size = 'md',
  variant = 'default',
  fullWidth = false,
  label,
  helperText,
  error,
  icon,
  iconPosition = 'left',
  clearable = false,
  onClear,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [showClear, setShowClear] = React.useState(false);

  React.useEffect(() => {
    setShowClear(clearable && !!value && !disabled);
  }, [clearable, value, disabled]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const event = {
        target: { value: '', name: name || '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  const getVariantStyles = () => {
    if (error || variant === 'error') {
      return {
        borderColor: colors.status.error,
        focusBorderColor: colors.status.error,
        focusRingColor: colors.status.errorLight
      };
    }
    if (variant === 'success') {
      return {
        borderColor: colors.status.success,
        focusBorderColor: colors.status.success,
        focusRingColor: colors.status.successLight
      };
    }
    if (variant === 'warning') {
      return {
        borderColor: colors.status.warning,
        focusBorderColor: colors.status.warning,
        focusRingColor: colors.status.warningLight
      };
    }
    return {
      borderColor: isFocused ? colors.border.focus : colors.border.medium,
      focusBorderColor: colors.border.focus,
      focusRingColor: colorUtils.withOpacity(colors.primary.blue, 0.1)
    };
  };

  const variantStyles = getVariantStyles();

  const sizeStyles = {
    sm: {
      padding: '8px 12px',
      fontSize: '14px',
      height: '36px'
    },
    md: {
      padding: '12px 16px',
      fontSize: '16px',
      height: '44px'
    },
    lg: {
      padding: '16px 20px',
      fontSize: '18px',
      height: '52px'
    }
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            color: colors.text.primary,
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '6px',
            fontFamily: 'Montserrat, Arial, sans-serif'
          }}
        >
          {label}
          {required && (
            <span style={{ color: colors.status.error, marginLeft: '4px' }}>
              *
            </span>
          )}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {icon && iconPosition === 'left' && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.text.tertiary,
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            height: sizeStyles[size].height,
            padding: icon && iconPosition === 'left' 
              ? `${sizeStyles[size].padding.split(' ')[0]} ${sizeStyles[size].padding.split(' ')[1]} ${sizeStyles[size].padding.split(' ')[1]} ${icon ? '40px' : sizeStyles[size].padding.split(' ')[1]}`
              : icon && iconPosition === 'right'
              ? `${sizeStyles[size].padding.split(' ')[0]} ${sizeStyles[size].padding.split(' ')[1]} ${sizeStyles[size].padding.split(' ')[1]} ${showClear ? '80px' : '40px'}`
              : showClear
              ? `${sizeStyles[size].padding.split(' ')[0]} ${sizeStyles[size].padding.split(' ')[1]} ${sizeStyles[size].padding.split(' ')[1]} 40px`
              : sizeStyles[size].padding,
            fontSize: sizeStyles[size].fontSize,
            fontFamily: 'Montserrat, Arial, sans-serif',
            color: colors.text.primary,
            backgroundColor: disabled ? colors.background.tertiary : colors.background.primary,
            border: `1px solid ${variantStyles.borderColor}`,
            borderRadius: '8px',
            outline: 'none',
            transition: 'all 0.2s ease-in-out',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.6 : 1,
            ...(isFocused && {
              borderColor: variantStyles.focusBorderColor,
              boxShadow: `0 0 0 3px ${variantStyles.focusRingColor}`
            })
          }}
          className={className}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div style={{
            position: 'absolute',
            right: showClear ? '40px' : '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.text.tertiary,
            zIndex: 1,
            pointerEvents: 'none'
          }}>
            {icon}
          </div>
        )}
        
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: colors.text.tertiary,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.2s ease-in-out',
              zIndex: 2
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.text.secondary;
              e.currentTarget.style.backgroundColor = colors.background.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.text.tertiary;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        )}
      </div>
      
      {(helperText || error) && (
        <p style={{
          marginTop: '4px',
          fontSize: '12px',
          fontFamily: 'Montserrat, Arial, sans-serif',
          color: error ? colors.status.error : colors.text.tertiary,
          lineHeight: '1.4'
        }}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

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

Input.displayName = 'Input';

export default Input; 