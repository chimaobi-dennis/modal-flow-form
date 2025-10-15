import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Search,
  Download,
  Edit3,
  Sparkles,
  Upload,
  Calendar,
  Clock,
  FileCheck,
  PlusCircle,
  Brain,
  CreditCard
} from 'lucide-react';
import { ResumeBuilder } from '@/components/ResumeWizard/ResumeBuilder';
import { DocumentTypeStep } from '@/components/OtherDocumentService/DocumentTypeStep';
import { TemplateStep } from '@/components/OtherDocumentService/TemplateStep';
import { FormStep } from '@/components/OtherDocumentService/FormStep';
import { EditorStep } from '@/components/OtherDocumentService/EditorStep';
import { ReviewStep } from '@/components/OtherDocumentService/ReviewStep';
import OtherDocQuestionsModal from '@/components/OtherDocumentService/OtherDocQuestionsModal';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  name: string;
  type: 'essay' | 'research' | 'report' | 'thesis' | 'assignment' | 'uploaded' | 'resume' | 'sop' | 'cover_letter';
  dateCreated: string;
  lastModified: string;
  wordCount: number;
  status: 'draft' | 'completed' | 'enhanced' | 'uploaded';
  aiEnhanced: boolean;
}

// API response shape (partial)
interface ApiDocument {
  id: number;
  title: string;
  category: 'cv' | 'cover_letter' | 'sop' | 'motivation_letter' | 'other';
  type: string;
  created_at: string;
  updated_at: string;
  word_count?: number;
  is_ai_generated?: boolean;
  status?: string;
  current_version?: { word_count?: number };
  currentVersion?: { word_count?: number };
}

