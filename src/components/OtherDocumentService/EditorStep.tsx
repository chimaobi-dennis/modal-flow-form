import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Wand2, 
  RefreshCw, 
  Copy, 
  Download, 
  Eye, 
  Edit3, 
  Sparkles,
  FileText,
  RotateCcw,
  Check
} from 'lucide-react';

interface EditorStepProps {
  documentType: string;
  formData: any;
  template: any;
  generatedContent?: string;
  onContentChange: (content: string) => void;
  onRegenerate: () => void;
  onEnhance: (section: string) => void;
}

export const EditorStep: React.FC<EditorStepProps> = ({
  documentType,
  formData,
  template,
  generatedContent,
  onContentChange,
  onRegenerate,
  onEnhance
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Mock generated content if none provided
  const content = generatedContent || `Dear Admissions Committee,

I am writing to express my strong interest in the Master's Program in Computer Science at your esteemed institution. With a solid foundation in computer science and a passion for artificial intelligence, I am eager to contribute to your academic community while advancing my knowledge in cutting-edge technologies.

My academic journey began with a Bachelor's degree in Computer Science, where I maintained a GPA of 3.8/4.0 and graduated summa cum laude. During my undergraduate studies, I developed a strong foundation in programming languages including Python, Java, and C++, while also exploring advanced topics in machine learning and data structures.

Throughout my academic career, I have consistently demonstrated excellence in both theoretical understanding and practical application. I completed several significant projects, including developing a machine learning model for predicting stock market trends, which achieved 85% accuracy and was presented at the university's annual research symposium.

My professional experience as a Software Developer Intern at Tech Solutions Inc. provided valuable industry exposure, where I contributed to developing web applications using React and Node.js. This experience taught me the importance of collaborative development and agile methodologies in real-world software projects.

Looking toward the future, my career goals center on becoming a leading researcher in artificial intelligence, particularly in the field of natural language processing. I am particularly drawn to your program because of its emphasis on practical research and the opportunity to work with renowned faculty members who are pioneers in AI research.

I am confident that my academic background, combined with my passion for technology and commitment to excellence, makes me an ideal candidate for your program. I look forward to contributing to your research community and advancing the field of computer science.

Thank you for considering my application.

Sincerely,
[Your Name]`;

  const wordCount = content.split(' ').length;
  const targetWordCount = parseInt(formData.wordCount) || 1000;
  const progressPercentage = Math.min((wordCount / targetWordCount) * 100, 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mock generation process
    setTimeout(() => {
      setIsGenerating(false);
      // In real implementation, this would call the AI service
    }, 3000);
  };

  const handleEnhance = (section: string) => {
    setIsEnhancing(section);
    setTimeout(() => {
      setIsEnhancing(null);
      onEnhance(section);
    }, 2000);
  };

  const sections = [
    { id: 'introduction', name: 'Introduction', description: 'Opening paragraph and thesis' },
    { id: 'background', name: 'Background', description: 'Academic and professional history' },
    { id: 'goals', name: 'Goals & Motivation', description: 'Future aspirations and reasoning' },
    { id: 'conclusion', name: 'Conclusion', description: 'Closing statement and call to action' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI-Generated Document</h2>
        <p className="text-muted-foreground">
          Review and refine your AI-generated content using our editing tools
        </p>
      </div>

      {/* Document Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{wordCount}</p>
              <p className="text-sm text-muted-foreground">Words</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{Math.ceil(wordCount / 250)}</p>
              <p className="text-sm text-muted-foreground">Pages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formData.tone}</p>
              <p className="text-sm text-muted-foreground">Tone</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{progressPercentage.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Target Length</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {wordCount} / {targetWordCount} words
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Tools Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Regenerate All'}
            </Button>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Enhance Sections</h4>
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnhance(section.id)}
                  disabled={isEnhancing === section.id}
                  className="w-full justify-start text-left"
                >
                  {isEnhancing === section.id ? (
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  ) : (
                    <Edit3 className="h-3 w-3 mr-2" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-medium">{section.name}</p>
                    <p className="text-xs text-muted-foreground">{section.description}</p>
                  </div>
                </Button>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Editor */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Editor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{template?.name}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <Eye className="h-4 w-4 mr-1" />
                  ) : (
                    <Edit3 className="h-4 w-4 mr-1" />
                  )}
                  {editMode ? 'Preview' : 'Edit'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <Textarea
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                className="min-h-96 font-mono text-sm resize-none"
                placeholder="Start typing your document content here..."
              />
            ) : (
              <div className="min-h-96 p-4 bg-white border rounded-lg">
                <div className="prose prose-sm max-w-none">
                  {content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h4 className="font-medium">Document Type: {documentType.replace('-', ' ')}</h4>
                <p className="text-sm text-muted-foreground">
                  Generated using {template?.name} template
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Draft</Badge>
              <Badge variant="outline">Auto-saved</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};