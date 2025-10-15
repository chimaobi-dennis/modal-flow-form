import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

export interface StepField {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  jsId?: string;
  wireModel?: string;
}

export interface StepButton {
  id: string;
  label: string;
  url?: string;
  variant?: 'default' | 'outline' | 'secondary';
  jsId?: string;
  wireClick?: string;
  icon?: string;
}

export interface ApplicationStep {
  id: string;
  stepNumber: number;
  title: string;
  type: 'registration' | 'program' | 'document' | 'payment' | 'admission' | 'information';
  status: 'completed' | 'current' | 'pending' | 'overdue';
  deadline?: string;
  videoUrl?: string;
  instructions: {
    header?: string;
    paragraphs?: string[];
    bulletPoints?: string[];
    footer?: string;
  };
  buttons: StepButton[];
  formFields?: StepField[];
  documents?: {
    required: string[];
    uploaded: string[];
  };
  alerts?: {
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }[];
  adminMessage?: string;
  programSettings?: {
    maxPrograms: number;
    selectedPrograms: string[];
  };
  externalAccount?: {
    username?: string;
    password?: string;
    portalUrl?: string;
  };
}
export interface StudyDestination {
  name: string;
  why_study_here: WhyStudyHere[];
  study_period: string;
  application_period_from: string;
  application_period_to: string;
  timezone: string;
  max_program: number;
  application_portal: string;
  application_type: string;
  application_cost: number;
  images: string[];
  status: string;
  updated_at: string;
  currency: string;
}
export interface WhyStudyHere {
  id: string;
  header: string;
  body: string;
}
export interface ApplicationIntake {
  id: string;
  name: string;
  months: string;
  deadline: string;
}

export const useStepsData = (destinationId?: string) => {
  const [steps, setSteps] = useState<ApplicationStep[]>([]);
  const [destination, setStudyDestination] = useState<StudyDestination | null>(null);
  const [whyStudyHere, setWhyStudyHere] = useState<WhyStudyHere[]>([]);
  const [intakes, setIntakes] = useState<ApplicationIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDestination = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/v1/study-destination-steps/${destinationId}`);
      const apiSteps = await response.json();
      setSteps(apiSteps.steps);
      setStudyDestination(apiSteps.destination);
      // Add IDs to why_study_here items if they don't have them
      const whyStudyHereData = apiSteps.why_study_here || [];
      const whyStudyHereWithIds = whyStudyHereData.map((item: any, index: number) => ({
        ...item,
        id: item.id || `why-study-here-${index}`
      }));
      setWhyStudyHere(whyStudyHereWithIds);
      setIntakes(apiSteps.intakes);
      console.log(apiSteps.destination);
      setError(null);
      return apiSteps;
    } catch (err) {
      setError(err as Error);
      setSteps([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (destinationId) {
      fetchDestination();
    } else {
      setSteps([]);
      setIsLoading(false);
    }
  }, [destinationId]);
  // Update Steps API
  const updateDestinationSteps = async (newSteps: ApplicationStep[]) => {
    try {
      setIsUpdating(true);
      setSteps(newSteps);
      if (destinationId) {
        const response = await fetch(`/api/v1/update-study-destination-steps/${destinationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          },
          body: JSON.stringify({ steps: newSteps }),
        });

        if (!response.ok) {
          throw new Error('Failed to update steps');
        }

        const data = await response.json();
        toast.success('Step updated');
        return data;
      }
    } catch (err) {
      toast.error('Failed to update steps');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };
  //Update Details API
  const updateDestinationDetails = async (updatedData: Partial<StudyDestination>) => {
    try {
      setIsUpdating(true);
      if (destinationId) {
        const response = await fetch(`/api/v1/study-destinations-details/${destinationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
          },
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          throw new Error('Failed to update destination');
        }
        // Optionally refresh data
        await fetchDestination();
        toast.success('Destination updated');
        return await response.json();
      }
    } catch (err) {
      toast.error('Failed to update destination');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStep = (stepId: string, updates: Partial<ApplicationStep>) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    updateDestinationSteps(updatedSteps);
  };

  const addStep = (newStep: ApplicationStep) => {
    const updatedSteps = [...steps, newStep];
    updateDestinationSteps(updatedSteps);
  };

  const deleteStep = (stepId: string) => {
    const updatedSteps = steps.filter(step => step.id !== stepId);
    updateDestinationSteps(updatedSteps);
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];

      // Update step numbers to match new positions
      newSteps.forEach((step, index) => {
        step.stepNumber = index + 1;
      });

      updateDestinationSteps(newSteps);
    }
  };

  return {
    steps,
    isLoading,
    error,
    isUpdating,
    destination,
    whyStudyHere,
    intakes,
    setIntake: setIntakes,
    setWhyStudyHere,
    setDestination: setStudyDestination,
    updateDestinationSteps,
    updateDestinationDetails,
    updateStep,
    addStep,
    deleteStep,
    moveStep,
    refetch: destinationId ? () => fetchDestination() : undefined,
  };
};