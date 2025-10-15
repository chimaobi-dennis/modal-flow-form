
import { useState, useEffect } from "react";
import { Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApplicationCard } from "@/components/ApplicationCard";
import { StatsOverview } from "@/components/StatsOverview";
import { DeadlineAlert } from "@/components/DeadlineAlert";
import { ApplicationSteps } from "@/components/ApplicationSteps";
import NewApplicationModal from "@/components/NewApplicationModal";
import { toast } from "sonner";

const Index = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    setSelectedApplication(null); // Clear application selection when program is selected
  };

  const handleApplicationClick = (application) => {
    setSelectedApplication(application);
    setSelectedProgram(null); // Clear program selection when application is selected
    
    // Show mobile guidance toast and auto-scroll
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

  const applications = [
    {
      id: 1,
      university: "Stanford University",
      program: "Computer Science",
      deadline: "2024-01-15",
      status: "In Progress",
      progress: 65,
      requirements: ["Personal Statement", "Transcripts", "Letters of Rec", "Test Scores"],
      completed: ["Transcripts", "Test Scores"]
    },
    {
      id: 2,
      university: "MIT",
      program: "Electrical Engineering",
      deadline: "2024-01-01",
      status: "Submitted",
      progress: 100,
      requirements: ["Personal Statement", "Transcripts", "Letters of Rec", "Portfolio"],
      completed: ["Personal Statement", "Transcripts", "Letters of Rec", "Portfolio"]
    },
    {
      id: 3,
      university: "University of California System",
      program: "Multiple Programs",
      deadline: "2024-02-01",
      status: "In Progress",
      progress: 45,
      requirements: ["Personal Statement", "Transcripts", "Letters of Rec", "Test Scores"],
      completed: ["Transcripts"],
      isGroup: true,
      groupData: {
        id: 3,
        groupName: "UC System Applications",
        university: "University of California System",
        status: "In Progress",
        progress: 45,
        programs: [
          {
            id: 31,
            name: "Computer Science - UC Berkeley",
            university: "UC Berkeley",
            deadline: "2024-02-01",
            status: "In Progress",
            progress: 60,
            requirements: ["Personal Statement", "Transcripts", "Letters of Rec"],
            completed: ["Transcripts"]
          },
          {
            id: 32,
            name: "Data Science - UCLA",
            university: "UCLA",
            deadline: "2024-02-01",
            status: "Not Started",
            progress: 30,
            requirements: ["Personal Statement", "Transcripts", "Letters of Rec"],
            completed: ["Transcripts"]
          },
          {
            id: 33,
            name: "Software Engineering - UC San Diego",
            university: "UC San Diego",
            deadline: "2024-02-01",
            status: "In Progress",
            progress: 45,
            requirements: ["Personal Statement", "Transcripts", "Letters of Rec"],
            completed: ["Transcripts"]
          }
        ],
        deadline: "2024-02-01"
      }
    },
    {
      id: 4,
      university: "Harvard University",
      program: "Business Administration",
      deadline: "2024-01-10",
      status: "Under Review",
      progress: 100,
      requirements: ["Personal Statement", "Transcripts", "Letters of Rec", "Interview"],
      completed: ["Personal Statement", "Transcripts", "Letters of Rec", "Interview"]
    },
    {
      id: 5,
      university: "Swedish Universities",
      program: "Multiple Programs",
      deadline: "2024-01-15",
      status: "In Progress",
      progress: 75,
      requirements: ["Personal Statement", "Transcripts", "Letters of Rec"],
      completed: ["Transcripts", "Letters of Rec"],
      isGroup: true,
      groupData: {
        id: 5,
        groupName: "Swedish Master's Programs",
        university: "Swedish Universities",
        status: "In Progress",
        progress: 75,
        programs: [
          {
            id: 51,
            name: "Computer Science - KTH Royal Institute",
            university: "KTH Royal Institute of Technology",
            deadline: "2024-01-15",
            status: "Submitted",
            progress: 100,
            requirements: ["Personal Statement", "Transcripts", "Letters of Rec"],
            completed: ["Personal Statement", "Transcripts", "Letters of Rec"]
          },
          {
            id: 52,
            name: "Data Science - Uppsala University",
            university: "Uppsala University",
            deadline: "2024-01-15",
            status: "In Progress",
            progress: 80,
            requirements: ["Personal Statement", "Transcripts", "Letters of Rec"],
            completed: ["Transcripts", "Letters of Rec"]
          },
          {
            id: 53,
            name: "AI & Machine Learning - Chalmers",
            university: "Chalmers University of Technology",
            deadline: "2024-01-15",
            status: "In Progress",
            progress: 45,
            requirements: ["Personal Statement", "Transcripts", "Letters of Rec"],
            completed: ["Transcripts"]
          }
        ],
        deadline: "2024-01-15"
      }
    }
  ];

  const filteredApplications = applications.filter(app =>
    app.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveNewApplication = (data) => {
    console.log('New application data:', data);
    // Here you would typically save to your backend/state management
    // For now, we'll just log it
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview applications={applications} />

      {/* Deadline Alerts */}
      <DeadlineAlert applications={applications} />

      {/* Start New Application Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowNewApplicationModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="h-6 w-6 mr-3" />
          Start New Application
          <div className="ml-3 px-2 py-1 bg-white/20 rounded-full text-sm">
            Free
          </div>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
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
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onClick={() => handleApplicationClick(application)}
                  onProgramClick={handleProgramClick}
                  isSelected={selectedApplication?.id === application.id}
                  selectedProgramId={selectedProgram?.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Application Steps Panel */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <ApplicationSteps 
              application={selectedProgram || selectedApplication || applications[0]} 
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
