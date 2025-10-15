import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Code, Languages, Award, Wrench } from 'lucide-react';
import DocumentApi from '@/lib/documentApi';
// Laravel passes user id into the Blade root element as data-user-id
const userIdAttr = typeof document !== 'undefined'
  ? document.getElementById('root')?.getAttribute('data-user-id')
  : undefined;
const sessionUserId = userIdAttr ? Number(userIdAttr) : undefined;

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface SkillsData {
  technicalSkills: Skill[];
  softSkills: string[];
  languages: Skill[];
  certifications: string[];
}

interface SkillsStepProps {
  data: SkillsData;
  onChange: (data: SkillsData) => void;
  // Optional extras to enable final save action directly from Skills step
  onBuild?: (payload: any) => Promise<void> | void;
  applicationId?: number;
  user_id?: number;
  programId?: number;
  templateId?: number;
  title?: string; // Suggested document title
  category?: string; // "cv" | "cover_letter" | ...
  resumeSnapshot?: any; // full resume form snapshot: personalInfo, experiences, educations, etc.
}

const commonTechnicalSkills = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'MongoDB',
  'Git', 'Docker', 'AWS', 'Azure', 'Kubernetes', 'HTML/CSS', 'TypeScript',
  'Angular', 'Vue.js', 'Spring Boot', 'Django', 'Express.js', 'PostgreSQL',
  'Redis', 'GraphQL', 'REST APIs', 'Microservices', 'Machine Learning',
  'Data Analysis', 'Tableau', 'Excel', 'Photoshop', 'Figma', 'Sketch'
];

const commonSoftSkills = [
  'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management',
  'Critical Thinking', 'Adaptability', 'Project Management', 'Analytical Thinking',
  'Creativity', 'Attention to Detail', 'Customer Service', 'Negotiation',
  'Public Speaking', 'Conflict Resolution', 'Mentoring', 'Strategic Planning'
];

const commonLanguages = [
  'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 'Japanese',
  'Korean', 'Portuguese', 'Italian', 'Dutch', 'Russian', 'Arabic', 'Hindi'
];

