
import React from 'react';
import { X, GraduationCap } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-2xl animate-scale-in max-h-[95vh] overflow-y-auto">
        {/* Header with Logo and Text */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-t-3xl p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 z-10"
          >
            <X size={24} />
          </button>
          
          {/* Logo */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">EduPath</h1>
              <p className="text-white/80 text-sm">Your Learning Journey</p>
            </div>
          </div>
          
          {/* Header Text */}
          <div className="text-white mb-2">
            <h2 className="text-3xl font-bold mb-3">Start your journey 🎓</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Tell us more about yourself to personalize your recommendations based on your preferences.
            </p>
          </div>
        </div>
        
        {/* Form Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
