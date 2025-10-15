import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Edit3, Share2, FileText, Check } from 'lucide-react';
import { TemplateSelection } from './TemplateSelection';
import { ProgramSelection } from './ProgramSelection';
import { PersonalInfoStep } from './PersonalInfoStep';
import { ExperienceStep } from './ExperienceStep';
import { EducationStep } from './EducationStep';
import { SkillsStep } from './SkillsStep';
import DocumentApi from '@/lib/documentApi';

interface ResumeData {
  template: any;
  targetProgram: any;
  resumeType: 'job' | 'program' | 'general';
  personalInfo: any;
  experiences: any[];
  educations: any[];
  skills: any;
}

export const ResumeBuilder: React.FC = () => {
  // Lazy initializer helpers
  const getUrl = () => {
    try { return new URL(window.location.href); } catch { return null as unknown as URL; }
  };
  const initSessionId = () => {
    const url = getUrl();
    const existing = url?.searchParams.get('rb');
    return existing || Math.random().toString(36).slice(2, 10);
  };
  const initApplicationId = () => {
    try {
      const url = getUrl();
      const appParam = url?.searchParams.get('appId') || url?.searchParams.get('application_id');
      const parsed = appParam ? parseInt(appParam, 10) : NaN;
      return Number.isNaN(parsed) ? null : parsed;
    } catch { return null as unknown as number | null; }
  };
  const initResumeData = (): ResumeData => {
    const base: ResumeData = {
      template: null,
      targetProgram: null,
      resumeType: 'general',
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        summary: ''
      },
      experiences: [],
      educations: [],
      skills: { technicalSkills: [], softSkills: [], languages: [], certifications: [] }
    };
    try {
      const url = getUrl();
      const sid = url?.searchParams.get('rb');
      if (sid) {
        const saved = localStorage.getItem(`resumeBuilder:${sid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.resumeData) return parsed.resumeData as ResumeData;
        }
      }
    } catch {}
    return base;
  };
  const initCurrentStep = () => {
    try {
      const url = getUrl();
      const sid = url?.searchParams.get('rb');
      if (sid) {
        const saved = localStorage.getItem(`resumeBuilder:${sid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.currentStep) return Number(parsed.currentStep) || 1;
        }
      }
      const stepParam = parseInt(url?.searchParams.get('step') || '1', 10);
      return !Number.isNaN(stepParam) && stepParam >= 1 ? stepParam : 1;
    } catch { return 1; }
  };

  // Persistence: session id in URL and localStorage state
  const [sessionId] = useState<string>(() => initSessionId());
  const [currentStep, setCurrentStep] = useState<number>(() => initCurrentStep());
  const [resumeData, setResumeData] = useState<ResumeData>(() => initResumeData());
  const [applicationId] = useState<number | null>(() => initApplicationId());
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Persist on changes: save to localStorage and sync URL (step, tpl)
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem(
        `resumeBuilder:${sessionId}`,
        JSON.stringify({ currentStep, resumeData })
      );

      const url = new URL(window.location.href);
      const params = url.searchParams;
      params.set('rb', sessionId);
      params.set('step', String(currentStep));
      // store lightweight template info if available
      if (resumeData?.template?.id) {
        params.set('tpl', String(resumeData.template.id));
      } else {
        params.delete('tpl');
      }
      if (applicationId) {
        params.set('appId', String(applicationId));
      }
      window.history.replaceState({}, '', `${url.pathname}?${params.toString()}${url.hash}`);
    } catch {
      // ignore persistence errors
    }
  }, [sessionId, currentStep, resumeData, applicationId]);

  const steps = [
    { id: 1, title: 'Template', description: 'Choose your design' },
    { id: 2, title: 'Target', description: 'Job or program focus' },
    { id: 3, title: 'Personal Info', description: 'Contact details' },
    { id: 4, title: 'Experience', description: 'Work history' },
    { id: 5, title: 'Education', description: 'Academic background' },
    { id: 6, title: 'Skills', description: 'Technical, languages, more' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return resumeData.template !== null;
      case 2: return true; // Program is optional; can be general/job-focused
      case 3: return resumeData.personalInfo.firstName && resumeData.personalInfo.lastName && resumeData.personalInfo.email;
      case 4: return true; // Optional step
      case 5: return true; // Optional step
      case 6: return true; // Optional step
      default: return true;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const programId =
        resumeData.resumeType === 'program' && resumeData?.targetProgram?.id
          ? Number(resumeData.targetProgram.id)
          : null;
      const templateId = resumeData?.template?.id && !Number.isNaN(Number(resumeData.template.id))
        ? Number(resumeData.template.id)
        : undefined;
      const titleBase = `${resumeData.personalInfo?.firstName || ''} ${resumeData.personalInfo?.lastName || ''}`.trim();
      const title = titleBase ? `${titleBase} - Resume` : 'Resume';

      // Map wizard resumeData to unified structure expected by Resume Edit
      const toUnified = () => {
        const p = resumeData.personalInfo || {};
        const experiences = Array.isArray(resumeData.experiences) ? resumeData.experiences : [];
        const educations = Array.isArray(resumeData.educations) ? resumeData.educations : [];
        const skillsBlock = resumeData.skills || { technicalSkills: [], softSkills: [], languages: [], certifications: [] };
        return {
          basics: {
            fullName: [p.firstName, p.lastName].filter(Boolean).join(' ').trim(),
            headline: String(p.headline || ''),
            email: String(p.email || ''),
            phone: String(p.phone || ''),
            website: String(p.website || ''),
            location: String(p.location || ''),
            picture: String(p.picture || '')
          },
          summary: String(p.summary || ''),
          profile: {},
          experience: experiences.map((e: any) => ({
            id: e.id,
            jobTitle: e.jobTitle,
            company: e.company,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,
            isCurrentRole: e.isCurrentRole,
            description: e.description,
            achievements: Array.isArray(e.achievements) ? e.achievements : []
          })),
          education: educations.map((ed: any) => ({
            id: ed.id,
            degree: ed.degree,
            major: ed.major,
            institution: ed.institution,
            location: ed.location,
            graduationDate: ed.graduationDate,
            gpa: ed.gpa,
            relevantCoursework: Array.isArray(ed.relevantCoursework) ? ed.relevantCoursework : [],
            achievements: Array.isArray(ed.achievements) ? ed.achievements : []
          })),
          skills: (skillsBlock.technicalSkills || []).map((s: any) => ({ name: String(s.name), level: s.level })),
          softSkills: (skillsBlock.softSkills || []).map((s: any) => String(s)),
          languages: (skillsBlock.languages || []).map((l: any) => ({ name: String(l.name), level: l.level })),
          awards: [],
          certifications: (skillsBlock.certifications || []).map((c: any) => String(c)),
          interests: [],
          projects: Array.isArray((resumeData as any).projects) ? (resumeData as any).projects : [],
          publications: Array.isArray((resumeData as any).publications) ? (resumeData as any).publications : [],
          volunteering: Array.isArray((resumeData as any).volunteering) ? (resumeData as any).volunteering : [],
          custom: []
        };
      };

      const defaultTheme = { primary: '#2563eb', secondary: '#64748b', accent: '#0ea5e9' };
      const defaultTypography = { fontFamily: 'Inter', fontSize: 14, lineHeight: 1.5, letterSpacing: 0 } as const;
      const defaultPageSettings = { format: 'A4', margins: { top: 10, bottom: 10, left: 10, right: 10 }, columns: '1', lineSpacing: 1.5 } as const;

      const content = {
        theme: defaultTheme,
        typography: defaultTypography,
        pageSettings: defaultPageSettings,
        content: { ...toUnified() },
      };

      await DocumentApi.saveDocument({
        title,
        category: 'cv',
        type: 'document',
        template_id: templateId,
        content,
        metadata: {
          resumeType: resumeData.resumeType,
          targetProgram: resumeData.targetProgram ? {
            id: resumeData.targetProgram.id,
            name: resumeData.targetProgram.name,
          } : null,
          sessionId,
        },
        language: 'en',
        application_id: applicationId ?? null,
        program_id: programId,
      });
      setLastSaved(new Date());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save resume', e);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TemplateSelection
            selectedTemplate={resumeData.template}
            onTemplateSelect={(template) => setResumeData({ ...resumeData, template })}
            onProceed={() => setCurrentStep(2)}
          />
        );
      case 2:
        return (
          <ProgramSelection
            selectedProgram={resumeData.targetProgram}
            onProgramSelect={(program) => setResumeData({ ...resumeData, targetProgram: program })}
            resumeType={resumeData.resumeType}
            onResumeTypeChange={(type) => setResumeData({ ...resumeData, resumeType: type })}
          />
        );
      case 3:
        return (
          <PersonalInfoStep
            data={resumeData.personalInfo}
            onChange={(personalInfo) => setResumeData({ ...resumeData, personalInfo })}
          />
        );
      case 4:
        return (
          <ExperienceStep
            experiences={resumeData.experiences}
            onChange={(experiences) => setResumeData({ ...resumeData, experiences })}
          />
        );
      case 5:
        return (
          <EducationStep
            educations={resumeData.educations}
            onChange={(educations) => setResumeData({ ...resumeData, educations })}
          />
        );
      case 6:
        return (
          <SkillsStep
            data={resumeData.skills}
            onChange={(skills) => setResumeData({ ...resumeData, skills })}
            // Provide full snapshot so Build button can save everything
            resumeSnapshot={resumeData}
            applicationId={applicationId ?? undefined}
            programId={resumeData.resumeType === 'program' ? (resumeData.targetProgram?.id ?? undefined) : undefined}
            templateId={resumeData?.template?.id ? Number(resumeData.template.id) : undefined}
            title={`${(resumeData.personalInfo?.firstName || '').trim()} ${(resumeData.personalInfo?.lastName || '').trim()}`.trim() ? `${(resumeData.personalInfo?.firstName || '').trim()} ${(resumeData.personalInfo?.lastName || '').trim()} - Resume` : 'My Resume'}
            category="cv"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Stepper */}
      <div className="p-4 bg-gray-100 dark:bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg">
        <div className="relative">
          <div className="flex items-center overflow-x-auto px-2">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              const connectorCompleted = currentStep >= step.id; // connector before this step
              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                        connectorCompleted ? 'bg-primary' : 'bg-border/40'
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className="flex flex-col items-center min-w-[90px] focus:outline-none group"
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div
                      className={`relative flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-sm transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-[0_0_0_3px_rgba(59,130,246,0.2)] border-primary/70 scale-[1.03]'
                          : isCompleted
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-background/60 text-muted-foreground border-border/50 hover:border-primary/50'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-semibold">{step.id}</span>
                      )}
                      {isActive && <span className="absolute -bottom-1.5 w-2 h-2 rounded-full bg-primary/80" />}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium transition-colors ${
                        isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>{step.title}</div>
                      <div className="hidden md:block text-[11px] text-muted-foreground">{step.description}</div>
                    </div>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-card/50 backdrop-blur-sm border border-border/30 rounded-lg">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="border-border/50 hover:bg-muted/50"
        >
          Back
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
          {lastSaved && (
            <span className="ml-3 text-xs">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        
        {currentStep === steps.length ? (
          <Button
            onClick={handleSave}
            disabled={isSaving || !canProceed()}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? 'Saving...' : 'Save Resume'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-primary hover:bg-primary/90"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};