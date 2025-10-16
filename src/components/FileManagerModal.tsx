import React, { useState } from 'react';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  X, 
  ChevronDown,
  Trash2,
  Download,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'doc' | 'other';
  size: string;
  uploadDate: string;
  url?: string;
}

interface UserDocument {
  id: number;
  type: string;
  name: string;
  path: string;
  program_id: number | null;
  status: string | null;
  date: string;
  word_count: string;
}

interface FileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: FileItem) => void;
  title?: string;
  allowMultiple?: boolean;
  userDocuments?: UserDocument[];
  selectedPrograms?: number[];
}

const FileManagerModal: React.FC<FileManagerModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  title = "File Manager",
  allowMultiple = false,
  userDocuments = [],
  selectedPrograms = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Convert UserDocument to FileItem
  const convertUserDocumentToFileItem = (doc: UserDocument): FileItem => {
    // Determine file type based on document type or name
    let type: 'image' | 'pdf' | 'doc' | 'other' = 'other';
    const lowerName = (doc.name || doc.type || '').toLowerCase();
    
    if (lowerName.includes('.pdf')) {
      type = 'pdf';
    } else if (lowerName.includes('.jpg') || lowerName.includes('.jpeg') || lowerName.includes('.png')) {
      type = 'image';
    } else if (lowerName.includes('.doc') || lowerName.includes('.docx')) {
      type = 'doc';
    }
    
    // Format date
    const formattedDate = new Date(doc.date).toLocaleDateString();
    
    return {
      id: doc.id.toString(),
      name: doc.name || `${doc.type || 'Document'}_${doc.id}`,
      type,
      size: doc.word_count ? `${doc.word_count} words` : 'Unknown size',
      uploadDate: formattedDate,
      url: doc.path || undefined
    };
  };
  
  // Separate documents by program association
  const documentsForSelectedPrograms = userDocuments.filter(doc => 
    doc.program_id && selectedPrograms.includes(doc.program_id)
  );
  
  const otherDocuments = userDocuments.filter(doc => 
    !doc.program_id || !selectedPrograms.includes(doc.program_id)
  );
  
  // Combine documents with priority to selected programs
  const allDocuments = [...documentsForSelectedPrograms, ...otherDocuments].map(convertUserDocumentToFileItem);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-8 w-8 text-blue-500" />;
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
      case 'doc': return <FileText className="h-8 w-8 text-blue-600" />;
      default: return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Get CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', files[0]);
      
      // If there are selected programs, associate the first one
      if (selectedPrograms && selectedPrograms.length > 0) {
        formData.append('program_id', selectedPrograms[0].toString());
      }
      
      try {
        const response = await fetch('https://uniplanr.com/api/v1/upload-document', {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': csrfToken,
          },
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          // Simulate progress for better UX
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              setIsUploading(false);
              setUploadProgress(0);
              // Reset file input
              if (event.target) {
                event.target.value = '';
              }
              // Show success message
              alert('File uploaded successfully!');
            }
          }, 100);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setIsUploading(false);
        setUploadProgress(0);
        alert('File upload failed. Please try again.');
        // Reset file input
        if (event.target) {
          event.target.value = '';
        }
      }
    }
  };

  const filteredFiles = allDocuments.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-t-xl sm:rounded-xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-in-right max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-6 w-6 text-gray-400" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Upload Area */}
        <div className="p-6 border-b border-gray-100">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB</p>
              <input
                type="file"
                multiple={allowMultiple}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Files Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                  selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => {
                  if (allowMultiple) {
                    setSelectedFiles(prev => 
                      prev.includes(file.id) 
                        ? prev.filter(id => id !== file.id)
                        : [...prev, file.id]
                    );
                  } else {
                    onFileSelect?.(file);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {file.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">{file.size}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{file.uploadDate}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {allowMultiple && selectedFiles.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedFiles.length} file(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedFiles([])}>
                Clear Selection
              </Button>
              <Button onClick={() => {
                // Handle multiple file selection
                onClose();
              }}>
                Select Files
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagerModal;