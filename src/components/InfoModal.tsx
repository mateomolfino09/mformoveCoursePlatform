import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl ${maxWidth} w-full max-h-[90vh] relative overflow-hidden`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#234C8C] to-[#1a365d] text-white p-6 relative">
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl font-bold transition-colors"
            onClick={onClose}
          >
            ×
          </button>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-blue-100 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6 font-montserrat">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal; 