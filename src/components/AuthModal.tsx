
import React from 'react';
import { X, Sparkles, Zap, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const AuthModal = ({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) => {
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
      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-cyan-200/30 rounded-3xl blur-sm"></div>
        
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 p-8">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 transition-all duration-300 rounded-full hover:bg-gray-100/50 hover:scale-110 z-10 group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            {/* Logo and Branding */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-md opacity-20 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-white to-blue-50 rounded-2xl flex items-center justify-center border border-blue-200/50 shadow-lg">
                  <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 bg-clip-text text-transparent">
                Welcome Back! 👋
              </h2>
              <p className="text-gray-600 text-sm">
                Please sign in to continue your AI-powered journey
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative bg-gradient-to-b from-white/80 to-blue-50/50 p-8">
            <div className="space-y-4">
              <button
                onClick={onLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
              >
                <LogIn size={20} />
                Sign In
              </button>
              
              <button
                onClick={onRegister}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
              >
                <UserPlus size={20} />
                Create Account
              </button>
              
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Secure AI-powered authentication
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
