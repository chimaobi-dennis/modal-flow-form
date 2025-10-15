
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, User, Phone, MapPin, GraduationCap, Briefcase, DollarSign, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  fullName: string;
  phoneNumber: string;
  citizenship: string;
  englishTest: string;
  testType: string;
  testYear: string;
  testScore: string;
  workExperience: string;
  tuitionPreference: string;
  acceptTerms: boolean;
  acceptDataProcessing: boolean;
}

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh',
  'Belgium', 'Brazil', 'Canada', 'China', 'Denmark', 'Egypt', 'Finland', 'France',
  'Germany', 'India', 'Indonesia', 'Iran', 'Iraq', 'Italy', 'Japan', 'Kenya',
  'Malaysia', 'Mexico', 'Netherlands', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
  'Poland', 'Russia', 'Saudi Arabia', 'South Africa', 'South Korea', 'Spain',
  'Sweden', 'Thailand', 'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam'
];

const englishTests = [
  'IELTS', 'TOEFL', 'PTE Academic', 'Cambridge English', 'Duolingo English Test'
];

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: 'John Doe', // Pre-filled from user profile
    phoneNumber: '+1 234 567 8900', // Pre-filled from user profile
    citizenship: '',
    englishTest: '',
    testType: '',
    testYear: '',
    testScore: '',
    workExperience: '',
    tuitionPreference: '',
    acceptTerms: false,
    acceptDataProcessing: false,
  });

  const totalSteps = 7;

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
      toast.success(`Step ${currentStep} completed!`);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.fullName.trim()) {
          toast.error('Full name is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.phoneNumber.trim()) {
          toast.error('Phone number is required');
          return false;
        }
        return true;
      case 3:
        if (!formData.citizenship) {
          toast.error('Please select your citizenship');
          return false;
        }
        return true;
      case 4:
        if (!formData.englishTest) {
          toast.error('Please answer the English test question');
          return false;
        }
        if (formData.englishTest === 'yes') {
          if (!formData.testType || !formData.testYear || !formData.testScore) {
            toast.error('Please provide all English test details');
            return false;
          }
        }
        return true;
      case 5:
        if (!formData.workExperience) {
          toast.error('Please select your work experience');
          return false;
        }
        return true;
      case 6:
        if (!formData.tuitionPreference) {
          toast.error('Please select your tuition preference');
          return false;
        }
        return true;
      case 7:
        if (!formData.acceptTerms || !formData.acceptDataProcessing) {
          toast.error('Please accept all terms and conditions');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      toast.success('Application form submitted successfully!');
      toast.info('Redirecting to pathway selection...');
      onClose();
      setTimeout(() => {
        navigate('/pathway-selection');
      }, 1000);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="h-4 w-4" />;
      case 2: return <Phone className="h-4 w-4" />;
      case 3: return <MapPin className="h-4 w-4" />;
      case 4: return <GraduationCap className="h-4 w-4" />;
      case 5: return <Briefcase className="h-4 w-4" />;
      case 6: return <DollarSign className="h-4 w-4" />;
      case 7: return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <User className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <p className="text-sm text-gray-600">Let's start with your basic details</p>
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">This information is from your profile</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Phone className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-gray-600">Verify your contact details</p>
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                disabled
                className="bg-gray-50"
              />
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-blue-500"
                onClick={() => {
                  toast.info('Redirecting to profile to update phone number...');
                  // This would navigate to profile
                }}
              >
                Update in profile
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <MapPin className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold">Citizenship</h3>
              <p className="text-sm text-gray-600">Select your country of citizenship</p>
            </div>
            <div>
              <Label htmlFor="citizenship">Country of Citizenship</Label>
              <Select value={formData.citizenship} onValueChange={(value) => updateFormData('citizenship', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <GraduationCap className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold">English Proficiency</h3>
              <p className="text-sm text-gray-600">Tell us about your English test experience</p>
            </div>
            <div>
              <Label>Have you taken any English test in the past 5 years?</Label>
              <RadioGroup 
                value={formData.englishTest} 
                onValueChange={(value) => updateFormData('englishTest', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.englishTest === 'yes' && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="testType">Which test did you take?</Label>
                  <Select value={formData.testType} onValueChange={(value) => updateFormData('testType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      {englishTests.map((test) => (
                        <SelectItem key={test} value={test}>
                          {test}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="testYear">Test Year</Label>
                  <Input
                    id="testYear"
                    type="number"
                    placeholder="e.g., 2023"
                    value={formData.testYear}
                    onChange={(e) => updateFormData('testYear', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="testScore">Test Score</Label>
                  <Input
                    id="testScore"
                    placeholder="e.g., 7.5 (IELTS) or 100 (TOEFL)"
                    value={formData.testScore}
                    onChange={(e) => updateFormData('testScore', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <Briefcase className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <p className="text-sm text-gray-600">How many years of work experience do you have?</p>
            </div>
            <RadioGroup 
              value={formData.workExperience} 
              onValueChange={(value) => updateFormData('workExperience', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0-1" id="0-1" />
                <Label htmlFor="0-1">0-1 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2-3" id="2-3" />
                <Label htmlFor="2-3">2-3 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4-6" id="4-6" />
                <Label htmlFor="4-6">4-6 years</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7+" id="7+" />
                <Label htmlFor="7+">7+ years</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <DollarSign className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <h3 className="text-lg font-semibold">Tuition Preference</h3>
              <p className="text-sm text-gray-600">What's your preference for tuition fees?</p>
            </div>
            <RadioGroup 
              value={formData.tuitionPreference} 
              onValueChange={(value) => updateFormData('tuitionPreference', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low cost programs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no-matter" id="no-matter" />
                <Label htmlFor="no-matter">Cost doesn't matter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high-quality" id="high-quality" />
                <Label htmlFor="high-quality">High cost with quality education</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <h3 className="text-lg font-semibold">Review & Accept</h3>
              <p className="text-sm text-gray-600">Please review your information and accept our terms</p>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Application Summary:</h4>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>
                <p><span className="font-medium">Citizenship:</span> {formData.citizenship}</p>
                <p><span className="font-medium">English Test:</span> {formData.englishTest === 'yes' ? `${formData.testType} (${formData.testYear}) - Score: ${formData.testScore}` : 'Not taken'}</p>
                <p><span className="font-medium">Work Experience:</span> {formData.workExperience} years</p>
                <p><span className="font-medium">Tuition Preference:</span> {formData.tuitionPreference}</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => updateFormData('acceptTerms', checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I accept the Terms and Conditions and understand the application process requirements.
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="data"
                  checked={formData.acceptDataProcessing}
                  onCheckedChange={(checked) => updateFormData('acceptDataProcessing', checked as boolean)}
                />
                <Label htmlFor="data" className="text-sm leading-relaxed">
                  I consent to the processing of my personal data for the purpose of this application and future communications.
                </Label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStepIcon(currentStep)}
            Application Form - Step {currentStep} of {totalSteps}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              Submit Application
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationFormModal;
