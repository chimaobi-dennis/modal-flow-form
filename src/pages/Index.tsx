import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import AuthModal from '../components/AuthModal';
import ProgressForm from '../components/ProgressForm';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  // Check if user is logged in on component mount
  useEffect(() => {
    // TODO: Replace with actual authentication check
    // For now, we'll simulate checking localStorage or auth state
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!userToken);
  }, []);

  const handleStartForm = () => {
    if (isLoggedIn) {
      setIsModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogin = () => {
    // TODO: Navigate to login page
    // For now, we'll simulate login
    console.log('Navigating to login page...');
    toast({
      title: "Login Required",
      description: "Please connect Supabase to enable authentication functionality.",
    });
    setIsAuthModalOpen(false);
  };

  const handleRegister = () => {
    // TODO: Navigate to register page
    // For now, we'll simulate register
    console.log('Navigating to register page...');
    toast({
      title: "Registration Required",
      description: "Please connect Supabase to enable authentication functionality.",
    });
    setIsAuthModalOpen(false);
  };

  const handleFormComplete = (data: any) => {
    console.log('Form completed with data:', data);
    toast({
      title: "Form Completed!",
      description: `Thank you ${data.name}! Your information has been submitted.`,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Modern Progress Form
          </h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Experience a beautifully designed multi-step form with smooth animations and modern UI
          </p>
        </div>
        
        <button
          onClick={handleStartForm}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isLoggedIn ? 'Start Progress Form' : 'Get Started'}
        </button>

        {/* Authentication status indicator */}
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            {isLoggedIn ? '✅ You are signed in' : '🔒 Sign in required to continue'}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multi-Step Design</h3>
            <p className="text-gray-600 text-sm">One question per page for better focus and user experience</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-gray-600 text-sm">Visual progress indicator shows completion status</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Modern Animations</h3>
            <p className="text-gray-600 text-sm">Smooth transitions and micro-interactions</p>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProgressForm onComplete={handleFormComplete} />
      </Modal>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default Index;