export const SkillsStep: React.FC<SkillsStepProps> = ({ data, onChange, applicationId, programId, templateId, title, category = 'cv', resumeSnapshot, onBuild }) => {
  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const addTechnicalSkill = () => {
    if (newTechnicalSkill && !data.technicalSkills.find(s => s.name === newTechnicalSkill)) {
      onChange({
        ...data,
        technicalSkills: [...data.technicalSkills, { name: newTechnicalSkill, level: 'Intermediate' }]
      });
      setNewTechnicalSkill('');
    }
  };

  const removeTechnicalSkill = (skillName: string) => {
    onChange({
      ...data,
      technicalSkills: data.technicalSkills.filter(s => s.name !== skillName)
    });
  };

  const updateTechnicalSkillLevel = (skillName: string, level: Skill['level']) => {
    onChange({
      ...data,
      technicalSkills: data.technicalSkills.map(s => 
        s.name === skillName ? { ...s, level } : s
      )
    });
  };

  const addSoftSkill = () => {
    if (newSoftSkill && !data.softSkills.includes(newSoftSkill)) {
      onChange({
        ...data,
        softSkills: [...data.softSkills, newSoftSkill]
      });
      setNewSoftSkill('');
    }
  };

  const removeSoftSkill = (skill: string) => {
    onChange({
      ...data,
      softSkills: data.softSkills.filter(s => s !== skill)
    });
  };

  const addLanguage = () => {
    if (newLanguage && !data.languages.find(l => l.name === newLanguage)) {
      onChange({
        ...data,
        languages: [...data.languages, { name: newLanguage, level: 'Intermediate' }]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (languageName: string) => {
    onChange({
      ...data,
      languages: data.languages.filter(l => l.name !== languageName)
    });
  };

  const updateLanguageLevel = (languageName: string, level: Skill['level']) => {
    onChange({
      ...data,
      languages: data.languages.map(l => 
        l.name === languageName ? { ...l, level } : l
      )
    });
  };

  const addCertification = () => {
    if (newCertification && !data.certifications.includes(newCertification)) {
      onChange({
        ...data,
        certifications: [...data.certifications, newCertification]
      });
      setNewCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    onChange({
      ...data,
      certifications: data.certifications.filter(c => c !== certification)
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-red-100 text-red-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Expert': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Skills & Certifications</h2>
        <p className="text-muted-foreground">
          Showcase your technical skills, soft skills, languages, and certifications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Technical Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={newTechnicalSkill} onValueChange={setNewTechnicalSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select or type a skill" />
                </SelectTrigger>
                <SelectContent>
                  {commonTechnicalSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addTechnicalSkill} disabled={!newTechnicalSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Input
              value={newTechnicalSkill}
              onChange={(e) => setNewTechnicalSkill(e.target.value)}
              placeholder="Or type a custom skill"
              onKeyPress={(e) => e.key === 'Enter' && addTechnicalSkill()}
            />

            <div className="space-y-2">
              {data.technicalSkills.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between gap-2 p-2 border rounded">
                  <span className="font-medium">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={skill.level} 
                      onValueChange={(level) => updateTechnicalSkillLevel(skill.name, level as Skill['level'])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={getLevelColor(skill.level)}>
                      {skill.level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTechnicalSkill(skill.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Soft Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Soft Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={newSoftSkill} onValueChange={setNewSoftSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a soft skill" />
                </SelectTrigger>
                <SelectContent>
                  {commonSoftSkills.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addSoftSkill} disabled={!newSoftSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Input
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              placeholder="Or type a custom soft skill"
              onKeyPress={(e) => e.key === 'Enter' && addSoftSkill()}
            />

            <div className="flex flex-wrap gap-2">
              {data.softSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeSoftSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={newLanguage} onValueChange={setNewLanguage}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {commonLanguages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addLanguage} disabled={!newLanguage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Or type a custom language"
              onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
            />

            <div className="space-y-2">
              {data.languages.map((language) => (
                <div key={language.name} className="flex items-center justify-between gap-2 p-2 border rounded">
                  <span className="font-medium">{language.name}</span>
                  <div className="flex items-center gap-2">
                    <Select 
                      value={language.level} 
                      onValueChange={(level) => updateLanguageLevel(language.name, level as Skill['level'])}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Expert">Native</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={getLevelColor(language.level)}>
                      {language.level === 'Expert' ? 'Native' : language.level}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(language.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                placeholder="e.g., AWS Certified Solutions Architect"
                onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                className="flex-1"
              />
              <Button onClick={addCertification} disabled={!newCertification}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {data.certifications.map((certification) => (
                <div key={certification} className="flex items-center justify-between gap-2 p-2 border rounded">
                  <span className="font-medium">{certification}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(certification)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Finalize and build */}
      <div className="pt-4 flex justify-end">
        <BuildResumeButton
          data={data}
          onBuild={onBuild as any}
          applicationId={applicationId}
          programId={programId}
          templateId={templateId}
          title={title}
          category={category}
          resumeSnapshot={resumeSnapshot}
        />
      </div>
    </div>
  );
};

// Internal action button to avoid breaking existing external props API
const BuildResumeButton: React.FC<{ 
  data: SkillsData; 
  onBuild?: (payload: any) => Promise<void> | void; 
  applicationId?: number;
  programId?: number;
  templateId?: number;
  title?: string;
  category?: string;
  resumeSnapshot?: any;
}> = ({ data, onBuild, applicationId, programId, templateId, title = 'My Resume', category = 'cv', resumeSnapshot }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Read optional config injected on the window by parent wizard (fallback approach)
  const wizardConfig: any = (window as any).__RESUME_WIZARD_CONFIG__ || {};
  const appId = applicationId ?? wizardConfig.applicationId ?? undefined;
  const progId = programId ?? wizardConfig.programId ?? undefined;
  const tplId = templateId ?? wizardConfig.templateId ?? undefined;
  const docTitle = title ?? wizardConfig.title ?? 'My Resume';
  const docCategory = category ?? wizardConfig.category ?? 'cv';
  const snapshot = resumeSnapshot ?? wizardConfig.resumeSnapshot ?? {};

  // Map wizard snapshot to ResumeBuilder's unified resumeData shape
  const buildResumeData = () => {
    const personal = (snapshot as any)?.personalInfo || {};
    const experiences = (snapshot as any)?.experiences || [];
    const educations = (snapshot as any)?.educations || [];
    const softSkills = (data?.softSkills || []).map((s) => String(s));
    const technicalSkills = (data?.technicalSkills || []).map((s) => ({ name: String(s.name), level: s.level }));
    const languages = (data?.languages || []).map((l) => ({ name: String(l.name), level: l.level }));
    const certifications = (data?.certifications || []).map((c) => String(c));

    return {
      basics: {
        fullName: [personal.firstName, personal.lastName].filter(Boolean).join(' ').trim(),
        headline: String((personal as any)?.headline || ''),
        email: String(personal.email || ''),
        phone: String(personal.phone || ''),
        website: String(personal.website || ''),
        location: String(personal.location || ''),
        picture: String((personal as any)?.picture || '')
      },
      summary: String(personal.summary || ''),
      profile: {},
      experience: (experiences as any[]).map((e) => ({
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
      education: (educations as any[]).map((ed) => ({
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
      skills: technicalSkills,
      softSkills,
      languages,
      awards: [],
      certifications,
      interests: [],
      projects: Array.isArray((snapshot as any)?.projects) ? (snapshot as any).projects : [],
      publications: Array.isArray((snapshot as any)?.publications) ? (snapshot as any).publications : [],
      volunteering: Array.isArray((snapshot as any)?.volunteering) ? (snapshot as any).volunteering : [],
      custom: []
    };
  };

  // Provide sane defaults consistent with ResumeBuilder
  const defaultTheme = { primary: '#2563eb', secondary: '#64748b', accent: '#0ea5e9' };
  const defaultTypography = { fontFamily: 'Inter', fontSize: 14, lineHeight: 1.5, letterSpacing: 0 } as const;
  const defaultPageSettings = { format: 'A4', margins: { top: 10, bottom: 10, left: 10, right: 10 }, columns: '1', lineSpacing: 1.5 } as const;

  const handleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      // Build unified content payload matching ResumeBuilder
      const resumeDataUnified = buildResumeData();
      const content: any = {
        theme: defaultTheme,
        typography: defaultTypography,
        pageSettings: defaultPageSettings,
        content: { ...resumeDataUnified }
      };
      // Debug: verify outgoing payload structure
      try { console.debug('[ResumeWizard] Build payload (unified):', content); } catch {}

      // If parent provided a custom build handler via prop or global config, pass the unified payload
      if (typeof onBuild === 'function') {
        try { console.debug('[ResumeWizard] Using custom onBuild handler'); } catch {}
        await onBuild({ content, applicationId: appId, programId: progId, templateId: tplId, title: docTitle, category: docCategory, unified: true });
        setLoading(false);
        return;
      }
      if (typeof wizardConfig.onBuild === 'function') {
        try { console.debug('[ResumeWizard] Using global wizardConfig.onBuild handler'); } catch {}
        await wizardConfig.onBuild({ content, applicationId: appId, programId: progId, templateId: tplId, title: docTitle, category: docCategory, unified: true });
        setLoading(false);
        return;
      }

      let doc: any;
      if (appId && progId) {
        // Save linked to a specific application/program
        try { console.debug('[ResumeWizard] Creating document linked to app/program'); } catch {}
        doc = await DocumentApi.createDocument(
          Number(appId),
          Number(progId),
          ({
            title: docTitle,
            category: docCategory,
            type: 'document',
            template_id: tplId || undefined,
            content,
            language: 'en',
          } as any)
        );
      } else {
        // General save (no application/program)
        try { console.debug('[ResumeWizard] Saving general document'); } catch {}
        doc = await DocumentApi.saveDocument({
          user_id: sessionUserId,
          title: docTitle,
          category: docCategory,
          type: 'document',
          template_id: tplId || undefined,
          content,
          language: 'en',
          application_id: appId ?? null,
          program_id: progId ?? null,
        } as any);
      }
      const docId = (doc as any)?.id;
      if (!docId) {
        throw new Error('Document saved but no ID returned.');
      }
      // Navigate to Resume Edit page (requested route)
      window.location.assign(`/user/document/edit-resume?id=${docId}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to build resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 w-full">
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all disabled:opacity-60"
      >
        {loading ? 'Building…' : 'Build my resume'}
      </button>
    </div>
  );
};