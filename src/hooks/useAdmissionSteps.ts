import { useState, useEffect } from 'react';

export interface ProgramApplication {
  id: string;
  universityName: string;
  programName: string;
  degree: string;
  appliedDate: string;
  applicationStatus: 'submitted' | 'under_review' | 'admitted' | 'rejected' | 'waitlisted';
  admissionStatus?: 'pending' | 'accepted' | 'declined';
  deadline?: string;
  tuitionFee?: string;
  startDate?: string;
  requirements?: string[];
  documents?: {
    required: string[];
    submitted: string[];
  };
}

const ADMISSION_STORAGE_KEY = 'program_applications';

const defaultApplications: ProgramApplication[] = [
  {
    id: "app1",
    universityName: "KTH Royal Institute of Technology",
    programName: "Computer Science and Engineering",
    degree: "Master's",
    appliedDate: "2024-01-15",
    applicationStatus: "admitted",
    admissionStatus: "pending",
    deadline: "2024-04-30",
    tuitionFee: "SEK 140,000/year",
    startDate: "2024-08-26",
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "IELTS 6.5 or TOEFL 90",
      "GPA minimum 3.0/4.0"
    ],
    documents: {
      required: ["Transcripts", "Degree Certificate", "Language Certificate", "SOP", "CV"],
      submitted: ["Transcripts", "Degree Certificate", "Language Certificate", "SOP", "CV"]
    }
  },
  {
    id: "app2",
    universityName: "Stockholm University",
    programName: "International Business",
    degree: "Master's",
    appliedDate: "2024-01-20",
    applicationStatus: "admitted",
    admissionStatus: "pending",
    deadline: "2024-05-15",
    tuitionFee: "SEK 120,000/year",
    startDate: "2024-08-30",
    requirements: [
      "Bachelor's degree in Business or related field",
      "IELTS 6.5 or TOEFL 90",
      "Work experience preferred"
    ],
    documents: {
      required: ["Transcripts", "Degree Certificate", "Language Certificate", "SOP", "CV"],
      submitted: ["Transcripts", "Degree Certificate", "Language Certificate", "SOP"]
    }
  },
  {
    id: "app3",
    universityName: "Lund University",
    programName: "Sustainable Development",
    degree: "Master's",
    appliedDate: "2024-02-01",
    applicationStatus: "under_review",
    deadline: "2024-06-01",
    tuitionFee: "SEK 130,000/year",
    startDate: "2024-09-02",
    requirements: [
      "Bachelor's degree in relevant field",
      "IELTS 7.0 or TOEFL 100",
      "Statement of Purpose"
    ],
    documents: {
      required: ["Transcripts", "Degree Certificate", "Language Certificate", "SOP", "CV"],
      submitted: ["Transcripts", "Language Certificate", "SOP", "CV"]
    }
  }
];

export const useAdmissionSteps = () => {
  const [applications, setApplications] = useState<ProgramApplication[]>([]);

  useEffect(() => {
    const savedApplications = localStorage.getItem(ADMISSION_STORAGE_KEY);
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    } else {
      setApplications(defaultApplications);
      localStorage.setItem(ADMISSION_STORAGE_KEY, JSON.stringify(defaultApplications));
    }
  }, []);

  const updateApplications = (newApplications: ProgramApplication[]) => {
    setApplications(newApplications);
    localStorage.setItem(ADMISSION_STORAGE_KEY, JSON.stringify(newApplications));
  };

  const updateApplication = (appId: string, updates: Partial<ProgramApplication>) => {
    const updatedApplications = applications.map(app => 
      app.id === appId ? { ...app, ...updates } : app
    );
    updateApplications(updatedApplications);
  };

  const acceptAdmission = (appId: string) => {
    updateApplication(appId, { admissionStatus: 'accepted' });
  };

  const declineAdmission = (appId: string) => {
    updateApplication(appId, { admissionStatus: 'declined' });
  };

  const addApplication = (newApp: ProgramApplication) => {
    const updatedApplications = [...applications, newApp];
    updateApplications(updatedApplications);
  };

  return {
    applications,
    updateApplications,
    updateApplication,
    acceptAdmission,
    declineAdmission,
    addApplication
  };
};