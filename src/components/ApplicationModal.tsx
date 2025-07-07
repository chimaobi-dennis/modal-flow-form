import React, { useState, useEffect } from 'react';
import { X, CheckCircle, User, Phone, Globe, BookOpen, Briefcase, Shield } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApplicationModal = ({ isOpen, onClose }: ApplicationModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userLocation, setUserLocation] = useState('US');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    countryCode: '+1',
    countries: [] as string[],
    hasEnglishTest: '',
    englishTest: '',
    workExperience: '',
    agreeTerms: false,
    agreeDataUsage: false
  });

  const countryCodes = [
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
    { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
    { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
    { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
    { code: '+31', country: 'NL', flag: '🇳🇱', name: 'Netherlands' },
    { code: '+46', country: 'SE', flag: '🇸🇪', name: 'Sweden' },
    { code: '+47', country: 'NO', flag: '🇳🇴', name: 'Norway' },
    { code: '+45', country: 'DK', flag: '🇩🇰', name: 'Denmark' },
    { code: '+41', country: 'CH', flag: '🇨🇭', name: 'Switzerland' },
    { code: '+43', country: 'AT', flag: '🇦🇹', name: 'Austria' },
    { code: '+32', country: 'BE', flag: '🇧🇪', name: 'Belgium' },
    { code: '+353', country: 'IE', flag: '🇮🇪', name: 'Ireland' },
    { code: '+64', country: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
    { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
    { code: '+65', country: 'SG', flag: '🇸🇬', name: 'Singapore' },
    { code: '+852', country: 'HK', flag: '🇭🇰', name: 'Hong Kong' },
    { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE' }
  ];

  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
    'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
    'Switzerland', 'Austria', 'Belgium', 'Ireland', 'New Zealand', 'Japan',
    'South Korea', 'Singapore', 'Hong Kong', 'UAE', 'Other'
  ];

  const englishTests = [
    'IELTS',
    'TOEFL iBT',
    'Cambridge Michigan Language Assessments',
    'Pearson PTE Academic',
    'Cambridge ESOL'
  ];

  const workExperienceOptions = [
    '0-1 year of working experience',
    '2-3 years of working experience',
    '4-6 years of working experience',
    'More than 6 years of working experience'
  ];

  const steps = [
    {
      title: 'Personal Information',
      subtitle: 'Enter your full name',
      icon: User
    },
    {
      title: 'Contact Details',
      subtitle: 'Enter your phone number',
      icon: Phone
    },
    {
      title: 'Citizenship',
      subtitle: 'Select up to 3 countries of citizenship',
      icon: Globe
    },
    {
      title: 'English Proficiency',
      subtitle: 'Do you have a valid English proficiency test?',
      icon: BookOpen
    },
    {
      title: 'Work Experience',
      subtitle: 'Select your years of working experience',
      icon: Briefcase
    },
    {
      title: 'Terms & Conditions',
      subtitle: 'Review and agree to our terms',
      icon: Shield
    }
  ];

  useEffect(() => {
    // Try to get user's location for default country code
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This is a simplified location detection
          // In a real app, you'd use a geolocation API service
          fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=YOUR_API_KEY`)
            .then(response => response.json())
            .then(data => {
              const countryCode = countryCodes.find(cc => cc.country === data.country_code2);
              if (countryCode) {
                setFormData(prev => ({ ...prev, countryCode: countryCode.code }));
                setUserLocation(data.country_code2);
              }
            })
            .catch(() => {
              // Fallback to US
              setFormData(prev => ({ ...prev, countryCode: '+1' }));
            });
        },
        () => {
          // Geolocation denied, use default
          setFormData(prev => ({ ...prev, countryCode: '+1' }));
        }
      );
    }
  }, []);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCountryToggle = (country: string) => {
    const newCountries = formData.countries.includes(country)
      ? formData.countries.filter(c => c !== country)
      : formData.countries.length < 3
        ? [...formData.countries, country]
        : formData.countries;
    
    setFormData({ ...formData, countries: newCountries });
  };

  const handleSubmit = () => {
    const fullPhoneNumber = formData.countryCode + formData.phoneNumber;
    const submissionData = {
      ...formData,
      fullPhoneNumber
    };
    console.log('Application submitted:', submissionData);
    onClose();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.fullName.trim() !== '';
      case 1: return formData.phoneNumber.trim() !== '';
      case 2: return formData.countries.length > 0;
      case 3: return formData.hasEnglishTest !== '' && (formData.hasEnglishTest === 'no' || formData.englishTest !== '');
      case 4: return formData.workExperience !== '';
      case 5: return formData.agreeTerms && formData.agreeDataUsage;
      default: return false;
    }
  };

  const renderStepContent = () => {
    const IconComponent = steps[currentStep].icon;
    
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <div className="flex space-x-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  {countryCodes.map((cc) => (
                    <option key={cc.country} value={cc.code}>
                      {cc.flag} {cc.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your phone number"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Full number: {formData.countryCode}{formData.phoneNumber}
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-4">Selected: {formData.countries.length}/3</p>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountryToggle(country)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      formData.countries.includes(country)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                    } ${formData.countries.length >= 3 && !formData.countries.includes(country) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={formData.countries.length >= 3 && !formData.countries.includes(country)}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <button
                  onClick={() => setFormData({ ...formData, hasEnglishTest: 'yes' })}
                  className={`w-full p-4 text-left rounded-xl border transition-all ${
                    formData.hasEnglishTest === 'yes'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                  }`}
                >
                  Yes, I have a valid English proficiency test
                </button>
                <button
                  onClick={() => setFormData({ ...formData, hasEnglishTest: 'no', englishTest: '' })}
                  className={`w-full p-4 text-left rounded-xl border transition-all ${
                    formData.hasEnglishTest === 'no'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                  }`}
                >
                  No, I don't have a valid English proficiency test
                </button>
              </div>
              
              {formData.hasEnglishTest === 'yes' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Which test?</label>
                  <div className="space-y-2">
                    {englishTests.map((test) => (
                      <button
                        key={test}
                        onClick={() => setFormData({ ...formData, englishTest: test })}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${
                          formData.englishTest === test
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                        }`}
                      >
                        {test}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            <div className="space-y-3">
              {workExperienceOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setFormData({ ...formData, workExperience: option })}
                  className={`w-full p-4 text-left rounded-xl border transition-all ${
                    formData.workExperience === option
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{steps[currentStep].title}</h3>
              <p className="text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the terms and conditions
                </span>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeDataUsage}
                  onChange={(e) => setFormData({ ...formData, agreeDataUsage: e.target.checked })}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I agree that my data be used in line with EU data regulation and your local data law
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-purple-50/90 to-cyan-50/95 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl mx-4 animate-scale-in max-h-[95vh] overflow-y-auto">
        <div className="relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-all duration-300 rounded-full hover:bg-gray-100/50 hover:scale-110 group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Start Your Application
              </h2>
              <p className="text-gray-600 mb-4">
                Complete the following steps to start your application
              </p>
              
              {/* Progress indicator */}
              <div className="flex justify-center space-x-2 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {renderStepContent()}
            
            {/* Navigation buttons */}
            <div className="flex justify-between pt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="px-6 py-3 text-gray-600 bg-gray-100 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  Submit Application
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
