import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Share2, 
  Edit3, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Target,
  User,
  Sparkles,
  Eye,
  Save
} from 'lucide-react';

interface ReviewStepProps {
  documentType: string;
  formData: any;
  template: any;
  generatedContent: string;
  onEdit: () => void;
  onSave: () => void;
  onDownload: () => void;
}

interface QualityCheck {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  icon: React.ReactNode;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  documentType,
  formData,
  template,
  generatedContent,
  onEdit,
  onSave,
  onDownload
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const wordCount = generatedContent.split(' ').length;
  const targetWordCount = parseInt(formData.wordCount) || 1000;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed
  
  // Quality checks
  const qualityChecks: QualityCheck[] = [
    {
      id: 'word-count',
      name: 'Word Count',
      status: Math.abs(wordCount - targetWordCount) <= 100 ? 'pass' : 'warning',
      message: `${wordCount} words (target: ${targetWordCount})`,
      icon: <Target className="h-4 w-4" />
    },
    {
      id: 'structure',
      name: 'Document Structure',
      status: 'pass',
      message: 'Clear introduction, body, and conclusion',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'tone',
      name: 'Writing Tone',
      status: 'pass',
      message: `Consistent ${formData.tone} tone throughout`,
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'deadline',
      name: 'Deadline Check',
      status: formData.deadline ? 'pass' : 'warning',
      message: formData.deadline ? `Due ${new Date(formData.deadline).toLocaleDateString()}` : 'No deadline set',
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const overallScore = (qualityChecks.filter(check => check.status === 'pass').length / qualityChecks.length) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-amber-600 bg-amber-100';
      case 'fail': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'fail': return <AlertCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const contentPreview = generatedContent.substring(0, 300) + (generatedContent.length > 300 ? '...' : '');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review & Finalize</h2>
        <p className="text-muted-foreground">
          Review your document and make final adjustments before saving or downloading
        </p>
      </div>

      {/* Document Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Document Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <p className="text-2xl font-bold text-primary">{readingTime}</p>
              <p className="text-sm text-muted-foreground">Min Read</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{overallScore.toFixed(0)}%</p>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Quality</span>
              <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <Progress value={overallScore} className="w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Checks */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quality Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {qualityChecks.map((check) => (
              <div key={check.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`p-1 rounded ${getStatusColor(check.status)}`}>
                  {getStatusIcon(check.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {check.icon}
                    <p className="text-sm font-medium">{check.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{check.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Preview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{documentType.replace('-', ' ')}</Badge>
                <Badge variant="outline">{template?.name}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6 min-h-96">
              <div className="prose prose-sm max-w-none">
                {showFullContent ? (
                  generatedContent.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="text-gray-800 leading-relaxed">
                      {contentPreview}
                    </p>
                    {generatedContent.length > 300 && (
                      <Button
                        variant="link"
                        onClick={() => setShowFullContent(true)}
                        className="p-0 h-auto text-primary"
                      >
                        Show full content
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {showFullContent && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFullContent(false)}
                  className="text-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview Only
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Document Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={onDownload} className="h-12">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            <Button onClick={onSave} variant="outline" className="h-12">
              <Save className="h-4 w-4 mr-2" />
              Save Document
            </Button>
            
            <Button onClick={onEdit} variant="outline" className="h-12">
              <Edit3 className="h-4 w-4 mr-2" />
              Continue Editing
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Share Document</h4>
              <p className="text-sm text-muted-foreground">Share with advisors or collaborators</p>
            </div>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Template:</span>
              <p className="font-medium">{template?.name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Target Program:</span>
              <p className="font-medium">{formData.targetProgram || 'General Application'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};