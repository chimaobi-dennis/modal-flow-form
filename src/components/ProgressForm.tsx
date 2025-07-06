
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import FormStep from './FormStep';

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  experience: string;
}

interface ProgressFormProps {
  onComplete: (data: FormData) => void;
}

const ProgressForm = ({ onComplete }: ProgressFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    experience: ''
  });

  const totalSteps = 5;

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.name.trim() !== '';
      case 2: return formData.email.trim() !== '' && formData.email.includes('@');
      case 3: return formData.company.trim() !== '';
      case 4: return formData.role.trim() !== '';
      case 5: return formData.experience.trim() !== '';
      default: return false;
    }
  };

  return (
    <div className="p-8">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* Step 1: Name */}
      <FormStep
        title="What's your name?"
        subtitle="Let's start with the basics"
        isVisible={currentStep === 1}
      >
        <div>
          <input
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            autoFocus
          />
        </div>
      </FormStep>

      {/* Step 2: Email */}
      <FormStep
        title="What's your email?"
        subtitle="We'll use this to keep you updated"
        isVisible={currentStep === 2}
      >
        <div>
          <input
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            autoFocus
          />
        </div>
      </FormStep>

      {/* Step 3: Company */}
      <FormStep
        title="Which company do you work for?"
        subtitle="Tell us about your workplace"
        isVisible={currentStep === 3}
      >
        <div>
          <input
            type="text"
            placeholder="Enter your company name"
            value={formData.company}
            onChange={(e) => updateFormData('company', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            autoFocus
          />
        </div>
      </FormStep>

      {/* Step 4: Role */}
      <FormStep
        title="What's your role?"
        subtitle="Help us understand your position"
        isVisible={currentStep === 4}
      >
        <div className="space-y-3">
          {['Developer', 'Designer', 'Product Manager', 'Marketing', 'Sales', 'Other'].map((role) => (
            <button
              key={role}
              onClick={() => updateFormData('role', role)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all hover:border-blue-300 hover:bg-blue-50 ${
                formData.role === role 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </FormStep>

      {/* Step 5: Experience */}
      <FormStep
        title="How many years of experience do you have?"
        subtitle="This helps us personalize your experience"
        isVisible={currentStep === 5}
      >
        <div className="space-y-3">
          {['0-1 years', '2-5 years', '5-10 years', '10+ years'].map((exp) => (
            <button
              key={exp}
              onClick={() => updateFormData('experience', exp)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all hover:border-blue-300 hover:bg-blue-50 ${
                formData.experience === exp 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 text-gray-700'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </FormStep>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
            currentStep === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={20} className="mr-1" />
          Back
        </button>

        <button
          onClick={nextStep}
          disabled={!isStepValid()}
          className={`flex items-center px-8 py-3 rounded-xl font-medium transition-all ${
            isStepValid()
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentStep === totalSteps ? 'Complete' : 'Next'}
          {currentStep < totalSteps && <ChevronRight size={20} className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default ProgressForm;
