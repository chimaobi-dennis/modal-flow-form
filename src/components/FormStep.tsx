
import React from 'react';

interface FormStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isVisible: boolean;
}

const FormStep = ({ title, subtitle, children, isVisible }: FormStepProps) => {
  if (!isVisible) return null;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {subtitle && (
          <p className="text-gray-600 text-sm">{subtitle}</p>
        )}
      </div>
      
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default FormStep;
