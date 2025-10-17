import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileText,
  FolderOpen,
  Upload,
  Search,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Folder,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Brain,
  Sparkles,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'other';
  size: string;
  date: string;
  folder: string;
  url?: string;
}

interface Folder {
  id: string;
  name: string;
  count: number;
}

const Documents = () => {
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Personal Statement.pdf',
      type: 'pdf',
      size: '2.4 MB',
      date: '2024-01-15',
      folder: 'statements'
    },
    {
      id: '2',
      name: 'Transcript.pdf',
      type: 'pdf',
      size: '1.8 MB',
      date: '2024-01-14',
      folder: 'academic'
    },
    {
      id: '3',
      name: 'Recommendation Letter.docx',
      type: 'docx',
      size: '856 KB',
      date: '2024-01-12',
      folder: 'recommendations'
    },
    {
      id: '4',
      name: 'Passport Photo.jpg',
      type: 'image',
      size: '342 KB',
      date: '2024-01-10',
      folder: 'identification'
    }
  ]);

  const folders: Folder[] = [
    { id: 'all', name: 'All Documents', count: documents.length },
    { id: 'statements', name: 'Personal Statements', count: documents.filter(d => d.folder === 'statements').length },
    { id: 'academic', name: 'Academic Records', count: documents.filter(d => d.folder === 'academic').length },
    { id: 'recommendations', name: 'Recommendations', count: documents.filter(d => d.folder === 'recommendations').length },
    { id: 'identification', name: 'Identification', count: documents.filter(d => d.folder === 'identification').length },
    { id: 'other', name: 'Other Documents', count: documents.filter(d => d.folder === 'other').length }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesFolder = selectedFolder === 'all' || doc.folder === selectedFolder;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc: Document = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 
                file.type.includes('word') ? 'docx' : 
                file.type.includes('image') ? 'image' : 'other',
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          date: new Date().toISOString().split('T')[0],
          folder: selectedFolder === 'all' ? 'other' : selectedFolder
        };
        setDocuments(prev => [...prev, newDoc]);
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
        return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const aiFeatures = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "AI Document Writer",
      description: "Create compelling SOPs, cover letters, and motivation letters with AI assistance"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Smart Editing",
      description: "Get real-time suggestions and improvements tailored to your application"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Content Analysis",
      description: "Analyze your documents for clarity, tone, and effectiveness"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Document Manager</h1>
          <p className="text-muted-foreground">Organize and manage all your application documents</p>
        </div>

        {/* File Manager */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Folders */}
              <div className="lg:col-span-1 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">Folders</h3>
                </div>
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedFolder === folder.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {folder.id === 'all' ? (
                      <FolderOpen className="h-4 w-4" />
                    ) : (
                      <Folder className="h-4 w-4" />
                    )}
                    <span className="flex-1 text-left text-sm">{folder.name}</span>
                    <Badge variant="secondary" className="text-xs">{folder.count}</Badge>
                  </button>
                ))}
              </div>

              {/* Main Content - File List */}
              <div className="lg:col-span-3">
                {/* Search and Upload Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <label htmlFor="file-upload">
                    <Button className="gap-2 cursor-pointer" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload Document
                      </span>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* File List */}
                <div className="space-y-2">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No documents found</p>
                      <p className="text-sm text-muted-foreground mt-1">Upload your first document to get started</p>
                    </div>
                  ) : (
                    filteredDocuments.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.size} · {new Date(doc.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Document Studio Coming Soon */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Wand2 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">AI-Powered Document Studio</CardTitle>
                <Badge variant="secondary" className="mt-2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Get ready for an AI-powered writing experience that will help you create compelling, 
              personalized application documents that stand out to admissions officers.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="space-y-3">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What's Coming
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>Multiple professional templates for all document types</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>Context-aware content generation based on your profile</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>Real-time grammar and style optimization</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>Program-specific customization and requirements</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewDoc && getFileIcon(previewDoc.type)}
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewDoc?.type === 'image' ? (
              <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg">
                <img 
                  src={previewDoc.url || 'https://via.placeholder.com/800x600?text=Image+Preview'} 
                  alt={previewDoc.name}
                  className="max-w-full h-auto rounded"
                />
              </div>
            ) : previewDoc?.type === 'pdf' ? (
              <div className="flex items-center justify-center p-12 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <FileText className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">PDF Preview</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Full PDF preview coming soon
                  </p>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <File className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Document Preview</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Preview for this file type is not available
                  </p>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download to View
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
