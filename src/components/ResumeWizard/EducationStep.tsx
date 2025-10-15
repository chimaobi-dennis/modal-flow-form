import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GraduationCap, Calendar } from 'lucide-react';

interface Education {
  id: string;
  degree: string;
  major: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  relevantCoursework: string[];
  achievements: string[];
}

interface EducationStepProps {
  educations: Education[];
  onChange: (educations: Education[]) => void;
}

const degreeTypes = [
  'High School Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctoral Degree (PhD)',
  'Professional Degree',
  'Certificate',
  'Other'
];

export const EducationStep: React.FC<EducationStepProps> = ({ educations, onChange }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: '',
      major: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: '',
      relevantCoursework: [''],
      achievements: ['']
    };
    onChange([...educations, newEducation]);
    setExpandedId(newEducation.id);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    onChange(educations.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const deleteEducation = (id: string) => {
    onChange(educations.filter(edu => edu.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addCoursework = (eduId: string) => {
    const edu = educations.find(e => e.id === eduId);
    if (edu) {
      updateEducation(eduId, 'relevantCoursework', [...edu.relevantCoursework, '']);
    }
  };

  const updateCoursework = (eduId: string, index: number, value: string) => {
    const edu = educations.find(e => e.id === eduId);
    if (edu) {
      const newCoursework = [...edu.relevantCoursework];
      newCoursework[index] = value;
      updateEducation(eduId, 'relevantCoursework', newCoursework);
    }
  };

  const removeCoursework = (eduId: string, index: number) => {
    const edu = educations.find(e => e.id === eduId);
    if (edu && edu.relevantCoursework.length > 1) {
      const newCoursework = edu.relevantCoursework.filter((_, i) => i !== index);
      updateEducation(eduId, 'relevantCoursework', newCoursework);
    }
  };

  const addAchievement = (eduId: string) => {
    const edu = educations.find(e => e.id === eduId);
    if (edu) {
      updateEducation(eduId, 'achievements', [...edu.achievements, '']);
    }
  };

  const updateAchievement = (eduId: string, index: number, value: string) => {
    const edu = educations.find(e => e.id === eduId);
    if (edu) {
      const newAchievements = [...edu.achievements];
      newAchievements[index] = value;
      updateEducation(eduId, 'achievements', newAchievements);
    }
  };

  const removeAchievement = (eduId: string, index: number) => {
    const edu = educations.find(e => e.id === eduId);
    if (edu && edu.achievements.length > 1) {
      const newAchievements = edu.achievements.filter((_, i) => i !== index);
      updateEducation(eduId, 'achievements', newAchievements);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Education</h2>
        <p className="text-muted-foreground">
          Add your educational background, starting with the most recent
        </p>
      </div>

      <div className="space-y-4">
        {educations.map((education, index) => (
          <Card key={education.id} className="relative">
            <CardHeader className="cursor-pointer" onClick={() => 
              setExpandedId(expandedId === education.id ? null : education.id)
            }>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {education.degree || 'New Education'}
                      {education.major && ` in ${education.major}`}
                    </CardTitle>
                    {education.institution && (
                      <p className="text-sm text-muted-foreground">
                        {education.institution} • {education.location}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {education.graduationDate && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {education.graduationDate}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEducation(education.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedId === education.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`degree-${education.id}`}>Degree Type</Label>
                    <Select
                      value={education.degree}
                      onValueChange={(value) => updateEducation(education.id, 'degree', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree type" />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`major-${education.id}`}>Major/Field of Study</Label>
                    <Input
                      id={`major-${education.id}`}
                      value={education.major}
                      onChange={(e) => updateEducation(education.id, 'major', e.target.value)}
                      placeholder="Computer Science"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`institution-${education.id}`}>Institution</Label>
                    <Input
                      id={`institution-${education.id}`}
                      value={education.institution}
                      onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                      placeholder="University of Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`location-${education.id}`}>Location</Label>
                    <Input
                      id={`location-${education.id}`}
                      value={education.location}
                      onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                      placeholder="Boston, MA"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`graduationDate-${education.id}`}>Graduation Date</Label>
                    <Input
                      id={`graduationDate-${education.id}`}
                      type="month"
                      value={education.graduationDate}
                      onChange={(e) => updateEducation(education.id, 'graduationDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gpa-${education.id}`}>GPA (Optional)</Label>
                    <Input
                      id={`gpa-${education.id}`}
                      value={education.gpa}
                      onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Relevant Coursework</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addCoursework(education.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Course
                    </Button>
                  </div>
                  
                  {education.relevantCoursework.map((course, courseIndex) => (
                    <div key={courseIndex} className="flex gap-2">
                      <Input
                        value={course}
                        onChange={(e) => updateCoursework(education.id, courseIndex, e.target.value)}
                        placeholder="Data Structures and Algorithms"
                      />
                      {education.relevantCoursework.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCoursework(education.id, courseIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Academic Achievements</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAchievement(education.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Achievement
                    </Button>
                  </div>
                  
                  {education.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="flex gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) => updateAchievement(education.id, achievementIndex, e.target.value)}
                        placeholder="Dean's List, Summa Cum Laude, Academic Scholarship, etc."
                      />
                      {education.achievements.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement(education.id, achievementIndex)}
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

        <Button onClick={addEducation} variant="outline" className="w-full h-12">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>
    </div>
  );
};