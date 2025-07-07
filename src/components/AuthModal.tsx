
import React from 'react';
import { X, User, LogIn } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  if (!isOpen) return null;

  const handleSignIn = () => {
    // Navigate to sign-in page
    window.location.href = '/signin';
  };

  const handleRegister = () => {
    // Navigate to register page
    window.location.href = '/register';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-purple-50/90 to-cyan-50/95 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 p-8">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 transition-all duration-300 rounded-full hover:bg-gray-100/50 hover:scale-110 group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Sign In to Continue
              </h2>
              <p className="text-gray-600">
                Access your account to unlock all features
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <LogIn size={20} />
                Sign In
              </button>
              
              <button
                onClick={handleRegister}
                className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-blue-300"
              >
                Create Account
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                New to our platform? 
                <button 
                  onClick={handleRegister}
                  className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                >
                  Get started today
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
