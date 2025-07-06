
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import FormStep from './FormStep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface FormData {
  question1: string;
  question2: string;
  question3: string;
  question4: string[];
  question5: string;
  question6: string;
}

interface ProgressFormProps {
  onComplete: (data: FormData) => void;
}

const ProgressForm = ({ onComplete }: ProgressFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    question1: '',
    question2: '',
    question3: '',
    question4: [],
    question5: '',
    question6: ''
  });

  const [searchQuery, setSearchQuery] = useState('');
  const searchData = [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'UI/UX Design',
    'Product Management',
    'Digital Marketing'
  ];

  const filteredSearchData = searchData.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSteps = 7;

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (value: string) => {
    const currentValues = formData.question4;
    if (currentValues.includes(value)) {
      updateFormData('question4', currentValues.filter(v => v !== value));
    } else if (currentValues.length < 3) {
      updateFormData('question4', [...currentValues, value]);
    }
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
      case 1: return formData.question1.trim() !== '';
      case 2: return formData.question2.trim() !== '';
      case 3: return formData.question3.trim() !== '';
      case 4: return formData.question4.length > 0;
      case 5: return formData.question5.trim() !== '';
      case 6: return formData.question6.trim() !== '';
      case 7: return true;
      default: return false;
    }
  };

  return (
    <div className="p-8">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* Step 1: Radio Buttons */}
      <FormStep
        title="What's your preferred working style?"
        subtitle="Choose the option that best describes you"
        isVisible={currentStep === 1}
      >
        <RadioGroup value={formData.question1} onValueChange={(value) => updateFormData('question1', value)}>
          <div className="space-y-4">
            {['Remote Work', 'Hybrid Work', 'Office Work', 'Flexible Schedule'].map((option) => (
              <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer text-lg">{option}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </FormStep>

      {/* Step 2: Dropdown */}
      <FormStep
        title="What's your experience level?"
        subtitle="Select your current professional level"
        isVisible={currentStep === 2}
      >
        <Select value={formData.question2} onValueChange={(value) => updateFormData('question2', value)}>
          <SelectTrigger className="w-full h-14 text-lg rounded-xl border-2">
            <SelectValue placeholder="Choose your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
            <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
            <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
            <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
            <SelectItem value="executive">Executive Level</SelectItem>
          </SelectContent>
        </Select>
      </FormStep>

      {/* Step 3: Dropdown */}
      <FormStep
        title="What's your primary role?"
        subtitle="Select the role that best matches your position"
        isVisible={currentStep === 3}
      >
        <Select value={formData.question3} onValueChange={(value) => updateFormData('question3', value)}>
          <SelectTrigger className="w-full h-14 text-lg rounded-xl border-2">
            <SelectValue placeholder="Choose your primary role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="developer">Software Developer</SelectItem>
            <SelectItem value="designer">UI/UX Designer</SelectItem>
            <SelectItem value="manager">Product Manager</SelectItem>
            <SelectItem value="analyst">Data Analyst</SelectItem>
            <SelectItem value="marketer">Digital Marketer</SelectItem>
            <SelectItem value="consultant">Consultant</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </FormStep>

      {/* Step 4: Multi-select (up to 3) */}
      <FormStep
        title="What are your top skills?"
        subtitle="Select up to 3 skills that represent your expertise"
        isVisible={currentStep === 4}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-500 mb-4">
            Selected: {formData.question4.length}/3
          </div>
          {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git', 'Figma', 'Analytics'].map((skill) => {
            const isSelected = formData.question4.includes(skill);
            const canSelect = formData.question4.length < 3 || isSelected;
            
            return (
              <button
                key={skill}
                onClick={() => handleMultiSelect(skill)}
                disabled={!canSelect}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : canSelect
                    ? 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {skill}
                {isSelected && <span className="float-right">✓</span>}
              </button>
            );
          })}
        </div>
      </FormStep>

      {/* Step 5: Radio Buttons */}
      <FormStep
        title="What's your company size?"
        subtitle="Choose the range that matches your organization"
        isVisible={currentStep === 5}
      >
        <RadioGroup value={formData.question5} onValueChange={(value) => updateFormData('question5', value)}>
          <div className="space-y-4">
            {['Startup (1-10 employees)', 'Small (11-50 employees)', 'Medium (51-200 employees)', 'Large (201-1000 employees)', 'Enterprise (1000+ employees)'].map((option) => (
              <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer text-lg">{option}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </FormStep>

      {/* Step 6: Search with autocomplete */}
      <FormStep
        title="What's your area of interest?"
        subtitle="Search and select from our available options"
        isVisible={currentStep === 6}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for your area of interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            />
          </div>
          
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-2">
              {filteredSearchData.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    updateFormData('question6', item);
                    setSearchQuery('');
                  }}
                  className={`w-full p-3 text-left rounded-lg hover:bg-blue-50 transition-all ${
                    formData.question6 === item ? 'bg-blue-50 text-blue-700 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              ))}
              {filteredSearchData.length === 0 && (
                <div className="p-3 text-gray-500 text-center">No results found</div>
              )}
            </div>
          )}
          
          {formData.question6 && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              Selected: {formData.question6}
            </div>
          )}
        </div>
      </FormStep>

      {/* Step 7: Completion */}
      <FormStep
        title="You're all set!"
        subtitle="Thank you for completing the form"
        isVisible={currentStep === 7}
      >
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Form Completed Successfully!</h3>
          <p className="text-gray-600">Your responses have been recorded and will be processed shortly.</p>
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
          {currentStep === totalSteps ? 'Finish' : currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
          {currentStep < totalSteps && <ChevronRight size={20} className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default ProgressForm;
