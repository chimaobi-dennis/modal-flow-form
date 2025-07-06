
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import FormStep from './FormStep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface FormData {
  degree: string;
  originCountry: string;
  field: string;
  desiredFields: string[];
  language: string;
  studyEnvironment: string[];
  interests: string[];
}

interface ProgressFormProps {
  onComplete: (data: FormData) => void;
}

const ProgressForm = ({ onComplete }: ProgressFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    degree: '',
    originCountry: '',
    field: '',
    desiredFields: [],
    language: '',
    studyEnvironment: [],
    interests: []
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  const countries = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Netherlands', 
    'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria', 'Belgium', 'Italy', 'Spain', 
    'Japan', 'South Korea', 'Singapore', 'China', 'India', 'Brazil', 'Mexico', 'Argentina'
  ];

  const fieldsOfStudy = [
    'Computer Science', 'Business Administration', 'Engineering', 'Medicine', 'Law', 
    'Psychology', 'Education', 'Economics', 'Biology', 'Chemistry', 'Physics', 
    'Mathematics', 'Art & Design', 'Literature', 'History', 'Philosophy', 'Sociology',
    'Political Science', 'International Relations', 'Marketing', 'Finance', 'Accounting'
  ];

  const interestKeywords = [
    'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Blockchain', 
    'Sustainability', 'Climate Change', 'Renewable Energy', 'Biotechnology', 
    'Neuroscience', 'Robotics', 'Quantum Computing', 'Space Technology', 
    'Digital Marketing', 'Entrepreneurship', 'Innovation', 'Social Impact',
    'Healthcare Technology', 'Financial Technology', 'Educational Technology',
    'Virtual Reality', 'Augmented Reality', 'Cybersecurity', 'Internet of Things'
  ];

  const filteredInterests = interestKeywords.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !formData.interests.includes(item)
  );

  const totalSteps = 7;

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDesiredFieldSelect = (field: string) => {
    const currentFields = formData.desiredFields;
    if (currentFields.includes(field)) {
      updateFormData('desiredFields', currentFields.filter(f => f !== field));
    } else if (currentFields.length < 5) {
      updateFormData('desiredFields', [...currentFields, field]);
    }
  };

  const handleEnvironmentSelect = (env: string) => {
    const currentEnv = formData.studyEnvironment;
    if (currentEnv.includes(env)) {
      updateFormData('studyEnvironment', currentEnv.filter(e => e !== env));
    } else if (currentEnv.length < 3) {
      updateFormData('studyEnvironment', [...currentEnv, env]);
    }
  };

  const handleInterestSelect = (interest: string) => {
    const currentInterests = formData.interests;
    if (currentInterests.length < 10) {
      updateFormData('interests', [...currentInterests, interest]);
      setSearchQuery('');
    }
  };

  const removeInterest = (interest: string) => {
    updateFormData('interests', formData.interests.filter(i => i !== interest));
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
      case 1: return formData.degree.trim() !== '';
      case 2: return formData.originCountry.trim() !== '';
      case 3: return formData.field.trim() !== '';
      case 4: return formData.desiredFields.length > 0;
      case 5: return formData.language.trim() !== '';
      case 6: return formData.studyEnvironment.length > 0;
      case 7: return true;
      default: return false;
    }
  };

  return (
    <div>
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
      
      {/* Step 1: Degree */}
      <FormStep
        title="I currently have a..."
        isVisible={currentStep === 1}
      >
        <RadioGroup value={formData.degree} onValueChange={(value) => updateFormData('degree', value)}>
          <div className="space-y-4">
            {['High School', 'Associate', "Bachelor's", "Master's", 'PhD', 'Other'].map((degree) => (
              <div key={degree} className="flex items-center space-x-3 p-4 rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                <RadioGroupItem value={degree} id={degree} />
                <Label htmlFor={degree} className="flex-1 cursor-pointer text-lg">{degree}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </FormStep>

      {/* Step 2: Origin Country */}
      <FormStep
        title="I got my degree from?"
        isVisible={currentStep === 2}
      >
        <Select value={formData.originCountry} onValueChange={(value) => updateFormData('originCountry', value)}>
          <SelectTrigger className="w-full h-14 text-lg rounded-xl border-2">
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormStep>

      {/* Step 3: Field of Study */}
      <FormStep
        title={`I got my ${formData.degree.toLowerCase()} in...`}
        isVisible={currentStep === 3}
      >
        <Select value={formData.field} onValueChange={(value) => updateFormData('field', value)}>
          <SelectTrigger className="w-full h-14 text-lg rounded-xl border-2">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fieldsOfStudy.map((field) => (
              <SelectItem key={field} value={field}>{field}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormStep>

      {/* Step 4: Desired Master's Fields */}
      <FormStep
        title="I want to study a master's degree in..."
        subtitle="You can choose up to 5 fields"
        isVisible={currentStep === 4}
      >
        <div className="space-y-4">
          <Select onValueChange={handleDesiredFieldSelect}>
            <SelectTrigger className="w-full h-14 text-lg rounded-xl border-2">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fieldsOfStudy.filter(field => !formData.desiredFields.includes(field)).map((field) => (
                <SelectItem key={field} value={field}>{field}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {formData.desiredFields.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Selected fields:</div>
              <div className="flex flex-wrap gap-2">
                {formData.desiredFields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200"
                  >
                    <span>{field}</span>
                    <button
                      onClick={() => handleDesiredFieldSelect(field)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Selected: {formData.desiredFields.length}/5
              </div>
            </div>
          )}
        </div>
      </FormStep>

      {/* Step 5: Language Requirement */}
      <FormStep
        title="For language requirement..."
        isVisible={currentStep === 5}
      >
        <RadioGroup value={formData.language} onValueChange={(value) => updateFormData('language', value)}>
          <div className="space-y-4">
            {[
              'I have an IELTS or other certified language certificate',
              'I would like assistance with language certificate',
              'My previous degree was taught in English'
            ].map((option) => (
              <div key={option} className="flex items-center space-x-3 p-4 rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option} className="flex-1 cursor-pointer text-lg">{option}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </FormStep>

      {/* Step 6: Study Environment */}
      <FormStep
        title="I would like to study in a..."
        subtitle="You can pick up to 3 preferences"
        isVisible={currentStep === 6}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-500 mb-4">
            Selected: {formData.studyEnvironment.length}/3
          </div>
          {[
            'Big & busy city',
            'Somewhere warm & sunny',
            'A small, cosy town',
            'At a top-10 ranked university',
            'Near nature & outdoor activities'
          ].map((env) => {
            const isSelected = formData.studyEnvironment.includes(env);
            const canSelect = formData.studyEnvironment.length < 3 || isSelected;
            
            return (
              <button
                key={env}
                onClick={() => handleEnvironmentSelect(env)}
                disabled={!canSelect}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : canSelect
                    ? 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {env}
                {isSelected && <span className="float-right">✓</span>}
              </button>
            );
          })}
        </div>
      </FormStep>

      {/* Step 7: Interest Keywords */}
      <FormStep
        title="I am curious about these topics"
        subtitle="Choose up to 10 keywords"
        isVisible={currentStep === 7}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Start typing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
            />
          </div>
          
          <div className="text-sm text-gray-500">
            Selected: {formData.interests.length}/10
          </div>
          
          {searchQuery && (
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-2">
              {filteredInterests.map((item) => (
                <button
                  key={item}
                  onClick={() => handleInterestSelect(item)}
                  disabled={formData.interests.length >= 10}
                  className={`w-full p-3 text-left rounded-lg transition-all ${
                    formData.interests.length >= 10
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  {item}
                </button>
              ))}
              {filteredInterests.length === 0 && (
                <div className="p-3 text-gray-500 text-center">No results found</div>
              )}
            </div>
          )}
          
          {formData.interests.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Selected interests:</div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <div
                    key={interest}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200"
                  >
                    <span>{interest}</span>
                    <button
                      onClick={() => removeInterest(interest)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          {currentStep === totalSteps ? 'Finish' : 'Next'}
          {currentStep < totalSteps && <ChevronRight size={20} className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default ProgressForm;
