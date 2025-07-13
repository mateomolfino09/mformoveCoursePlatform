'use client';

import React, { useEffect, useRef } from 'react';
import { colors } from '../../constants/colors';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showOverlay?: boolean;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showOverlay = true,
  className = '',
  footer,
  header
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape, closeOnOverlayClick]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: {
      maxWidth: '400px',
      width: '90vw'
    },
    md: {
      maxWidth: '600px',
      width: '90vw'
    },
    lg: {
      maxWidth: '800px',
      width: '90vw'
    },
    xl: {
      maxWidth: '1200px',
      width: '95vw'
    },
    full: {
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      margin: '0',
      borderRadius: '0'
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size === 'full' ? '0' : '20px'
    }}>
      {showOverlay && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.background.overlay,
          backdropFilter: 'blur(4px)'
        }} />
      )}
      
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          backgroundColor: colors.background.primary,
          borderRadius: size === 'full' ? '0' : '12px',
          boxShadow: colors.shadow.xl,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: size === 'full' ? '100vh' : '90vh',
          overflow: 'hidden',
          ...sizeStyles[size]
        }}
        className={className}
      >
        {/* Header */}
        {(header || title || showCloseButton) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${colors.border.light}`,
            backgroundColor: colors.background.primary
          }}>
            {header ? (
              header
            ) : title ? (
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 600,
                color: colors.text.primary,
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}>
                {title}
              </h2>
            ) : (
              <div />
            )}
            
                         {showCloseButton && (
               <button
                 onClick={onClose}
                 style={{
                   padding: '8px',
                   minWidth: '32px',
                   width: '32px',
                   height: '32px',
                   background: 'none',
                   border: 'none',
                   borderRadius: '6px',
                   cursor: 'pointer',
                   color: colors.text.tertiary,
                   fontSize: '16px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   transition: 'all 0.2s ease-in-out',
                   fontFamily: 'Montserrat, Arial, sans-serif'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = colors.background.tertiary;
                   e.currentTarget.style.color = colors.text.secondary;
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = 'transparent';
                   e.currentTarget.style.color = colors.text.tertiary;
                 }}
               >
                 ✕
               </button>
             )}
          </div>
        )}
        
        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          backgroundColor: colors.background.primary
        }}>
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div style={{
            padding: '20px 24px',
            borderTop: `1px solid ${colors.border.light}`,
            backgroundColor: colors.background.primary,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 