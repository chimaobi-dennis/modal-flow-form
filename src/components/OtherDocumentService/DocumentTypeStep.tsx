import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Target, User, Briefcase, BookOpen, Award, PenTool } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'academic' | 'professional' | 'personal';
  examples: string[];
}

interface DocumentTypeStepProps {
  selectedType?: DocumentType;
  onTypeSelect: (type: DocumentType) => void;
}

const documentTypes: DocumentType[] = [
  {
    id: 'sop',
    name: 'Statement of Purpose',
    description: 'Academic statement outlining your goals and motivations',
    icon: <Target className="h-6 w-6" />,
    category: 'academic',
    examples: ['Graduate school applications', 'PhD programs', 'Research positions']
  },
  {
    id: 'personal-statement',
    name: 'Personal Statement',
    description: 'Personal narrative highlighting your background and achievements',
    icon: <User className="h-6 w-6" />,
    category: 'academic',
    examples: ['Undergraduate applications', 'Scholarship applications', 'Award nominations']
  },
  {
    id: 'motivation-letter',
    name: 'Motivation Letter',
    description: 'Letter explaining your motivation for a specific opportunity',
    icon: <Award className="h-6 w-6" />,
    category: 'academic',
    examples: ['Exchange programs', 'Internships', 'Volunteer positions']
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter',
    description: 'Professional letter accompanying job applications',
    icon: <Briefcase className="h-6 w-6" />,
    category: 'professional',
    examples: ['Job applications', 'Freelance proposals', 'Contract positions']
  },
  {
    id: 'research-proposal',
    name: 'Research Proposal',
    description: 'Detailed proposal for academic research projects',
    icon: <BookOpen className="h-6 w-6" />,
    category: 'academic',
    examples: ['Thesis proposals', 'Grant applications', 'Research funding']
  },
  {
    id: 'essay',
    name: 'Academic Essay',
    description: 'Structured academic writing on specific topics',
    icon: <PenTool className="h-6 w-6" />,
    category: 'academic',
    examples: ['Application essays', 'Scholarship essays', 'Admission essays']
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'academic': return 'bg-blue-100 text-blue-800';
    case 'professional': return 'bg-green-100 text-green-800';
    case 'personal': return 'bg-purple-100 text-purple-800';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const DocumentTypeStep: React.FC<DocumentTypeStepProps> = ({
  selectedType,
  onTypeSelect
}) => {
  const groupedTypes = documentTypes.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = [];
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, DocumentType[]>);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Document Type</h2>
        <p className="text-muted-foreground">
          Select the type of document you want to create with AI assistance
        </p>
      </div>

      {Object.entries(groupedTypes).map(([category, types]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize text-muted-foreground">
            {category === 'academic' ? 'Academic Documents' : 
             category === 'professional' ? 'Professional Documents' : 'Personal Documents'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedType?.id === type.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => onTypeSelect(type)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-lg">
                        {type.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{type.name}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(type.category)}`}>
                      {category}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Common uses:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {type.examples.slice(0, 2).map((example, index) => (
                        <li key={index}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {selectedType && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-lg">
                {selectedType.icon}
              </div>
              <div>
                <h4 className="font-semibold">{selectedType.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedType.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};