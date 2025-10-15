import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles } from 'lucide-react';

interface FormData {
  targetProgram?: string;
  wordCount: string;
  tone: string;
  deadline: string;
  specificRequirements: string;
  background: string;
  goals: string;
  achievements: string;
  challenges: string;
  whyThisProgram: string;
}

interface FormStepProps {
  documentType: string;
  data: FormData;
  onChange: (data: FormData) => void;
  programs?: any[];
}

const toneOptions = [
  { value: 'formal', label: 'Formal & Professional' },
  { value: 'academic', label: 'Academic & Scholarly' },
  { value: 'personal', label: 'Personal & Reflective' },
  { value: 'persuasive', label: 'Persuasive & Compelling' },
  { value: 'confident', label: 'Confident & Assertive' }
];

const wordCountOptions = [
  { value: '500', label: '500 words' },
  { value: '750', label: '750 words' },
  { value: '1000', label: '1000 words' },
  { value: '1500', label: '1500 words' },
  { value: '2000', label: '2000 words' },
  { value: 'custom', label: 'Custom length' }
];

export const FormStep: React.FC<FormStepProps> = ({
  documentType,
  data,
  onChange,
  programs = []
}) => {
  const [showAISuggestions, setShowAISuggestions] = useState<string | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldsForDocumentType = () => {
    const commonFields = [
      { key: 'background', label: 'Your Background', placeholder: 'Describe your educational and professional background...', type: 'textarea' },
      { key: 'goals', label: 'Career Goals', placeholder: 'What are your short-term and long-term career objectives?', type: 'textarea' },
      { key: 'achievements', label: 'Key Achievements', placeholder: 'Highlight your most significant accomplishments...', type: 'textarea' }
    ];

    const documentSpecificFields = {
      'sop': [
        ...commonFields,
        { key: 'whyThisProgram', label: 'Why This Program?', placeholder: 'Explain why you chose this specific program and institution...', type: 'textarea' },
        { key: 'challenges', label: 'Challenges Overcome', placeholder: 'Describe significant challenges you\'ve faced and how you overcame them...', type: 'textarea' }
      ],
      'personal-statement': [
        ...commonFields,
        { key: 'challenges', label: 'Personal Journey', placeholder: 'Share your personal story and what shaped your aspirations...', type: 'textarea' }
      ],
      'cover-letter': [
        { key: 'background', label: 'Relevant Experience', placeholder: 'Describe your work experience relevant to this position...', type: 'textarea' },
        { key: 'achievements', label: 'Key Accomplishments', placeholder: 'Highlight achievements that demonstrate your qualifications...', type: 'textarea' },
        { key: 'goals', label: 'Why This Role?', placeholder: 'Explain why you\'re interested in this position and company...', type: 'textarea' }
      ],
      'motivation-letter': [
        ...commonFields,
        { key: 'whyThisProgram', label: 'Motivation', placeholder: 'Explain your motivation for this opportunity...', type: 'textarea' }
      ]
    };

    return documentSpecificFields[documentType] || commonFields;
  };

  const generateAISuggestion = async (field: string) => {
    setShowAISuggestions(field);
    // Mock AI suggestion - in real app, this would call an AI API
    setTimeout(() => {
      const suggestions = {
        background: "Consider mentioning your academic journey, key coursework, research experience, and any relevant work or internship experiences that have prepared you for this next step.",
        goals: "Think about both immediate goals (what you want to achieve in the program/role) and long-term vision (where you see yourself in 5-10 years). Connect these to the opportunity you're applying for.",
        achievements: "Focus on quantifiable achievements - awards, leadership roles, projects with measurable impact, publications, or recognition you've received. Use specific numbers and outcomes when possible.",
        whyThisProgram: "Research the program's unique features, faculty, research opportunities, or resources that align with your interests. Mention specific courses, professors, or facilities that attract you.",
        challenges: "Share a meaningful challenge that demonstrates resilience, problem-solving skills, or personal growth. Focus on what you learned and how it shaped your perspective or abilities."
      };
      
      // In a real implementation, you would update the form with AI suggestions
      console.log('AI Suggestion for', field, ':', suggestions[field]);
      setShowAISuggestions(null);
    }, 1000);
  };

  const fields = getFieldsForDocumentType();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Document Details</h2>
        <p className="text-muted-foreground">
          Provide information to help us create your personalized document
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Configuration */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Document Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {programs.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="targetProgram">Target Program (Optional)</Label>
                <Select
                  value={data.targetProgram || ''}
                  onValueChange={(value) => handleChange('targetProgram', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.programName} - {program.universityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="wordCount">Target Length</Label>
              <Select
                value={data.wordCount}
                onValueChange={(value) => handleChange('wordCount', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select word count" />
                </SelectTrigger>
                <SelectContent>
                  {wordCountOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Writing Tone</Label>
              <Select
                value={data.tone}
                onValueChange={(value) => handleChange('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={data.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Specific Requirements</Label>
              <Textarea
                id="requirements"
                value={data.specificRequirements}
                onChange={(e) => handleChange('specificRequirements', e.target.value)}
                placeholder="Any specific requirements, guidelines, or formatting instructions..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Fields */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Content Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the sections below to help us create compelling content
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => generateAISuggestion(field.key)}
                    disabled={showAISuggestions === field.key}
                  >
                    {showAISuggestions === field.key ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lightbulb className="h-4 w-4" />
                    )}
                    <span className="ml-1 text-xs">AI Help</span>
                  </Button>
                </div>
                
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={data[field.key] || ''}
                    onChange={(e) => handleChange(field.key as keyof FormData, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={data[field.key] || ''}
                    onChange={(e) => handleChange(field.key as keyof FormData, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {field.type === 'textarea' && `${(data[field.key] || '').length}/500 characters`}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Document Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium capitalize">{documentType.replace('-', ' ')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Length:</span>
              <p className="font-medium">{data.wordCount} words</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tone:</span>
              <p className="font-medium">{toneOptions.find(t => t.value === data.tone)?.label || 'Not selected'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Progress:</span>
              <p className="font-medium">
                {Math.round((Object.values(data).filter(v => v && v.length > 0).length / Object.keys(data).length) * 100)}% complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};