import { useState, useEffect } from 'react';

export interface ActivityLog {
  id: string;
  created_at: string;
  activity: string;
  details: string;
  type: string;
  role?: string;
  location?: string;
}

export const useActivityLogger = (userId?: string, applicationId?: string) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

 
  const logActivity = async (activity: Omit<ActivityLog, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('https://uniplanr.com/api/v1/activity-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          ...activity,
          user_id: userId,
          application_id: applicationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      const newActivity = await response.json();
      setActivities(prev => [newActivity, ...prev].slice(0, 100));
      return newActivity;
    } catch (err) {
      console.error('Error logging activity:', err);
      throw err;
    }
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('ACTIVITY_STORAGE_KEY');
  };

  return {
    activities,
    logActivity,
    clearActivities,
    isLoading,
    error
  };
};