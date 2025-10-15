import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from 'lucide-react';
import ApplicationFormModal from '@/components/ApplicationFormModal';
import { toast } from 'sonner';

const ApplicationJourney = () => {
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);

  const handleStartApplication = () => {
    toast.info('Opening application form...');
    setApplicationModalOpen(true);
  };

  const handleCloseModal = () => {
    setApplicationModalOpen(false);
    toast.info('Application form closed');
  };

  const handleFeatureClick = (featureName: string) => {
    toast.info(`${featureName} feature coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Unlock Your Study Abroad Adventure
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your journey to international education starts here. Discover the perfect pathway and make your dream a reality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={handleStartApplication}
            >
              Start Your Application
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => handleFeatureClick('Learn More')}
            >
              Learn More
              <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">
            Explore Our Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => handleFeatureClick('Personalized Guidance')}>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Personalized Guidance</h3>
              <p className="text-gray-600">Receive tailored advice and support from our expert advisors.</p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => handleFeatureClick('Application Assistance')}>
              <h3 className="text-xl font-semibold text-green-700 mb-2">Application Assistance</h3>
              <p className="text-gray-600">Get help with every step of your application, from essays to interviews.</p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-yellow-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => handleFeatureClick('Scholarship Matching')}>
              <h3 className="text-xl font-semibold text-yellow-700 mb-2">Scholarship Matching</h3>
              <p className="text-gray-600">Find the perfect scholarships to fund your education abroad.</p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-red-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => handleFeatureClick('Visa Support')}>
              <h3 className="text-xl font-semibold text-red-700 mb-2">Visa Support</h3>
              <p className="text-gray-600">Navigate the visa application process with our comprehensive support.</p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-purple-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => handleFeatureClick('Accommodation Finder')}>
              <h3 className="text-xl font-semibold text-purple-700 mb-2">Accommodation Finder</h3>
              <p className="text-gray-600">Find safe and comfortable housing options near your university.</p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-teal-50 p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={() => handleFeatureClick('Community Forum')}>
              <h3 className="text-xl font-semibold text-teal-700 mb-2">Community Forum</h3>
              <p className="text-gray-600">Connect with other students and share your experiences.</p>
            </div>
          </div>
        </div>
      </section>

      <ApplicationFormModal
        isOpen={applicationModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ApplicationJourney;
