
import React from 'react';
import { X, Sparkles, Zap } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with light gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-purple-50/90 to-cyan-50/95 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-35"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-ping opacity-25"></div>
      </div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl mx-4 animate-scale-in max-h-[95vh] overflow-y-auto">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-cyan-200/30 rounded-3xl blur-sm"></div>
        
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with light gradient */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 p-8">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-cyan-100/20 opacity-50"></div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 transition-all duration-300 rounded-full hover:bg-gray-100/50 hover:scale-110 z-10 group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            {/* Logo and Branding */}
            <div className="relative flex items-center mb-8">
              <div className="relative">
                {/* Glowing logo background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-md opacity-20 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-white to-blue-50 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-lg">
                  <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <div className="ml-6 text-gray-800">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Lovable AI
                </h1>
                <p className="text-gray-600 text-sm mt-1 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-amber-500" />
                  Powered by Intelligence
                </p>
              </div>
            </div>
            
            {/* Header Text */}
            <div className="relative text-gray-800 mb-2">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                Welcome to the Future 🚀
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed max-w-2xl">
                Let's personalize your AI-powered development experience. 
                <span className="text-blue-600 font-medium"> Tell us about yourself</span> to unlock 
                tailored recommendations and features.
              </p>
            </div>
            
            {/* Tech grid pattern overlay */}
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
              <div className="grid grid-cols-8 gap-1 w-full h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="bg-blue-400 rounded-sm animate-pulse" style={{animationDelay: `${i * 50}ms`}}></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Form Content with light tech styling */}
          <div className="relative bg-gradient-to-b from-white/80 to-blue-50/50 p-8">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-3" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.1) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
            
            <div className="relative">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
