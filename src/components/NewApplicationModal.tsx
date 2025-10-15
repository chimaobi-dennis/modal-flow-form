import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  GraduationCap, 
  Globe, 
  BookOpen, 
  Lightbulb,
  User,
  Sparkles,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ApplicationData) => void;
}

interface ApplicationData {
  currentDegree: string;
  customDegree?: string;
  degreeCountry: string;
  currentField: string;
  desiredFields: string[];
  interestedTopics: string[];
}

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Netherlands", 
  "Sweden", "Norway", "Denmark", "Finland", "Switzerland", "Austria", "Belgium", "Italy", 
  "Spain", "Portugal", "Ireland", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria",
  "Greece", "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Malta", "Cyprus",
  "India", "China", "Japan", "South Korea", "Singapore", "Malaysia", "Thailand", "Philippines",
  "Indonesia", "Vietnam", "Taiwan", "Hong Kong", "Pakistan", "Bangladesh", "Sri Lanka", "Nepal",
  "Brazil", "Argentina", "Chile", "Colombia", "Mexico", "Peru", "Ecuador", "Uruguay", "Venezuela",
  "South Africa", "Nigeria", "Kenya", "Ghana", "Egypt", "Morocco", "Tunisia", "Ethiopia", "Uganda",
  "Tanzania", "Zimbabwe", "Botswana", "Namibia", "Zambia", "Rwanda", "Senegal", "Ivory Coast"
];

const fieldsOfStudy = [
  "Computer Science", "Engineering", "Business Administration", "Medicine", "Law", "Psychology",
  "Biology", "Chemistry", "Physics", "Mathematics", "Economics", "Political Science", "Sociology",
  "Anthropology", "History", "Philosophy", "Literature", "Linguistics", "Art History", "Fine Arts",
  "Music", "Theater", "Film Studies", "Journalism", "Communications", "Marketing", "Finance",
  "Accounting", "International Relations", "Public Policy", "Education", "Social Work", "Nursing",
  "Pharmacy", "Dentistry", "Veterinary Medicine", "Environmental Science", "Geography", "Geology",
  "Astronomy", "Statistics", "Data Science", "Information Technology", "Cybersecurity", "Architecture",
  "Urban Planning", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
  "Chemical Engineering", "Biomedical Engineering", "Aerospace Engineering", "Industrial Engineering",
  "Materials Science", "Biotechnology", "Biochemistry", "Neuroscience", "Public Health", "Nutrition",
  "Sports Science", "Hospitality Management", "Tourism", "Agriculture", "Forestry", "Marine Biology"
];

const academicTopics = [
  "Artificial Intelligence", "Machine Learning", "Data Science", "Blockchain Technology", "Quantum Computing",
  "Renewable Energy", "Climate Change", "Sustainability", "Biotechnology", "Genetic Engineering",
  "Space Exploration", "Robotics", "Internet of Things", "Cybersecurity", "Digital Marketing",
  "Entrepreneurship", "Innovation Management", "Global Economics", "International Development",
  "Human Rights", "Social Justice", "Mental Health", "Public Health Policy", "Medical Research",
  "Drug Discovery", "Personalized Medicine", "Telemedicine", "Educational Technology", "Online Learning",
  "Virtual Reality", "Augmented Reality", "Game Development", "User Experience Design", "Digital Art",
  "Creative Writing", "Film Production", "Music Technology", "Cultural Studies", "Language Learning",
  "Translation Studies", "Archaeological Research", "Historical Preservation", "Museum Studies",
  "Library Science", "Information Systems", "Database Management", "Cloud Computing", "Software Engineering",
  "Mobile App Development", "Web Development", "Network Security", "Financial Technology", "Investment Banking",
  "Risk Management", "Insurance", "Real Estate", "Supply Chain Management", "Operations Research",
  "Quality Management", "Project Management", "Leadership Studies", "Organizational Behavior",
  "Human Resources", "Industrial Psychology", "Consumer Behavior", "Market Research", "Brand Management"
];

