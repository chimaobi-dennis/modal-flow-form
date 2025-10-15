import { Calendar, MapPin, CheckCircle, Clock, AlertCircle, Eye, ChevronDown, ChevronRight, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const isUrgent = (deadline: string, stage?: number, progress?: number): boolean => {
  // If stage is greater than 4 and progress is more than 2, program application is completed
  // In this case, we don't consider it urgent
  if (stage !== undefined && progress !== undefined && stage > 4 && progress > 2) {
    return false;
  }
  
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0; // Urgent if within 7 days and not passed
};

const isOverdue = (deadline: string, stage?: number, progress?: number): boolean => {
  // If stage is greater than 4 and progress is more than 2, program application is completed
  // In this case, we don't consider it overdue
  if (stage !== undefined && progress !== undefined && stage > 4 && progress > 2) {
    return false;
  }
  
  if (!deadline) return false;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  return deadlineDate < today;
};

const formatDeadline = (deadline: string, stage?: number, progress?: number): string => {
  // If stage is greater than 4 and progress is more than 2, program application is completed
  // In this case, we don't show overdue status
  if (progress !== undefined && progress > 2) {
    return 'Program Application Completed';
  }
  console.log('stage', stage, 'progress', progress);
  if (!deadline) return 'No deadline';
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (progress !== undefined && progress > 2) {
    return 'Program Application Completed';
  }
  else if (isOverdue(deadline, stage, progress)) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  }
  
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  
  // For dates more than a week away, show the actual date
  return `Due ${deadlineDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })}`;
};

const getProgressPercentage = (progress: number, status: number, stage: number): number => {
  
  // If application has ended, show 100%
  if (status === 1) return 100;
  
  // For open applications, convert progress (1-4) to percentage (0-100)
  return Math.min(100, Math.max(0, (progress / 4) * 100));
};

interface Program {
  id: number;
  name: string;
  university: string;
  city: string;
}

interface Application {
  id: number;
  name: string;
  destination: string;
  program?: string;
  status: number;
  progress: number;
  stage: number;
  deadline: string;
  created_at: string;
  updated_at: string;
  isGroup?: boolean;
  trx?: string;
  profileId?: number;
  degree?: string;
  groupData?: {
    programs: Program[];
  };
}

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  onProgramClick?: (program: Program) => void;
  isSelected: boolean;
  selectedProgramId?: number;
}

