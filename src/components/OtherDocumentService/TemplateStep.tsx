import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Crown, CheckCircle } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'formal' | 'academic' | 'creative' | 'professional';
  isPremium: boolean;
  features: string[];
  preview?: string;
}

interface TemplateStepProps {
  documentType: string;
  selectedTemplate?: Template;
  onTemplateSelect: (template: Template) => void;
}

const getTemplatesForDocumentType = (documentType: string): Template[] => {
  const baseTemplates = {
    'sop': [
      {
        id: 'sop-academic',
        name: 'Academic Standard',
        description: 'Classic academic format following traditional SOP structure',
        category: 'academic' as const,
        isPremium: false,
        features: ['Clear structure', 'Academic tone', 'Standard formatting', 'PDF export']
      },
      {
        id: 'sop-research',
        name: 'Research Focused',
        description: 'Emphasizes research experience and academic achievements',
        category: 'academic' as const,
        isPremium: true,
        features: ['Research highlights', 'Publication formatting', 'Academic citations', 'Advanced layout']
      },
      {
        id: 'sop-creative',
        name: 'Creative Fields',
        description: 'Tailored for creative programs with visual elements',
        category: 'creative' as const,
        isPremium: true,
        features: ['Visual elements', 'Portfolio integration', 'Creative formatting', 'Multi-column layout']
      }
    ],
    'cover-letter': [
      {
        id: 'cover-modern',
        name: 'Modern Professional',
        description: 'Clean, contemporary design for corporate positions',
        category: 'professional' as const,
        isPremium: false,
        features: ['Professional layout', 'Clean typography', 'Header design', 'Contact integration']
      },
      {
        id: 'cover-executive',
        name: 'Executive Level',
        description: 'Premium design for senior management positions',
        category: 'professional' as const,
        isPremium: true,
        features: ['Executive styling', 'Premium fonts', 'Letterhead design', 'Signature placement']
      }
    ],
    'personal-statement': [
      {
        id: 'ps-narrative',
        name: 'Narrative Style',
        description: 'Story-focused format for compelling personal narratives',
        category: 'formal' as const,
        isPremium: false,
        features: ['Narrative structure', 'Personal tone', 'Story flow', 'Readable format']
      },
      {
        id: 'ps-achievement',
        name: 'Achievement Focused',
        description: 'Highlights accomplishments and milestones',
        category: 'formal' as const,
        isPremium: true,
        features: ['Achievement sections', 'Timeline format', 'Impact metrics', 'Visual hierarchy']
      }
    ]
  };

  const fallbackTemplates = [
    {
      id: 'generic-formal',
      name: 'Formal Standard',
      description: 'Professional formal document template',
      category: 'formal' as const,
      isPremium: false,
      features: ['Formal structure', 'Professional tone', 'Standard layout', 'PDF ready']
    },
    {
      id: 'generic-academic',
      name: 'Academic Format',
      description: 'Academic writing template with proper formatting',
      category: 'academic' as const,
      isPremium: false,
      features: ['Academic structure', 'Citation ready', 'Formal tone', 'Research focus']
    }
  ];

  return baseTemplates[documentType] || fallbackTemplates;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'formal': return 'bg-gray-100 text-gray-800';
    case 'academic': return 'bg-blue-100 text-blue-800';
    case 'creative': return 'bg-purple-100 text-purple-800';
    case 'professional': return 'bg-green-100 text-green-800';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const TemplateStep: React.FC<TemplateStepProps> = ({
  documentType,
  selectedTemplate,
  onTemplateSelect
}) => {
  const templates = getTemplatesForDocumentType(documentType);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Template</h2>
        <p className="text-muted-foreground">
          Select a template that matches your document style and requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.id === template.id
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                {template.isPremium && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Template Preview Area */}
              <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Template Preview</p>
                </div>
              </div>
              
              {/* Template Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Features:</h4>
                <div className="space-y-1">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category and Selection */}
              <div className="flex items-center justify-between pt-2">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
                <div className="text-sm">
                  {selectedTemplate?.id === template.id && (
                    <Badge variant="default" className="bg-primary">
                      Selected
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-semibold">{selectedTemplate.name} Template</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
              <Badge className={getCategoryColor(selectedTemplate.category)}>
                {selectedTemplate.category}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};