const Documents = () => {
  const userId = document.getElementById('root')?.getAttribute('data-user-id');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get('tab');
      const saved = localStorage.getItem('library:activeTab');
      return (fromUrl as string) || saved || 'library';
    } catch {
      return 'library';
    }
  });

  // Persist active tab to URL and localStorage
  useEffect(() => {
    try {
      localStorage.setItem('library:activeTab', activeTab);
      const url = new URL(window.location.href);
      const params = url.searchParams;
      params.set('tab', activeTab);
      window.history.replaceState({}, '', `${url.pathname}?${params.toString()}${url.hash}`);
    } catch {
      // ignore
    }
  }, [activeTab]);

  // Other Document Service State
  const [otherDocCurrentStep, setOtherDocCurrentStep] = useState(1);
  const navigate = useNavigate();
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [documentFormData, setDocumentFormData] = useState({
    writingFor: '',
    documentType: '',
    program: '',
    programBackground: '',
    requiredDocuments: [],
    subject: '',
    level: '',
    deadline: '',
    requirements: '',
    tone: '',
    pages: '',
    currentDegree: '',
    gpa: '',
    workExperience: '',
    researchExperience: '',
    careerGoals: '',
    whyThisProgram: '',
    achievements: '',
    challenges: ''
  });

  // TODO: Replace with API-driven stats when backend provides them
  const userStats = {
    creditsLeft: 150,
    totalCredits: 200,
    documentsCreated: 12,
    wordsGenerated: 45000
  };

  // API-driven user documents
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [apiDocuments, setApiDocuments] = useState<ApiDocument[]>([]);

  useEffect(() => {
    const uid = Number(userId || '');
    if (!uid) return;
    let isMounted = true;
    const controller = new AbortController();
    const fetchDocs = async () => {
      try {
        setDocsLoading(true);
        setDocsError(null);
        const res = await fetch(`/api/v1/users/${uid}/documents`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load documents (${res.status})`);
        }
        const json = await res.json();
        const items: ApiDocument[] = json?.data?.data || json?.data || [];
        if (isMounted) setApiDocuments(items);
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        setDocsError(e?.message || 'Failed to load documents');
      } finally {
        if (isMounted) setDocsLoading(false);
      }
    };
    fetchDocs();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId]);

  // Map API docs -> UI docs
  const documents: Document[] = useMemo(() => {
    const mapType = (category: ApiDocument['category']): Document['type'] => {
      switch (category) {
        case 'cv':
          return 'resume';
        case 'cover_letter':
          return 'cover_letter';
        case 'sop':
          return 'sop';
        default:
          return 'essay';
      }
    };
    return (apiDocuments || []).map((d) => ({
      id: String(d.id),
      name: d.title,
      type: mapType(d.category),
      dateCreated: d.created_at,
      lastModified: d.updated_at,
      wordCount: d.word_count ?? d.currentVersion?.word_count ?? d.current_version?.word_count ?? 0,
      status: (d.status as Document['status']) || 'draft',
      aiEnhanced: Boolean(d.is_ai_generated),
    }));
  }, [apiDocuments]);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'resume': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'sop': return <FileCheck className="h-5 w-5 text-green-500" />;
      case 'cover_letter': return <Edit3 className="h-5 w-5 text-purple-500" />;
      case 'essay': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'research': return <FileText className="h-5 w-5 text-green-500" />;
      case 'report': return <FileCheck className="h-5 w-5 text-purple-500" />;
      case 'thesis': return <FileText className="h-5 w-5 text-orange-500" />;
      case 'assignment': return <FileText className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'enhanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'uploaded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Gradient helper for card accents by type
  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'resume':
        return 'from-blue-500/10 to-cyan-500/10';
      case 'sop':
        return 'from-purple-500/10 to-pink-500/10';
      case 'cover_letter':
        return 'from-orange-500/10 to-red-500/10';
      case 'essay':
      case 'research':
      case 'report':
      case 'thesis':
      case 'assignment':
      case 'uploaded':
        return 'from-green-500/10 to-teal-500/10';
      default:
        return 'from-slate-500/10 to-slate-700/10';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter || doc.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleOtherDocNext = () => {
    if (otherDocCurrentStep < 5) {
      setOtherDocCurrentStep(otherDocCurrentStep + 1);
    }
  };

  const handleOtherDocBack = () => {
    if (otherDocCurrentStep > 1) {
      setOtherDocCurrentStep(otherDocCurrentStep - 1);
    }
  };

  const renderOtherDocumentStep = () => {
    switch (otherDocCurrentStep) {
      case 1:
        return (
          <DocumentTypeStep
            selectedType={selectedDocType}
            onTypeSelect={(type) => {
              setSelectedDocType(type as any);
              // Open full-screen modal for questions immediately after selection
              setShowQuestionsModal(true);
            }}
          />
        );
      case 2:
        return (
          <TemplateStep
            documentType={selectedDocType?.id || ''}
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
          />
        );
      case 3:
        return (
          <FormStep
            documentType={selectedDocType?.id || ''}
            data={{
              targetProgram: documentFormData.program,
              wordCount: documentFormData.pages,
              tone: documentFormData.tone,
              deadline: documentFormData.deadline,
              specificRequirements: documentFormData.requirements,
              background: documentFormData.workExperience,
              goals: documentFormData.careerGoals,
              achievements: documentFormData.achievements,
              challenges: documentFormData.challenges,
              whyThisProgram: documentFormData.whyThisProgram
            }}
            onChange={(data) => setDocumentFormData({
              ...documentFormData,
              program: data.targetProgram || '',
              pages: data.wordCount,
              tone: data.tone,
              deadline: data.deadline,
              requirements: data.specificRequirements,
              workExperience: data.background,
              careerGoals: data.goals,
              achievements: data.achievements,
              challenges: data.challenges,
              whyThisProgram: data.whyThisProgram
            })}
          />
        );
      case 4:
        return (
          <EditorStep
            documentType={selectedDocType?.id || ''}
            formData={documentFormData}
            template={selectedTemplate}
            onContentChange={(content) => console.log('Content changed:', content)}
            onRegenerate={() => console.log('Regenerate')}
            onEnhance={(section) => console.log('Enhance section:', section)}
          />
        );
      case 5:
        return (
          <ReviewStep
            documentType={selectedDocType?.id || ''}
            formData={documentFormData}
            template={selectedTemplate}
            generatedContent="Sample generated content for review..."
            onEdit={() => setOtherDocCurrentStep(4)}
            onSave={() => {
              console.log('Saving document...');
              setOtherDocCurrentStep(1);
              setSelectedDocType(null);
              setSelectedTemplate(null);
              setDocumentFormData({
                writingFor: '',
                documentType: '',
                program: '',
                programBackground: '',
                requiredDocuments: [],
                subject: '',
                level: '',
                deadline: '',
                requirements: '',
                tone: '',
                pages: '',
                currentDegree: '',
                gpa: '',
                workExperience: '',
                researchExperience: '',
                careerGoals: '',
                whyThisProgram: '',
                achievements: '',
                challenges: ''
              });
            }}
            onDownload={() => console.log('Downloading document...')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 bg-gradient-to-br from-background to-muted">
      <div className="mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Document Studio
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional resumes and academic documents with AI assistance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Credits Left</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userStats.creditsLeft}</div>
              <Progress value={(userStats.creditsLeft / userStats.totalCredits) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900/30 dark:to-green-800/30 dark:border-green-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Documents Created</CardTitle>
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{userStats.documentsCreated}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 dark:border-purple-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Words Generated</CardTitle>
              <Edit3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{userStats.wordsGenerated.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 dark:border-amber-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-200">AI Enhanced</CardTitle>
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {documents.filter(d => d.aiEnhanced).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-1 shadow-lg border border-gray-300 dark:border-gray-600 h-16">
        <TabsTrigger
              value="library"
              className="flex border-r items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-r border-gray-200 dark:border-gray-700 last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500"
            >
              <FileCheck className="h-4 w-4" />
              <span>My Documents</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-r border-gray-200 dark:border-gray-700 last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500">
              <Edit3 className="h-4 w-4" />
              <span>Document Writer</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-r border-gray-200 dark:border-gray-700 last:border-r-0 hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500">
              <FileText className="h-4 w-4" />
              <span>Resume Builder</span>
            </TabsTrigger>


          </TabsList>

          {/* Resume Builder Tab */}
          <TabsContent value="resume" className="space-y-6">
            <Card className="bg-white dark:bg-card-50 backdrop-blur-sm border border-gray-300 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Resume Builder</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResumeBuilder />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card className="bg-white dark:bg-card-50 backdrop-blur-sm border border-gray-300 shadow-md hover:shadow-lg transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    <span>Create Document</span>
                  </div>
                  {otherDocCurrentStep > 1 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Step {otherDocCurrentStep} of 5
                      </span>
                      <Progress value={(otherDocCurrentStep / 5) * 100} className="w-24" />
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderOtherDocumentStep()}

                {/* Navigation Buttons */}
                {otherDocCurrentStep > 1 && (
                  <div className="flex justify-between pt-6 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={handleOtherDocBack}
                      className="border-border/50 hover:bg-muted/50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleOtherDocNext}
                      disabled={otherDocCurrentStep === 5}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {otherDocCurrentStep === 5 ? 'Complete' : 'Next'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Document Library Tab */}
          <TabsContent value="library" className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-6 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <span>My Documents</span>
                  </div>
                  <Button size="sm" className="flex items-center space-x-2 bg-primary hover:bg-primary/90">
                    <Upload className="h-4 w-4" />
                    <span>Upload Document</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 " />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="all">All Documents</option>
                    <option value="resume">Resumes</option>
                    <option value="sop">Statements of Purpose</option>
                    <option value="cover_letter">Cover Letters</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>

                {/* Documents Grid */}
                {docsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={`doc-skel-${i}`} className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 rounded-xl backdrop-blur-sm">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm animate-pulse" />
                        <CardHeader className="pb-3">
                          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                          <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="flex items-center justify-between text-xs">
                            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-px bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="flex gap-2">
                            <div className="h-9 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-9 flex-1 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocuments.map((doc) => (
                      <Card
                        key={doc.id}
                        className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/30 hover:-translate-y-1"
                      >
                        {/* Gradient border glow (non-interactive) */}
                        <div
                          className={`absolute -inset-0.5 bg-gradient-to-r ${getTypeGradient(doc.type)} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm pointer-events-none -z-10`}
                          aria-hidden="true"
                        />

                        {/* Header with gradient background */}
                        <CardHeader className="p-0 relative z-10">
                          <div className={`relative bg-gradient-to-br ${getTypeGradient(doc.type)} p-6 pb-4`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm border border-white/20">
                                  {getDocumentIcon(doc.type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-tight">
                                    {doc.name}
                                  </h3>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 capitalize">
                                    {doc.type.replace('_', ' ')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {doc.aiEnhanced && (
                                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <Sparkles className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-6 pt-4 space-y-4 relative z-10">
                          {/* Status and word count */}
                          <div className="flex items-center justify-between">
                            <Badge className={`${getStatusColor(doc.status)} ring-1 ring-black/5 dark:ring-white/10`} variant="secondary">
                              {doc.status}
                            </Badge>
                            {doc.wordCount > 0 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {doc.wordCount.toLocaleString()} words
                              </span>
                            )}
                          </div>

                          {/* Dates */}
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(doc.dateCreated).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1 gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg transition-all duration-200 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                              onClick={() => { window.location.href = `/user/document/edit-resume?id=${doc.id}`; }}
                            >
                              <Edit3 className="h-4 w-4" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </Button>
                          </div>
                        </CardContent>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </Card>
                    ))}
                  </div>
                )}

                {!docsLoading && filteredDocuments.length === 0 && (
                  <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border/30">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No documents found</h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                      {searchTerm || selectedFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Create your first document to get started.'
                      }
                    </p>
                    <Button onClick={() => setActiveTab('resume')} className="bg-primary hover:bg-primary/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Full-screen Q&A Modal for Other Document Services */}
      <OtherDocQuestionsModal
        open={showQuestionsModal}
        documentTypeId={(selectedDocType as any)?.id || ''}
        documentTypeLabel={(selectedDocType as any)?.name || ''}
        userId={userId || ''}
        tone={documentFormData.tone}
        wordCount={documentFormData.pages}
        additionalRequirements={documentFormData.requirements}
        onBack={() => setShowQuestionsModal(false)}
        onComplete={({ content, qa }) => {
          setShowQuestionsModal(false);
          navigate('/user/document/edit-doc', {
            state: {
              content,
              qa,
              documentType: (selectedDocType as any)?.id || '',
              documentTypeLabel: (selectedDocType as any)?.name || '',
              tone: documentFormData.tone,
              wordCount: documentFormData.pages,
            }
          });
        }}
      />
    </div>
  );
};

export default Documents;
