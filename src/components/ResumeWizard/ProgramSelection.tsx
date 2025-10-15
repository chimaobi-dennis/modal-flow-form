import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Briefcase, Plus, ExternalLink } from 'lucide-react';
import { useAdmissionSteps } from '@/hooks/useAdmissionSteps';

interface ProgramSelectionProps {
  onProgramSelect: (program: any) => void;
  selectedProgram?: any;
  resumeType: 'job' | 'program' | 'general';
  onResumeTypeChange: (type: 'job' | 'program' | 'general') => void;
}

export const ProgramSelection: React.FC<ProgramSelectionProps> = ({
  onProgramSelect,
  selectedProgram,
  resumeType,
  onResumeTypeChange
}) => {
  const [jobUrl, setJobUrl] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const { applications } = useAdmissionSteps();

  const handleJobUrlSubmit = () => {
    if (jobUrl) {
      onProgramSelect({
        id: 'job-url',
        type: 'job',
        name: 'Job from URL',
        url: jobUrl,
        company: 'External Company',
        title: 'Position from URL'
      });
    }
  };

  const handleCustomJobSubmit = () => {
    if (customJobTitle && customCompany) {
      onProgramSelect({
        id: 'custom-job',
        type: 'job',
        name: `${customJobTitle} at ${customCompany}`,
        company: customCompany,
        title: customJobTitle
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">What's this resume for?</h2>
        <p className="text-muted-foreground">
          Choose the purpose to help us optimize your resume content
        </p>
      </div>

      {/* Resume Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            resumeType === 'job' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
          }`}
          onClick={() => onResumeTypeChange('job')}
        >
          <CardHeader className="text-center pb-2">
            <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Job Application</CardTitle>
            <p className="text-sm text-muted-foreground">Optimize for a specific job position</p>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            resumeType === 'program' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
          }`}
          onClick={() => onResumeTypeChange('program')}
        >
          <CardHeader className="text-center pb-2">
            <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">Program Application</CardTitle>
            <p className="text-sm text-muted-foreground">Tailor for university programs</p>
          </CardHeader>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            resumeType === 'general' ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
          }`}
          onClick={() => onResumeTypeChange('general')}
        >
          <CardHeader className="text-center pb-2">
            <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">General Resume</CardTitle>
            <p className="text-sm text-muted-foreground">Create a versatile resume</p>
          </CardHeader>
        </Card>
      </div>

      {/* Conditional Content Based on Type */}
      {resumeType === 'job' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Job URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste job posting URL (LinkedIn, Indeed, etc.)"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleJobUrlSubmit} disabled={!jobUrl}>
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-muted-foreground">
            <span>or</span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Manual Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Job Title"
                  value={customJobTitle}
                  onChange={(e) => setCustomJobTitle(e.target.value)}
                />
                <Input
                  placeholder="Company Name"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleCustomJobSubmit} 
                disabled={!customJobTitle || !customCompany}
                className="w-full"
              >
                Create Job-Targeted Resume
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {resumeType === 'program' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Program</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedProgram?.id || ''} 
                onValueChange={(value) => {
                  const program = applications.find(app => app.id === value);
                  if (program) onProgramSelect(program);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose from your applications" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span>{app.programName} - {app.universityName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}

      {resumeType === 'general' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="p-6 bg-muted rounded-lg">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">General Resume</h3>
                <p className="text-muted-foreground">
                  We'll create a versatile resume that you can use for multiple applications.
                  You can always customize it later for specific opportunities.
                </p>
              </div>
              <Button 
                onClick={() => onProgramSelect({ type: 'general', name: 'General Resume' })}
                className="w-full"
              >
                Continue with General Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedProgram && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Selected Target:</h4>
                <p className="text-sm text-muted-foreground">{selectedProgram.name}</p>
              </div>
              <Badge variant="secondary">
                {selectedProgram.type === 'job' ? 'Job' : selectedProgram.type === 'program' ? 'Program' : 'General'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};