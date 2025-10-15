import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, GraduationCap, MapPin, Calendar, FileText, ArrowRight } from "lucide-react";
import MockInterview from "./MockInterview";

interface VisaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisaInfoModal({ isOpen, onClose }: VisaInfoModalProps) {
  const [showInterview, setShowInterview] = useState(false);

  // Mock user visa information
  const userVisaInfo = {
    name: "John Smith",
    program: "Computer Science and Engineering",
    university: "KTH Royal Institute of Technology",
    country: "United States",
    applicationStatus: "In Progress",
    interviewDate: "2024-06-05",
    appointmentTime: "10:00 AM",
    embassy: "Swedish Embassy, Washington DC",
    documents: {
      completed: ["Passport", "Admission Letter", "Financial Proof", "Health Insurance"],
      pending: ["Police Certificate", "Medical Certificate"]
    }
  };

  if (showInterview) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {
        setShowInterview(false);
        onClose();
      }}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <div className="h-full overflow-auto">
            <MockInterview 
              userInfo={{
                name: userVisaInfo.name,
                program: userVisaInfo.program,
                university: userVisaInfo.university,
                country: userVisaInfo.country
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Visa Application Information
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{userVisaInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Country of Origin</p>
                  <p className="text-sm text-muted-foreground">{userVisaInfo.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Study Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Study Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Program</p>
                <p className="text-sm text-muted-foreground">{userVisaInfo.program}</p>
              </div>
              <div>
                <p className="text-sm font-medium">University</p>
                <p className="text-sm text-muted-foreground">{userVisaInfo.university}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Application Status:</p>
                <Badge variant="secondary">{userVisaInfo.applicationStatus}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Interview Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Interview Date</p>
                  <p className="text-sm text-muted-foreground">{userVisaInfo.interviewDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">{userVisaInfo.appointmentTime}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {userVisaInfo.embassy}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-green-600 mb-2">Completed Documents</p>
                <div className="flex flex-wrap gap-2">
                  {userVisaInfo.documents.completed.map((doc) => (
                    <Badge key={doc} variant="default" className="text-xs">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
              {userVisaInfo.documents.pending.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-orange-600 mb-2">Pending Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {userVisaInfo.documents.pending.map((doc) => (
                      <Badge key={doc} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={() => setShowInterview(true)}
              className="flex items-center gap-2"
            >
              Start Mock Interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}