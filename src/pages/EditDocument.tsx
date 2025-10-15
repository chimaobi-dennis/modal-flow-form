import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, Eye, Edit3, Save, Sparkles } from 'lucide-react';
import { generateDocumentFromQA } from '@/services/aiService';
import { saveDocumentDraft } from '@/services/documentService';

interface LocationState {
  content: string;
  qa: Array<{ question: string; answer: string }>;
  documentType: string;
  documentTypeLabel: string;
  tone?: string;
  wordCount?: string;
}

const EditDocument: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { content: initialContent = '', qa = [], documentType = '', documentTypeLabel = '', tone = 'formal', wordCount = '1000' } = (state || {}) as LocationState;

  const [content, setContent] = useState<string>(initialContent);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!state) {
      // If accessed directly without state, go back
      navigate('/user/documents');
    }
  }, [state, navigate]);

  const wordCountNum = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);
  const targetWordCount = useMemo(() => parseInt(wordCount || '1000'), [wordCount]);
  const progress = Math.min((wordCountNum / targetWordCount) * 100, 100);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDocumentDraft({
        title: `${documentTypeLabel} Draft`,
        content,
        type: documentTypeLabel || documentType,
        meta: { tone, targetWordCount, qa },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    // Simple print-to-PDF approach; users can choose Save as PDF in print dialog
    window.print();
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const { content: newContent } = await generateDocumentFromQA({
        documentType: documentTypeLabel || documentType,
        answers: qa,
        tone,
        wordCount: targetWordCount,
      });
      if (newContent) setContent(newContent);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/user/documents')} className="px-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Edit Document</h1>
            <p className="text-sm text-muted-foreground">{documentTypeLabel} • Tone: {tone} • Target: {targetWordCount} words</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleRegenerate} disabled={regenerating}>
                {regenerating ? 'Regenerating…' : 'Regenerate with AI'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" /> Export PDF
              </Button>
              <div className="pt-2 space-y-2">
                <div className="text-sm">Progress</div>
                <Progress value={progress} />
                <div className="text-xs text-muted-foreground text-center">{wordCountNum} / {targetWordCount} words</div>
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Edit3 className="h-5 w-5" /> Document Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{documentType.replace('-', ' ')}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(m => !m)}>
                    {editMode ? (<><Eye className="h-4 w-4 mr-1" /> Preview</>) : (<><Edit3 className="h-4 w-4 mr-1" /> Edit</>)}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {regenerating ? (
                <div className="space-y-3">
                  <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-5 w-full bg-muted rounded animate-pulse" />
                  ))}
                  <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                </div>
              ) : editMode ? (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[28rem] font-mono text-sm resize-none"
                  placeholder="Start typing your document content here..."
                />
              ) : (
                <div className="min-h-[28rem] p-4 bg-white border rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    {content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-800 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              {saving && (
                <div className="mt-4 h-3 w-28 bg-muted rounded animate-pulse" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Q&A Summary */}
        {!!qa?.length && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Background Details (Q&A)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qa.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-sm font-medium">Q{idx + 1}. {item.question}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{item.answer}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EditDocument;
