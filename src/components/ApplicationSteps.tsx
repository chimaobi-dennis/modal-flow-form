
import { CheckCircle, Circle, Clock, FileText, Upload, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Application {
  id: number;
  university: string;
  program: string;
  deadline: string;
  status: string;
  progress: number;
  requirements: string[];
  completed: string[];
}

interface ApplicationStepsProps {
  application: Application;
}

export const ApplicationSteps = ({ application }: ApplicationStepsProps) => {
  const steps = [
    {
      id: 1,
      title: "Research & Planning",
      description: "Research university requirements and prepare documents",
      icon: FileText,
      completed: true
    },
    {
      id: 2,
      title: "Document Preparation",
      description: "Gather transcripts, test scores, and references",
      icon: Upload,
      completed: application.completed.includes("Transcripts")
    },
    {
      id: 3,
      title: "Personal Statement",
      description: "Write and review your personal statement",
      icon: FileText,
      completed: application.completed.includes("Personal Statement")
    },
    {
      id: 4,
      title: "Letters of Recommendation",
      description: "Request and follow up on recommendation letters",
      icon: FileText,
      completed: application.completed.includes("Letters of Rec")
    },
    {
      id: 5,
      title: "Application Submission",
      description: "Review and submit your complete application",
      icon: Send,
      completed: application.status === "Submitted" || application.status === "Under Review"
    }
  ];

  const currentStep = steps.findIndex(step => !step.completed) + 1;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Steps</h3>
        <p className="text-sm text-gray-600 mb-4">
          {application.university} - {application.program}
        </p>
        
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{application.progress}%</span>
          </div>
          <Progress value={application.progress} className="h-2" />
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-start space-x-3">
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100 text-green-600' 
                  : isActive 
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : isActive ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${
                  step.completed ? 'text-green-900' : isActive ? 'text-blue-900' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                
                {isActive && (
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                    Start Step
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            View Requirements
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>
    </div>
  );
};
