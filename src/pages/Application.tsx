import { useState, useEffect } from "react";
import { Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCard } from "@/components/ApplicationCard";
import { StatsOverview } from "@/components/StatsOverview";
import { DeadlineAlert } from "@/components/DeadlineAlert";
import { ApplicationProfile } from "@/components/ApplicationProfile";
import NewApplicationModal from "@/components/NewApplicationModal";
import { toast } from "sonner";
import axios from 'axios';

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
  university: string;
  deadline: string;
  status: number;
  progress: number;
  stage: number;
  created_at: string;
  updated_at: string;
  isGroup?: boolean;
  programId?: number;
  groupData?: {
    programs: Program[];
  };
}

const Index = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [showNewAppModal, setShowNewAppModal] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [errorLoadingApplications, setErrorLoadingApplications] = useState<string | null>(null);
  const userId = document.getElementById('root')?.getAttribute('data-user-id') || '1'; // Fallback to '1' if not found
  

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoadingApplications(true);
        const response = await fetch(`https://uniplanr.com/api/v1/applications/${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch applications');
        }
        
        if (data.status === 'success') {
          const formattedData = data.data.map((app: any) => ({
            ...app,
            // Map API response to frontend format if needed
            // Add any additional formatting here
          }));
           
          setApplications(formattedData);
          setFilteredApplications(formattedData);
          setErrorLoadingApplications(null);
        } else {
          throw new Error(data.message || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load applications. Please try again later.';
        setErrorLoadingApplications(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [userId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.program && app.program.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.university && app.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.destination && app.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.groupData?.programs?.some(program => 
          program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.university.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setSelectedApplication(null);
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application);
    setSelectedProgram(null);

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

  const handleSaveNewApplication = (data: any) => {
    console.log('New application data:', data);
    // TODO: Implement API call to save new application
  };

 

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview applications={applications} />

      {/* Deadline Alerts */}
      <DeadlineAlert applications={applications} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Application</h2>
                <Button variant="outline" size="sm" className="sm:self-end">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              <div className="relative lg:hidden">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search universities or programs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {errorLoadingApplications ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 font-medium">Error loading applications</p>
                  <p className="text-sm text-gray-500 mt-1">{errorLoadingApplications}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : loadingApplications ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4 mt-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onClick={() => handleApplicationClick(application)}
                    onProgramClick={handleProgramClick}
                    isSelected={selectedApplication?.id === application.id}
                    selectedProgramId={selectedProgram?.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Application Profile Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6 h-[calc(100vh-2rem)] flex flex-col">
            <ApplicationProfile
              onAddNew={() => setShowNewAppModal(true)}
              onStartApplication={(id) => {
                // Handle start application logic here
                console.log('Start application for profile:', id);
              }}
            />
          </div>
        </div>
      </div>

      {/* New Application Modal */}
      <NewApplicationModal
        isOpen={showNewApplicationModal}
        onClose={() => setShowNewApplicationModal(false)}
        onSave={handleSaveNewApplication}
      />
    </div>
  );
};

export default Index;