export const ApplicationCard = ({ application, onClick, isSelected, onProgramClick, selectedProgramId }: ApplicationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "Open Application";
      case 1: return "Application Completed";
      default: return "Unknown";
    }
  };

  const getStatusColor = (status: number) => {
    const statusText = getStatusText(status);
    switch (statusText) {
      case "Application Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Open Application":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: number) => {
    const statusText = getStatusText(status);
    switch (statusText) {
      case "Application Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "Open Application":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleProgramClick = (e: React.MouseEvent, program: Program) => {
    e.stopPropagation();
    onProgramClick?.(program);
    
    if (window.innerWidth < 1280) {
      toast("Scroll down to view step details ↓", {
        duration: 2000,
        position: "top-center",
      });
      
      setTimeout(() => {
        const detailsSection = document.querySelector('.xl\\:col-span-1');
        if (detailsSection) {
          detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const renderSingleProgram = () => {
    const hasProgram = !!application.program;
    
    return (
      <div 
        className={`p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer border-l-4 ${
          isSelected ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
        } ${isOverdue(application.deadline, application.stage, application.progress) ? 'bg-red-50' : isUrgent(application.deadline, application.stage, application.progress) ? 'bg-amber-50' : ''}`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {application.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {application.destination}
            </div>
            {hasProgram ? (
              <p className="text-sm text-gray-700">
                {application.program}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No program selected
              </p>
            )}
          </div>
          
          <Badge className={`${getStatusColor(application.status)} flex items-center gap-1 px-3 py-1`}>
            {getStatusIcon(application.status)}
            {getStatusText(application.status)}
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{getProgressPercentage(application.progress, application.status)}%</span>
          </div>
          <Progress value={getProgressPercentage(application.progress, application.status)} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Calendar className={`h-4 w-4 mr-1 ${
              isOverdue(application.deadline, application.stage, application.progress) 
                ? 'text-red-500' 
                : isUrgent(application.deadline, application.stage, application.progress) 
                  ? 'text-amber-500' 
                  : 'text-gray-400'
            }`} />
            <span className={isOverdue(application.deadline, application.stage, application.progress) 
              ? 'text-red-600 font-medium' 
              : isUrgent(application.deadline, application.stage, application.progress) 
                ? 'text-amber-600 font-medium' 
                : 'text-gray-600'
            }>
              {formatDeadline(application.deadline, application.stage, application.progress)}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-7"
            onClick={(e) => {
              e.stopPropagation();
              if (application.progress === 0 && application.trx && application.profileId && application.degree) {
                // For new applications (progress = 0)
                const params = new URLSearchParams({
                  trx: application.trx,
                  studyDestination: application.destination,
                  degree: application.degree,
                  profileId: application.profileId.toString(),
                  ID: application.id.toString()
                });
                window.location.href = `/student/start-application-p2?${params.toString()}`;
              } else {
                window.location.href = `/student/manage-application?trx=${application.trx}&studyDestination=${application.destination}&degree=${application.degree}&profileId=${application.profileId}&ID=${application.id}`;
              }
            }}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Application
          </Button>
        </div>

        {isOverdue(application.deadline, application.stage, application.progress) && (application.stage < 4 || application.progress < 2) && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800 font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Deadline passed! Please take action immediately.
            </p>
          </div>
        )}

        {isUrgent(application.deadline, application.stage, application.progress) && !isOverdue(application.deadline, application.stage, application.progress) && (application.stage < 4 || application.progress < 2) && (
          <div className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Deadline approaching! Complete remaining requirements soon.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderGroupedPrograms = () => {
    const hasPrograms = application.groupData?.programs?.length > 0;
    
    return (
      <div className={`border-l-4 ${
        isSelected ? 'bg-blue-50 border-l-blue-500' : 'border-l-transparent'
      } ${isOverdue(application.deadline, application.stage, application.progress) ? 'bg-red-50' : isUrgent(application.deadline, application.stage, application.progress) ? 'bg-amber-50' : ''}`}>
        <div 
          className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer relative"
          onClick={handleCardClick}
        >
          <div className="absolute top-0 right-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            GROUP
          </div>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {application.name}
                </h3>
                {hasPrograms && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 p-1 h-8 w-8 hover:bg-blue-100 rounded-full transition-colors"
                    onClick={handleExpandClick}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="font-medium">{application.destination}</span>
                <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  {hasPrograms ? `${application.groupData?.programs.length} programs` : 'No programs added'}
                </span>
              </div>
            </div>
            
            <Badge className={`${getStatusColor(application.status)} flex items-center gap-1 px-3 py-1`}>
              {getStatusIcon(application.status)}
              {getStatusText(application.status)}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{application.progress * 25}%</span>
            </div>
            <Progress value={application.progress * 25} className="h-2" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm">
              <Calendar className={`h-4 w-4 mr-1 ${
                isOverdue(application.deadline, application.stage, application.progress) 
                  ? 'text-red-500' 
                  : isUrgent(application.deadline, application.stage, application.progress) 
                    ? 'text-amber-500' 
                    : 'text-gray-400'
              }`} />
              <span className={isOverdue(application.deadline, application.stage, application.progress) 
                ? 'text-red-600 font-medium' 
                : isUrgent(application.deadline, application.stage, application.progress) 
                  ? 'text-amber-600 font-medium' 
                  : 'text-gray-600'
              }>
                {formatDeadline(application.deadline, application.stage, application.progress)}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                if (application.progress === 0 && application.trx && application.profileId && application.degree) {
                  const params = new URLSearchParams({
                    trx: application.trx,
                    studyDestination: application.destination,
                    degree: application.degree,
                    profileId: application.profileId.toString(),
                    ID: application.id.toString()
                  });
                  window.location.href = `/student/start-application-p2?${params.toString()}`;
                } else {
                  window.location.href = `/student/manage-application?trx=${application.trx}&studyDestination=${application.destination}&degree=${application.degree}&profileId=${application.profileId}&ID=${application.id}`;
                }
              }}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View Application
            </Button>
          </div>

          {isOverdue(application.deadline, application.stage, application.progress) && (application.stage < 4 || application.progress < 2) && (
            <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800 font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Deadline passed! Please take action immediately.
              </p>
            </div>
          )}

          {isUrgent(application.deadline, application.stage, application.progress) && !isOverdue(application.deadline, application.stage, application.progress) && (application.stage < 4 || application.progress < 2) && (
            <div className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Deadline approaching! Complete remaining requirements soon.
              </p>
            </div>
          )}
        </div>

        {isExpanded && hasPrograms && (
          <div className="border-t-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="px-6 py-3 bg-blue-100/50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-semibold text-blue-800">Programs in this group:</span>
              </div>
            </div>
            {application.groupData?.programs.map((program, index) => (
              <div 
                key={program.id}
                className={`relative px-8 py-4 border-b border-blue-100 last:border-b-0 hover:bg-white/70 transition-all duration-200 group cursor-pointer ${
                  selectedProgramId === program.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={(e) => handleProgramClick(e, program)}
              >
                <div className="absolute left-6 top-0 bottom-0 w-px bg-blue-200"></div>
                <div className="absolute left-5 top-6 w-3 h-px bg-blue-300"></div>
                
                <div className={`absolute left-4 top-4 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  selectedProgramId === program.id ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-md font-semibold mb-1 group-hover:text-blue-700 transition-colors ${
                      selectedProgramId === program.id ? 'text-blue-800' : 'text-gray-900'
                    }`}>
                      {program.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Building className="h-3 w-3 mr-1" />
                      <span className="font-medium">{program.university}</span>
                    </div>
                    {program.city && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{program.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return application.isGroup ? renderGroupedPrograms() : renderSingleProgram();
};