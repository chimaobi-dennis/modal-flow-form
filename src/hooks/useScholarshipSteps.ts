import { useState, useEffect } from 'react';

export interface ScholarshipStep {
  id: string;
  stepNumber: number;
  title: string;
  type: 'form' | 'document' | 'information' | 'verification' | 'research';
  status: 'completed' | 'current' | 'pending' | 'overdue';
  deadline?: string;
  videoUrl?: string;
  instructions: {
    header?: string;
    paragraphs?: string[];
    bulletPoints?: string[];
    footer?: string;
  };
  buttons: {
    id: string;
    label: string;
    url?: string;
    variant?: 'default' | 'outline' | 'secondary';
  }[];
  formFields?: {
    id: string;
    type: 'text' | 'textarea' | 'email' | 'number' | 'date' | 'file';
    label: string;
    placeholder?: string;
    required?: boolean;
    value?: string;
  }[];
  documents?: {
    required: string[];
    uploaded: string[];
  };
  alerts?: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }[];
  scholarshipDetails?: {
    name?: string;
    amount?: string;
    provider?: string;
    eligibility?: string[];
  };
}

const SCHOLARSHIP_STORAGE_KEY = 'scholarship_steps';

const defaultScholarshipSteps: ScholarshipStep[] = [
  {
    id: "sch1",
    stepNumber: 1,
    title: "Research Available Scholarships",
    type: "research",
    status: "current",
    deadline: "2024-03-15",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    instructions: {
      header: "Scholarship Research Guidelines",
      paragraphs: [
        "Begin your scholarship journey by researching available opportunities that match your academic profile and financial needs."
      ],
      bulletPoints: [
        "Use NextStep's scholarship database to find relevant opportunities",
        "Check university-specific scholarships for your chosen programs",
        "Look into government scholarships from your home country",
        "Consider external foundation and organization scholarships"
      ],
      footer: "Start early as scholarship application deadlines often come before program application deadlines."
    },
    buttons: [
      { id: "search", label: "Search Scholarships", url: "#", variant: "default" },
      { id: "help", label: "Get Guidance", url: "#", variant: "outline" }
    ],
    alerts: [
      {
        type: "info",
        message: "NextStep's AI can recommend scholarships based on your profile. Use our smart search feature!"
      }
    ]
  },
  {
    id: "sch2",
    stepNumber: 2,
    title: "Prepare Scholarship Essays",
    type: "document",
    status: "pending",
    deadline: "2024-03-30",
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    instructions: {
      header: "Essay Writing Requirements",
      paragraphs: [
        "Most scholarships require compelling essays that demonstrate your motivation, goals, and financial need."
      ],
      bulletPoints: [
        "Write a personal statement explaining your academic goals",
        "Draft a motivation letter for studying in Sweden",
        "Prepare a financial need statement if required",
        "Get your essays reviewed by NextStep's writing experts"
      ]
    },
    buttons: [
      { id: "write", label: "Start Writing", url: "#", variant: "default" },
      { id: "review", label: "Get Review Service", url: "#", variant: "secondary" }
    ],
    documents: {
      required: [
        "Personal Statement",
        "Motivation Letter",
        "Financial Need Statement",
        "Academic Goals Essay"
      ],
      uploaded: [
        "Personal Statement"
      ]
    },
    alerts: [
      {
        type: "warning",
        message: "Essay deadlines are approaching. Start writing to avoid last-minute rush!"
      }
    ]
  },
  {
    id: "sch3",
    stepNumber: 3,
    title: "Gather Required Documents",
    type: "document",
    status: "pending",
    deadline: "2024-04-10",
    instructions: {
      header: "Document Collection Checklist",
      paragraphs: [
        "Compile all necessary documents for your scholarship applications. Requirements vary by scholarship provider."
      ],
      bulletPoints: [
        "Academic transcripts and certificates",
        "Letters of recommendation from professors/employers",
        "Proof of language proficiency (IELTS/TOEFL)",
        "Financial documents showing family income",
        "CV highlighting academic achievements"
      ]
    },
    buttons: [
      { id: "upload", label: "Upload Documents", url: "#", variant: "default" },
      { id: "template", label: "Download Templates", url: "#", variant: "outline" }
    ],
    documents: {
      required: [
        "Academic Transcripts",
        "Recommendation Letters",
        "Language Certificate",
        "Financial Proof",
        "Updated CV"
      ],
      uploaded: []
    }
  },
  {
    id: "sch4",
    stepNumber: 4,
    title: "Submit Applications",
    type: "form",
    status: "pending",
    deadline: "2024-04-20",
    instructions: {
      header: "Application Submission",
      paragraphs: [
        "Submit your scholarship applications through the respective portals. Double-check all requirements before submitting."
      ],
      bulletPoints: [
        "Review all documents for completeness",
        "Submit applications before deadlines",
        "Keep copies of all submitted documents",
        "Track application status regularly"
      ]
    },
    buttons: [
      { id: "submit", label: "Submit Applications", url: "#", variant: "default" },
      { id: "track", label: "Track Status", url: "#", variant: "outline" }
    ],
    alerts: [
      {
        type: "info",
        message: "Remember to submit applications at least 24 hours before the deadline to avoid technical issues."
      }
    ]
  }
];

export const useScholarshipSteps = () => {
  const [steps, setSteps] = useState<ScholarshipStep[]>([]);

  useEffect(() => {
    const savedSteps = localStorage.getItem(SCHOLARSHIP_STORAGE_KEY);
    if (savedSteps) {
      setSteps(JSON.parse(savedSteps));
    } else {
      setSteps(defaultScholarshipSteps);
      localStorage.setItem(SCHOLARSHIP_STORAGE_KEY, JSON.stringify(defaultScholarshipSteps));
    }
  }, []);

  const updateSteps = (newSteps: ScholarshipStep[]) => {
    setSteps(newSteps);
    localStorage.setItem(SCHOLARSHIP_STORAGE_KEY, JSON.stringify(newSteps));
  };

  const updateStep = (stepId: string, updates: Partial<ScholarshipStep>) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    updateSteps(updatedSteps);
  };

  const addStep = (newStep: ScholarshipStep) => {
    const updatedSteps = [...steps, newStep];
    updateSteps(updatedSteps);
  };

  const deleteStep = (stepId: string) => {
    const updatedSteps = steps.filter(step => step.id !== stepId);
    updateSteps(updatedSteps);
  };

  return {
    steps,
    updateSteps,
    updateStep,
    addStep,
    deleteStep
  };
};