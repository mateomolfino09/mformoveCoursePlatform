import React from 'react';

interface InfoModalFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  showBorder?: boolean;
}

const InfoModalField: React.FC<InfoModalFieldProps> = ({
  label,
  value,
  className = "",
  showBorder = true
}) => {
  return (
    <div className={className}>
      <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
      <div className={`text-gray-800 ${showBorder ? 'bg-white p-3 rounded border-l-4 border-[#234C8C]' : 'font-medium'}`}>
        {value}
      </div>
    </div>
  );
};

export default InfoModalField; 