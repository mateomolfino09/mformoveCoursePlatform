import React from 'react';

interface InfoModalSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const InfoModalSection: React.FC<InfoModalSectionProps> = ({
  title,
  children,
  className = ""
}) => {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-bold text-[#234C8C] mb-3">{title}</h3>
      {children}
    </div>
  );
};

export default InfoModalSection; 