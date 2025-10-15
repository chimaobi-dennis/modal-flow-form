import { AlertTriangle, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Application {
  id: number;
  university: string;
  program: string;
  deadline: string;
  status: string;
  progress: number;
  requirements: string[];
  completed: string[];
  isGroup?: boolean;
  destination?: string;
}

interface DeadlineAlertProps {
  applications: Application[];
}

export const DeadlineAlert = ({ applications }: DeadlineAlertProps) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const getUpcomingDeadlines = () => {
    const today = new Date();
    return applications.filter(app => {
      const deadlineDate = new Date(app.deadline);
      const diffTime = deadlineDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0 && app.status !== "Submitted" && app.status !== "Under Review" && !dismissedAlerts.includes(app.id);
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const upcomingDeadlines = getUpcomingDeadlines();

  const dismissAlert = (appId: number) => {
    setDismissedAlerts([...dismissedAlerts, appId]);
  };

  if (upcomingDeadlines.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {upcomingDeadlines.map((app) => {
        const deadlineDate = new Date(app.deadline);
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let urgencyLevel = "yellow";
        let message = `${diffDays} days remaining`;
        
        if (diffDays <= 1) {
          urgencyLevel = "red";
          message = diffDays === 0 ? "Due today!" : "Due tomorrow!";
        } else if (diffDays <= 3) {
          urgencyLevel = "orange";
        }

        const alertColors = {
          red: "bg-red-50 border-red-200 text-red-800",
          orange: "bg-orange-50 border-orange-200 text-orange-800", 
          yellow: "bg-yellow-50 border-yellow-200 text-yellow-800"
        };

        return (
          <div key={app.id} className={`${alertColors[urgencyLevel]} border rounded-lg p-4 mb-3 animate-fade-in`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">
                    Deadline Alert:
                  </h4>
                  {!app.isGroup && (
                    <p className="text-sm mb-2">
                      {app.program} - {message}
                    </p>
                  )}
                  {app.isGroup && (
                    <p className="text-sm mb-2">
                      {app.isGroup ? `Application to study in ${app.destination || 'Selected Programs'} - ` : ''}
                      {message} remaining
                    </p>
                  )}
                  <div className="flex items-center text-xs space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {deadlineDate.toLocaleDateString()}
                    </div>
                    <div>
                      Progress: {app.progress}%
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(app.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
