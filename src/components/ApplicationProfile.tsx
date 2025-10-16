import { useEffect, useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, Check, X, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
const userId = document.getElementById('root')?.getAttribute('data-user-id');


interface Profile {
  id: number;
  degree: string;
  fields: string;
  area_of_study: string;
  origin_country: string;
  desired_field: string;
  status: string;
  language: string;
  language_test_type: string;
  language_test_year: string;
  language_test_score: string;
  has_language_test: boolean;
  study_envs: string[];
  interst_keywords: string[];
  recommended_programs: string[];
  application:string[];
  // Add any other fields that might come from the API
  [key: string]: any; // For any additional fields
}

interface ApplicationProfileProps {
  onAddNew: () => void;
  onStartApplication: (id: number) => void;
}

export const ApplicationProfile = ({ onAddNew, onStartApplication }: ApplicationProfileProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://uniplanr.com/api/v1/student-profiles/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profiles');
        }
        const data = await response.json();
        setProfiles(data);
        console.log('data', data);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles. Please try again later.');
        toast.error('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingId(null);
  };

  const startEditing = (app: Profile) => {
    setEditForm({ ...app });
    setEditingId(app.id);
  };

  const handleEditChange = (field: keyof Profile, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`https://uniplanr.com/api/v1/student-profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update the local state with the edited profile
      setProfiles(profiles.map(profile =>
        profile.id === id ? { ...profile, ...editForm } : profile
      ));

      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const deleteApplication = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      const response = await fetch(`https://uniplanr.com/api/v1/student-profiles/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      // Remove the deleted profile from the local state
      setProfiles(profiles.filter(profile => profile.id !== id));
      toast.success('Profile deleted successfully');
    } catch (err) {
      console.error('Error deleting profile:', err);
      toast.error('Failed to delete profile');
    }
  };


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString();
  };

  // if (loading) {
  //   return (
  //     <div className="h-full flex items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Application Profiles</h3>
        <Button variant="outline" size="sm" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Profile
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4 mt-4"></div>
              </div>
            ))}
          </div>
        ) : profiles.length > 0 ? profiles.map((app) => (
          <div key={app.id} className="border rounded-lg overflow-hidden">
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleExpand(app.id)}
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {app.degree || 'Degree'} in {app.fields || 'Fields'}
                </h4>
                <p className="text-sm text-gray-500 truncate">{app.origin_country || 'Origin Country'} - {app.area_of_study || 'Area of Study'}</p>
                <div className="mt-1 flex items-center text-sm text-gray-600">
                  <span>{app.recommended_programs?.length || 0} recommended programs</span>
                  {app.country && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{app.country}</span>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-sm w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    const params = new URLSearchParams({
                      profileID: app.id.toString(),
                      Degree: app.degree || '',
                      Field: app.fields || '',
                      Country: app.origin_country || '',
                      ...(app.desired_fields && { 'desiredFields[]': app.desired_fields })
                    });
                    window.location.href = `start-application?${params.toString()}`;
                  }}
                >
                  Start Application <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="ml-2">
                {expandedId === app.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {expandedId === app.id && (
              <div className="p-4 border-t bg-gray-50">

                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      Status: {!app.application ? 'Not Started' : `Applications: ${app.application.join(', ')}`}
                    </p>
                  </div>
                  {/* //update here letter */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(app);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )) : (
          <div className="flex-1 flex items-center justify-center h-full">
            <p className="text-gray-500">No profiles found</p>
          </div>
        )}
      </div>
    </div>
  );
};