import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Save,
  Plus,
  Trash2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

interface GeneralProfile {
  fullName: string;
  email: string;
  phone: string;
  notificationsEnabled: boolean;
}

interface ApplicationProfile {
  id: string;
  name: string;
  citizenship: string;
  englishTest: string;
  testType: string;
  testYear: string;
  testScore: string;
  workExperience: string;
  tuitionPreference: string;
  targetCountries: string[];
  fieldOfStudy: string;
  degreeLevel: string;
  preferredStartDate: string;
  budget: string;
  gpa: string;
  createdAt: string;
  lastModified: string;
}

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "China",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Italy",
  "Japan",
  "Kenya",
  "Malaysia",
  "Mexico",
  "Netherlands",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Poland",
  "Russia",
  "Saudi Arabia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Vietnam",
];

const englishTests = [
  "IELTS",
  "TOEFL",
  "PTE Academic",
  "Cambridge English",
  "Duolingo English Test",
];

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [generalProfile, setGeneralProfile] = useState<GeneralProfile>({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 555-123-4567",
    notificationsEnabled: true,
  });
  const [applicationProfiles, setApplicationProfiles] = useState<
    ApplicationProfile[]
  >([
    {
      id: "1",
      name: "Profile 1",
      citizenship: "United States",
      englishTest: "yes",
      testType: "IELTS",
      testYear: "2023",
      testScore: "7.5",
      workExperience: "2-3",
      tuitionPreference: "low",
      targetCountries: ["Sweden", "Germany"],
      fieldOfStudy: "Computer Science",
      degreeLevel: "Master's",
      preferredStartDate: "Fall 2024",
      budget: "20000",
      gpa: "3.8",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  ]);
  const [selectedApplicationProfile, setSelectedApplicationProfile] =
    useState<ApplicationProfile | null>(applicationProfiles[0]);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveProfile = () => {
    // Basic validation
    if (!generalProfile.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!generalProfile.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!generalProfile.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    toast.success('Profile updated successfully!');
    console.log('Saving general profile:', generalProfile);
  };

  const handleSaveApplicationProfile = () => {
    if (!selectedApplicationProfile) {
      toast.error('No application profile selected');
      return;
    }

    // Basic validation
    if (!selectedApplicationProfile.name.trim()) {
      toast.error('Application profile name is required');
      return;
    }
    if (!selectedApplicationProfile.citizenship) {
      toast.error('Citizenship is required');
      return;
    }

    toast.success(`Application profile "${selectedApplicationProfile.name}" saved successfully!`);
    console.log('Saving application profile:', selectedApplicationProfile);
  };

  const handleCreateNewProfile = () => {
    const newProfile: ApplicationProfile = {
      id: Date.now().toString(),
      name: `Application Profile ${applicationProfiles.length + 1}`,
      citizenship: '',
      englishTest: '',
      testType: '',
      testYear: '',
      testScore: '',
      workExperience: '',
      tuitionPreference: '',
      targetCountries: [],
      fieldOfStudy: '',
      degreeLevel: '',
      preferredStartDate: '',
      budget: '',
      gpa: '',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setApplicationProfiles([...applicationProfiles, newProfile]);
    setSelectedApplicationProfile(newProfile);
    toast.success('New application profile created!');
  };

  const handleDeleteProfile = (profileId: string) => {
    if (applicationProfiles.length <= 1) {
      toast.error('Cannot delete the last application profile');
      return;
    }

    const profileToDelete = applicationProfiles.find(p => p.id === profileId);
    setApplicationProfiles(applicationProfiles.filter(p => p.id !== profileId));
    
    if (selectedApplicationProfile?.id === profileId) {
      setSelectedApplicationProfile(applicationProfiles.find(p => p.id !== profileId) || null);
    }
    
    toast.success(`Application profile "${profileToDelete?.name}" deleted successfully`);
  };

  const handleChangeEmail = () => {
    if (!newEmail.trim()) {
      toast.error('New email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setGeneralProfile({ ...generalProfile, email: newEmail });
    setNewEmail('');
    setShowEmailChange(false);
    toast.success('Email updated successfully!');
  };

  const handleChangePassword = () => {
    if (!currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    if (!newPassword.trim()) {
      toast.error('New password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
    toast.success('Password changed successfully!');
  };

  const renderGeneralProfileForm = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Update your basic profile information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              id="name"
              placeholder="Enter your full name"
              value={generalProfile.fullName}
              onChange={(e) =>
                setGeneralProfile({ ...generalProfile, fullName: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter your email address"
              value={generalProfile.email}
              onChange={(e) =>
                setGeneralProfile({ ...generalProfile, email: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              value={generalProfile.phone}
              onChange={(e) =>
                setGeneralProfile({ ...generalProfile, phone: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your notification and communication preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Email Notifications</Label>
            <Switch
              id="notifications"
              checked={generalProfile.notificationsEnabled}
              onCheckedChange={(checked) =>
                setGeneralProfile({
                  ...generalProfile,
                  notificationsEnabled: checked,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderApplicationProfiles = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Selection */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Profile</CardTitle>
              <CardDescription>
                Choose an application profile to view and edit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {applicationProfiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant={
                    selectedApplicationProfile?.id === profile.id
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => setSelectedApplicationProfile(profile)}
                >
                  {profile.name}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="md:col-span-2">
          {selectedApplicationProfile ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <CardTitle>
                    {selectedApplicationProfile.name}
                  </CardTitle>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteProfile(selectedApplicationProfile.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Manage details for your study abroad applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="profileName">Profile Name</Label>
                  <Input
                    type="text"
                    id="profileName"
                    placeholder="Enter profile name"
                    value={selectedApplicationProfile.name}
                    onChange={(e) =>
                      setSelectedApplicationProfile({
                        ...selectedApplicationProfile,
                        name: e.target.value,
                        lastModified: new Date().toISOString(),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="citizenship">Citizenship</Label>
                  <Select
                    value={selectedApplicationProfile.citizenship}
                    onValueChange={(value) =>
                      setSelectedApplicationProfile({
                        ...selectedApplicationProfile,
                        citizenship: value,
                        lastModified: new Date().toISOString(),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* English Test Details */}
                <div className="space-y-2">
                  <Label>Have you taken any English test in the past 5 years?</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="englishTestYes"
                        checked={selectedApplicationProfile.englishTest === "yes"}
                        onCheckedChange={(checked) =>
                          setSelectedApplicationProfile({
                            ...selectedApplicationProfile,
                            englishTest: checked ? "yes" : "no",
                            lastModified: new Date().toISOString(),
                          })
                        }
                      />
                      <Label htmlFor="englishTestYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="englishTestNo"
                        checked={selectedApplicationProfile.englishTest === "no"}
                        onCheckedChange={(checked) =>
                          setSelectedApplicationProfile({
                            ...selectedApplicationProfile,
                            englishTest: checked ? "no" : "yes",
                            lastModified: new Date().toISOString(),
                          })
                        }
                      />
                      <Label htmlFor="englishTestNo">No</Label>
                    </div>
                  </div>
                </div>

                {selectedApplicationProfile.englishTest === "yes" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="testType">Which test did you take?</Label>
                      <Select
                        value={selectedApplicationProfile.testType}
                        onValueChange={(value) =>
                          setSelectedApplicationProfile({
                            ...selectedApplicationProfile,
                            testType: value,
                            lastModified: new Date().toISOString(),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          {englishTests.map((test) => (
                            <SelectItem key={test} value={test}>
                              {test}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="testYear">Test Year</Label>
                      <Input
                        type="number"
                        id="testYear"
                        placeholder="e.g., 2023"
                        value={selectedApplicationProfile.testYear}
                        onChange={(e) =>
                          setSelectedApplicationProfile({
                            ...selectedApplicationProfile,
                            testYear: e.target.value,
                            lastModified: new Date().toISOString(),
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="testScore">Test Score</Label>
                      <Input
                        id="testScore"
                        placeholder="e.g., 7.5 (IELTS) or 100 (TOEFL)"
                        value={selectedApplicationProfile.testScore}
                        onChange={(e) =>
                          setSelectedApplicationProfile({
                            ...selectedApplicationProfile,
                            testScore: e.target.value,
                            lastModified: new Date().toISOString(),
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                <div className="grid gap-2">
                  <Label htmlFor="workExperience">Work Experience</Label>
                  <Select
                    value={selectedApplicationProfile.workExperience}
                    onValueChange={(value) =>
                      setSelectedApplicationProfile({
                        ...selectedApplicationProfile,
                        workExperience: value,
                        lastModified: new Date().toISOString(),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="4-6">4-6 years</SelectItem>
                      <SelectItem value="7+">7+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tuition Preference */}
                <div className="grid gap-2">
                  <Label htmlFor="tuitionPreference">Tuition Preference</Label>
                  <Select
                    value={selectedApplicationProfile.tuitionPreference}
                    onValueChange={(value) =>
                      setSelectedApplicationProfile({
                        ...selectedApplicationProfile,
                        tuitionPreference: value,
                        lastModified: new Date().toISOString(),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low cost programs</SelectItem>
                      <SelectItem value="no-matter">Cost doesn't matter</SelectItem>
                      <SelectItem value="high-quality">
                        High cost with quality education
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <div className="flex justify-end p-4">
                <Button onClick={handleSaveApplicationProfile} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <h3 className="text-lg font-medium mb-2">
                  No Profile Selected
                </h3>
                <p className="text-muted-foreground">
                  Select an application profile to view and edit its details.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Manage your email address associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Current Email: {generalProfile.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmailChange(true)}
            >
              Change Email
            </Button>
          </div>

          {showEmailChange && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="newEmail">New Email</Label>
              <Input
                type="email"
                id="newEmail"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowEmailChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangeEmail}>
                  Update Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your account password for enhanced security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Password: ••••••••</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordChange(true)}
            >
              Change Password
            </Button>
          </div>

          {showPasswordChange && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowPasswordChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangePassword}>
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const handleUpcomingFeature = (featureName: string) => {
    toast.info(`${featureName} feature coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-gray-600">
            Manage your profile information and settings.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="border-b">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="applications">Application Profiles</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>

          {/* General Profile Tab */}
          <TabsContent value="general" className="space-y-6">
            {renderGeneralProfileForm()}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Profile
              </Button>
            </div>
          </TabsContent>

          {/* Application Profiles Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Application Profiles</h3>
              <Button onClick={handleCreateNewProfile} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Profile
              </Button>
            </div>

            {renderApplicationProfiles()}
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-6">
            {renderAccountSettings()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyProfile;