const NewApplicationModal: React.FC<NewApplicationModalProps> = ({ isOpen, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ApplicationData>({
    currentDegree: '',
    customDegree: '',
    degreeCountry: '',
    currentField: '',
    desiredFields: [],
    interestedTopics: []
  });

  const totalSteps = 6;

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      currentDegree: '',
      customDegree: '',
      degreeCountry: '',
      currentField: '',
      desiredFields: [],
      interestedTopics: []
    });
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    onSave(formData);
    setIsLoading(false);
    handleClose();
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return formData.currentDegree !== '';
      case 2: return formData.degreeCountry !== '';
      case 3: return formData.currentField !== '';
      case 4: return formData.desiredFields.length > 0;
      case 5: return formData.interestedTopics.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const addDesiredField = (field: string) => {
    if (formData.desiredFields.length < 3 && !formData.desiredFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        desiredFields: [...prev.desiredFields, field]
      }));
    }
  };

  const removeDesiredField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      desiredFields: prev.desiredFields.filter(f => f !== field)
    }));
  };

  const addInterestedTopic = (topic: string) => {
    if (formData.interestedTopics.length < 10 && !formData.interestedTopics.includes(topic)) {
      setFormData(prev => ({
        ...prev,
        interestedTopics: [...prev.interestedTopics, topic]
      }));
    }
  };

  const removeInterestedTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      interestedTopics: prev.interestedTopics.filter(t => t !== topic)
    }));
  };

  const getStepIcon = () => {
    const icons = [User, GraduationCap, Globe, BookOpen, BookOpen, Lightbulb];
    const Icon = icons[currentStep - 1];
    return <Icon className="h-6 w-6" />;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What's your current education level?</h3>
              <p className="text-gray-600">Tell us about your highest completed degree</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {['Bachelor Degree', 'Master Degree', 'PhD', 'Others'].map((degree) => (
                <Button
                  key={degree}
                  variant={formData.currentDegree === degree ? "default" : "outline"}
                  className={`h-16 text-left justify-start text-lg font-medium transition-all ${
                    formData.currentDegree === degree 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                      : 'hover:bg-blue-50 hover:border-blue-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, currentDegree: degree }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      formData.currentDegree === degree ? 'bg-white' : 'bg-gray-300'
                    }`} />
                    <span>{degree}</span>
                  </div>
                </Button>
              ))}
            </div>

            {formData.currentDegree === 'Others' && (
              <div className="mt-4">
                <Label htmlFor="customDegree">Please specify your degree</Label>
                <Input
                  id="customDegree"
                  placeholder="e.g., Diploma, Certificate, etc."
                  value={formData.customDegree || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customDegree: e.target.value }))}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Where did you get your {formData.currentDegree.toLowerCase()}?
              </h3>
              <p className="text-gray-600">Select the country where you completed your degree</p>
            </div>
            
            <div>
              <Label htmlFor="degreeCountry">Country</Label>
              <Select 
                value={formData.degreeCountry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, degreeCountry: value }))}
              >
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Choose your country" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country} className="text-lg py-3">
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What field did you study?</h3>
              <p className="text-gray-600">Tell us about your academic background</p>
            </div>
            
            <div>
              <Label htmlFor="currentField">Field of Study</Label>
              <Select 
                value={formData.currentField} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currentField: value }))}
              >
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select your field of study" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {fieldsOfStudy.map((field) => (
                    <SelectItem key={field} value={field} className="text-lg py-3">
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What do you want to study?</h3>
              <p className="text-gray-600">Choose up to 3 fields for your master's degree</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Selected Fields ({formData.desiredFields.length}/3)</Label>
                <div className="text-sm text-gray-500">
                  {3 - formData.desiredFields.length} remaining
                </div>
              </div>
              
              {formData.desiredFields.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg">
                  {formData.desiredFields.map((field) => (
                    <Badge 
                      key={field} 
                      variant="default" 
                      className="bg-blue-600 hover:bg-blue-700 cursor-pointer px-3 py-1"
                      onClick={() => removeDesiredField(field)}
                    >
                      {field} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <div>
                <Select 
                  value="" 
                  onValueChange={(value) => addDesiredField(value)}
                  disabled={formData.desiredFields.length >= 3}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder={
                      formData.desiredFields.length >= 3 
                        ? "Maximum 3 fields selected" 
                        : "Add a field of study"
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {fieldsOfStudy
                      .filter(field => !formData.desiredFields.includes(field))
                      .map((field) => (
                        <SelectItem key={field} value={field} className="text-lg py-3">
                          {field}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What topics interest you?</h3>
              <p className="text-gray-600">Select up to 10 academic topics you're curious about</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Selected Topics ({formData.interestedTopics.length}/10)</Label>
                <div className="text-sm text-gray-500">
                  {10 - formData.interestedTopics.length} remaining
                </div>
              </div>
              
              {formData.interestedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-purple-50 rounded-lg max-h-32 overflow-y-auto">
                  {formData.interestedTopics.map((topic) => (
                    <Badge 
                      key={topic} 
                      variant="default" 
                      className="bg-purple-600 hover:bg-purple-700 cursor-pointer px-3 py-1"
                      onClick={() => removeInterestedTopic(topic)}
                    >
                      {topic} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              <div>
                <Select 
                  value="" 
                  onValueChange={(value) => addInterestedTopic(value)}
                  disabled={formData.interestedTopics.length >= 10}
                >
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder={
                      formData.interestedTopics.length >= 10 
                        ? "Maximum 10 topics selected" 
                        : "Add an academic topic"
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {academicTopics
                      .filter(topic => !formData.interestedTopics.includes(topic))
                      .map((topic) => (
                        <SelectItem key={topic} value={topic} className="text-lg py-3">
                          {topic}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h3>
              <p className="text-gray-600">Please confirm your details before saving</p>
            </div>
            
            <Card className="border-2 border-blue-100">
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Education</Label>
                    <p className="text-lg font-semibold">
                      {formData.currentDegree}
                      {formData.customDegree && ` (${formData.customDegree})`}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Country</Label>
                    <p className="text-lg font-semibold">{formData.degreeCountry}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Current Field</Label>
                    <p className="text-lg font-semibold">{formData.currentField}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Desired Fields ({formData.desiredFields.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.desiredFields.map((field) => (
                        <Badge key={field} variant="outline" className="text-sm">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Interested Topics ({formData.interestedTopics.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
                      {formData.interestedTopics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-sm">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              {getStepIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Start New Application</h2>
              <p className="text-blue-100">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          
          <Progress 
            value={(currentStep / totalSteps) * 100} 
            className="h-2 bg-white/20"
          />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleSave}
              disabled={!isStepValid() || isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Application Profile</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewApplicationModal;