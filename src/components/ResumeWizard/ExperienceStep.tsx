import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Briefcase, Calendar } from 'lucide-react';

interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentRole: boolean;
  description: string;
  achievements: string[];
}

interface ExperienceStepProps {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({ experiences, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentRole: false,
      description: '',
      achievements: ['']
    };
    onChange([...experiences, newExperience]);
    setExpandedId(newExperience.id);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange(experiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const deleteExperience = (id: string) => {
    onChange(experiences.filter(exp => exp.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addAchievement = (expId: string) => {
    const exp = experiences.find(e => e.id === expId);
    if (exp) {
      updateExperience(expId, 'achievements', [...exp.achievements, '']);
    }
  };

  const updateAchievement = (expId: string, index: number, value: string) => {
    const exp = experiences.find(e => e.id === expId);
    if (exp) {
      const newAchievements = [...exp.achievements];
      newAchievements[index] = value;
      updateExperience(expId, 'achievements', newAchievements);
    }
  };

  const removeAchievement = (expId: string, index: number) => {
    const exp = experiences.find(e => e.id === expId);
    if (exp && exp.achievements.length > 1) {
      const newAchievements = exp.achievements.filter((_, i) => i !== index);
      updateExperience(expId, 'achievements', newAchievements);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
        <p className="text-muted-foreground">
          Add your professional experience, starting with the most recent
        </p>
      </div>

      <div className="space-y-4">
        {experiences.map((experience, index) => (
          <Card key={experience.id} className="relative">
            <CardHeader className="cursor-pointer" onClick={() => 
              setExpandedId(expandedId === experience.id ? null : experience.id)
            }>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {experience.jobTitle || 'New Position'}
                    </CardTitle>
                    {experience.company && (
                      <p className="text-sm text-muted-foreground">
                        {experience.company} • {experience.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {experience.startDate && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {experience.startDate} - {experience.isCurrentRole ? 'Present' : experience.endDate}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteExperience(experience.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedId === experience.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`jobTitle-${experience.id}`}>Job Title</Label>
                    <Input
                      id={`jobTitle-${experience.id}`}
                      value={experience.jobTitle}
                      onChange={(e) => updateExperience(experience.id, 'jobTitle', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`company-${experience.id}`}>Company</Label>
                    <Input
                      id={`company-${experience.id}`}
                      value={experience.company}
                      onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                      placeholder="Tech Company Inc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`location-${experience.id}`}>Location</Label>
                  <Input
                    id={`location-${experience.id}`}
                    value={experience.location}
                    onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
                    <Input
                      id={`startDate-${experience.id}`}
                      type="month"
                      value={experience.startDate}
                      onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
                    <Input
                      id={`endDate-${experience.id}`}
                      type="month"
                      value={experience.endDate}
                      onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                      disabled={experience.isCurrentRole}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`current-${experience.id}`}
                    checked={experience.isCurrentRole}
                    onCheckedChange={(checked) => {
                      updateExperience(experience.id, 'isCurrentRole', checked);
                      if (checked) updateExperience(experience.id, 'endDate', '');
                    }}
                  />
                  <Label htmlFor={`current-${experience.id}`}>I currently work here</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${experience.id}`}>Job Description</Label>
                  <Textarea
                    id={`description-${experience.id}`}
                    value={experience.description}
                    onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                    placeholder="Brief overview of your role and responsibilities..."
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Key Achievements</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAchievement(experience.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Achievement
                    </Button>
                  </div>
                  
                  {experience.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="flex gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) => updateAchievement(experience.id, achievementIndex, e.target.value)}
                        placeholder="• Increased team productivity by 25% through process optimization"
                      />
                      {experience.achievements.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement(experience.id, achievementIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        <Button onClick={addExperience} variant="outline" className="w-full h-12">
          <Plus className="h-4 w-4 mr-2" />
          Add Work Experience
        </Button>
      </div>
    </div>
  );
};