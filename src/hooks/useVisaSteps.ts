import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface VisaStep {
  id: string;
  stepNumber: number;
  title: string;
  type: 'document' | 'application' | 'appointment' | 'interview' | 'decision' | 'information';
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
    status: 'yes' | 'no';
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    buttonLink?: string;
    buttonLabel?: string;
    footer?: string;
    header?: string;
    body?: string;
  }[];
  appointmentDetails?: {
    location?: string;
    date?: string;
    time?: string;
    requirements?: string[];
  };
}

export const useVisaSteps = (destinationId?: string) => {
  const [steps, setSteps] = useState<VisaStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch visa steps from API
  const fetchVisaSteps = async () => {
    if (!destinationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://uniplanr.com/api/v1/study-destination-steps/${destinationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch visa steps');
      }

      const data = await response.json();
      // The API may return visaSteps as a JSON string – handle both string and array formats safely
      let visaSteps: unknown = data.visaSteps;
      if (typeof visaSteps === 'string') {
        try {
          visaSteps = JSON.parse(visaSteps);
        } catch (parseErr) {
          console.error('Failed to parse visaSteps JSON string', parseErr);
          visaSteps = [];
        }
      }
      if (!Array.isArray(visaSteps)) {
        visaSteps = [];
      }
      setSteps(visaSteps as VisaStep[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to load visa steps: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update all visa steps via API
  const updateSteps = async (newSteps: VisaStep[]) => {
    if (!destinationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://uniplanr.com/api/v1/update-study-destination-steps/${destinationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ visaSteps: newSteps }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visa steps');
      }

      setSteps(newSteps);
      toast.success('Visa steps updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to update visa steps: ' + errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a single visa step
  const updateStep = async (stepId: string, updates: Partial<VisaStep>) => {
    if (!destinationId) return;

    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, ...updates } : step
    );

    await updateSteps(updatedSteps);
  };

  // Add a new visa step
  const addStep = async (newStep: VisaStep) => {
    if (!destinationId) return;

    const updatedSteps = [...steps, newStep].sort((a, b) => a.stepNumber - b.stepNumber);
    await updateSteps(updatedSteps);
  };

  // Delete a visa step
  const deleteStep = async (stepId: string) => {
    if (!destinationId) return;

    const updatedSteps = steps.filter(step => step.id !== stepId);
    await updateSteps(updatedSteps);
  };

  // Load visa steps when destinationId changes
  useEffect(() => {
    if (destinationId) {
      fetchVisaSteps();
    }
  }, [destinationId]);

  return {
    steps,
    loading,
    error,
    fetchVisaSteps,
    updateSteps,
    updateStep,
    addStep,
    deleteStep
  };
};