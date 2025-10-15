import React, { useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MoveUp, 
  MoveDown,
  Eye,
  Settings,
  FileText,
  Upload,
  AlertCircle,
  MessageSquare,
  Search,
  ChevronDown,
  Home,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Camera,
  Heart,
  Star,
  Play,
  Download,
  Share,
  Lock,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStepsData, ApplicationStep, StepField, StepButton } from "@/hooks/useStepsData";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const AdminSteps = () => {
  const { steps, updateSteps, addStep, deleteStep: removeStep } = useStepsData();
  const [editingStep, setEditingStep] = useState<ApplicationStep | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createNewStep = () => {
    const newStep: ApplicationStep = {
      id: Date.now().toString(),
      stepNumber: steps.length + 1,
      title: "",
      type: "information",
      status: "pending",
      deadline: "",
      instructions: {
        header: "",
        paragraphs: [""],
        footer: ""
      },
      buttons: [],
      videoUrl: ""
    };
    setEditingStep(newStep);
    setIsCreating(true);
  };

  const saveStep = () => {
    if (!editingStep) return;

    if (isCreating) {
      addStep(editingStep);
      setIsCreating(false);
    } else {
      const updatedSteps = steps.map(step => step.id === editingStep.id ? editingStep : step);
      updateSteps(updatedSteps);
    }
    setEditingStep(null);
  };

  const deleteStepHandler = (stepId: string) => {
    removeStep(stepId);
    if (editingStep?.id === stepId) {
      setEditingStep(null);
    }
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
      
      // Update step numbers
      newSteps.forEach((step, index) => {
        step.stepNumber = index + 1;
      });
      
      updateSteps(newSteps);
    }
  };

  const addButton = () => {
    if (!editingStep) return;
    const newButton: StepButton = {
      id: Date.now().toString(),
      label: "",
      variant: "default",
      icon: "Play"
    };
    setEditingStep({
      ...editingStep,
      buttons: [...editingStep.buttons, newButton]
    });
  };

  const removeButton = (buttonId: string) => {
    if (!editingStep) return;
    setEditingStep({
      ...editingStep,
      buttons: editingStep.buttons.filter(btn => btn.id !== buttonId)
    });
  };

  const addFormField = () => {
    if (!editingStep) return;
    const newField: StepField = {
      id: Date.now().toString(),
      type: "text",
      label: "",
      required: false
    };
    setEditingStep({
      ...editingStep,
      formFields: [...(editingStep.formFields || []), newField]
    });
  };

  const availableIcons = [
    'Play', 'Download', 'Upload', 'Save', 'Edit', 'Trash2', 'Plus', 'X', 'Check', 
    'Eye', 'Settings', 'Search', 'Home', 'User', 'Mail', 'Phone', 'Calendar', 
    'MapPin', 'Globe', 'Camera', 'Heart', 'Star', 'Share', 'Lock', 'AlertCircle'
  ];

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Play, Download, Upload, Save, Edit, Trash2, Plus, X, Check, Eye, Settings, 
      Search, Home, User, Mail, Phone, Calendar, MapPin, Globe, Camera, Heart, 
      Star, Share, Lock, AlertCircle
    };
    return iconMap[iconName] || Play;
  };

  const removeFormField = (fieldId: string) => {
    if (!editingStep) return;
    setEditingStep({
      ...editingStep,
      formFields: editingStep.formFields?.filter(field => field.id !== fieldId)
    });
  };

  const addAlert = () => {
    if (!editingStep) return;
    const newAlert = {
      type: 'info' as const,
      message: ""
    };
    setEditingStep({
      ...editingStep,
      alerts: [...(editingStep.alerts || []), newAlert]
    });
  };

  const removeAlert = (index: number) => {
    if (!editingStep) return;
    setEditingStep({
      ...editingStep,
      alerts: editingStep.alerts?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Step Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage application steps and their content
          </p>
        </div>
        
        <Button onClick={createNewStep} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Step
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Steps List */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Application Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 border-l-4 ${
                      editingStep?.id === step.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-transparent hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {step.stepNumber}. {step.title || 'Untitled Step'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {step.type}
                          </Badge>
                          <Badge 
                            variant={step.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {step.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStep(step)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStepHandler(step.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === steps.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Editor */}
        <div className="xl:col-span-2">
          {editingStep ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    {isCreating ? 'Create New Step' : 'Edit Step'}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={saveStep} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingStep(null);
                        setIsCreating(false);
                      }} 
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="buttons">Buttons</TabsTrigger>
                    <TabsTrigger value="forms">Forms</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  {/* Basic Tab */}
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Step Number</Label>
                        <Input
                          type="number"
                          value={editingStep.stepNumber}
                          onChange={(e) => setEditingStep({
                            ...editingStep,
                            stepNumber: parseInt(e.target.value) || 1
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Step Type</Label>
                        <Select
                          value={editingStep.type}
                          onValueChange={(value: any) => setEditingStep({
                            ...editingStep,
                            type: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="form">Form</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="information">Information</SelectItem>
                            <SelectItem value="verification">Verification</SelectItem>
                            <SelectItem value="program">Program Selection</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Step Title</Label>
                      <Input
                        value={editingStep.title}
                        onChange={(e) => setEditingStep({
                          ...editingStep,
                          title: e.target.value
                        })}
                        placeholder="Enter step title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Step Description</Label>
                      <Textarea
                        value={editingStep.instructions?.header || ''}
                        onChange={(e) => setEditingStep({
                          ...editingStep,
                          instructions: {
                            ...editingStep.instructions,
                            header: e.target.value
                          }
                        })}
                        placeholder="Enter step description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editingStep.status}
                          onValueChange={(value: any) => setEditingStep({
                            ...editingStep,
                            status: value
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="current">Current</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Deadline</Label>
                        <Input
                          type="date"
                          value={editingStep.deadline}
                          onChange={(e) => setEditingStep({
                            ...editingStep,
                            deadline: e.target.value
                          })}
                        />
                      </div>
                    </div>

                    {/* Program Settings */}
                    {editingStep.type === 'program' && (
                      <div className="space-y-4 border-t pt-4">
                        <Label>Program Settings</Label>
                        <div className="space-y-2">
                          <Label>Maximum Programs Users Can Select</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={editingStep.programSettings?.maxPrograms || 8}
                            onChange={(e) => setEditingStep({
                              ...editingStep,
                              programSettings: {
                                maxPrograms: parseInt(e.target.value) || 8,
                                selectedPrograms: editingStep.programSettings?.selectedPrograms || []
                              }
                            })}
                          />
                        </div>
                      </div>
                    )}

                    {/* External Account Settings */}
                    {editingStep.type === 'verification' && (
                      <div className="space-y-4 border-t pt-4">
                        <Label>External Portal Settings</Label>
                        <div className="space-y-2">
                          <Label>Portal URL</Label>
                          <Input
                            value={editingStep.externalAccount?.portalUrl || ''}
                            onChange={(e) => setEditingStep({
                              ...editingStep,
                              externalAccount: {
                                ...editingStep.externalAccount,
                                portalUrl: e.target.value,
                                username: editingStep.externalAccount?.username || '',
                                password: editingStep.externalAccount?.password || ''
                              }
                            })}
                            placeholder="https://portal.example.com"
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Video Tab */}
                  <TabsContent value="video" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <Input
                        value={editingStep.videoUrl || ''}
                        onChange={(e) => setEditingStep({
                          ...editingStep,
                          videoUrl: e.target.value
                        })}
                        placeholder="Enter YouTube video URL"
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter a YouTube URL (e.g., https://www.youtube.com/watch?v=...)
                      </p>
                    </div>
                    
                    {editingStep.videoUrl && (
                      <div className="mt-4">
                        <Label>Video Preview</Label>
                        <div className="mt-2 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Video will display here</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Instructions Tab */}
                  <TabsContent value="instructions" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Header</Label>
                      <Input
                        value={editingStep.instructions.header || ''}
                        onChange={(e) => setEditingStep({
                          ...editingStep,
                          instructions: {
                            ...editingStep.instructions,
                            header: e.target.value
                          }
                        })}
                        placeholder="Enter instruction header"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Paragraphs</Label>
                      {editingStep.instructions.paragraphs?.map((paragraph, index) => (
                        <div key={index} className="flex gap-2">
                          <Textarea
                            value={paragraph}
                            onChange={(e) => {
                              const newParagraphs = [...(editingStep.instructions.paragraphs || [])];
                              newParagraphs[index] = e.target.value;
                              setEditingStep({
                                ...editingStep,
                                instructions: {
                                  ...editingStep.instructions,
                                  paragraphs: newParagraphs
                                }
                              });
                            }}
                            placeholder="Enter paragraph content"
                            rows={2}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newParagraphs = editingStep.instructions.paragraphs?.filter((_, i) => i !== index);
                              setEditingStep({
                                ...editingStep,
                                instructions: {
                                  ...editingStep.instructions,
                                  paragraphs: newParagraphs
                                }
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingStep({
                            ...editingStep,
                            instructions: {
                              ...editingStep.instructions,
                              paragraphs: [...(editingStep.instructions.paragraphs || []), '']
                            }
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Paragraph
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Bullet Points</Label>
                      {editingStep.instructions.bulletPoints?.map((point, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={point}
                            onChange={(e) => {
                              const newPoints = [...(editingStep.instructions.bulletPoints || [])];
                              newPoints[index] = e.target.value;
                              setEditingStep({
                                ...editingStep,
                                instructions: {
                                  ...editingStep.instructions,
                                  bulletPoints: newPoints
                                }
                              });
                            }}
                            placeholder="Enter bullet point"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPoints = editingStep.instructions.bulletPoints?.filter((_, i) => i !== index);
                              setEditingStep({
                                ...editingStep,
                                instructions: {
                                  ...editingStep.instructions,
                                  bulletPoints: newPoints
                                }
                              });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingStep({
                            ...editingStep,
                            instructions: {
                              ...editingStep.instructions,
                              bulletPoints: [...(editingStep.instructions.bulletPoints || []), '']
                            }
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bullet Point
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Footer</Label>
                      <Textarea
                        value={editingStep.instructions.footer || ''}
                        onChange={(e) => setEditingStep({
                          ...editingStep,
                          instructions: {
                            ...editingStep.instructions,
                            footer: e.target.value
                          }
                        })}
                        placeholder="Enter instruction footer"
                        rows={2}
                      />
                    </div>
                  </TabsContent>

                  {/* Buttons Tab */}
                  <TabsContent value="buttons" className="space-y-4">
                    {editingStep.buttons.map((button, index) => (
                      <Card key={button.id} className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Button Label</Label>
                            <Input
                              value={button.label}
                              onChange={(e) => {
                                const newButtons = [...editingStep.buttons];
                                newButtons[index] = { ...button, label: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  buttons: newButtons
                                });
                              }}
                              placeholder="Enter button text"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Button Icon</Label>
                            <Select
                              value={button.icon || 'Play'}
                              onValueChange={(value: string) => {
                                const newButtons = [...editingStep.buttons];
                                newButtons[index] = { ...button, icon: value };
                                setEditingStep({
                                  ...editingStep,
                                  buttons: newButtons
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    {React.createElement(getIconComponent(button.icon || 'Play'), { className: "h-4 w-4" })}
                                    {button.icon || 'Play'}
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {availableIcons.map((iconName) => {
                                  const IconComponent = getIconComponent(iconName);
                                  return (
                                    <SelectItem key={iconName} value={iconName}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="h-4 w-4" />
                                        {iconName}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Button Variant</Label>
                            <Select
                              value={button.variant}
                              onValueChange={(value: any) => {
                                const newButtons = [...editingStep.buttons];
                                newButtons[index] = { ...button, variant: value };
                                setEditingStep({
                                  ...editingStep,
                                  buttons: newButtons
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                <SelectItem value="outline">Outline</SelectItem>
                                <SelectItem value="secondary">Secondary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                              value={button.url || ''}
                              onChange={(e) => {
                                const newButtons = [...editingStep.buttons];
                                newButtons[index] = { ...button, url: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  buttons: newButtons
                                });
                              }}
                              placeholder="Enter button URL"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>JS ID</Label>
                            <Input
                              value={button.jsId || ''}
                              onChange={(e) => {
                                const newButtons = [...editingStep.buttons];
                                newButtons[index] = { ...button, jsId: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  buttons: newButtons
                                });
                              }}
                              placeholder="Enter JS ID (e.g., myButton)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Livewire Click</Label>
                            <Input
                              value={button.wireClick || ''}
                              onChange={(e) => {
                                const newButtons = [...editingStep.buttons];
                                newButtons[index] = { ...button, wireClick: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  buttons: newButtons
                                });
                              }}
                              placeholder="Enter wire:click method (e.g., submitForm)"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button
                              variant="outline"
                              onClick={() => removeButton(button.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    <Button onClick={addButton} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Button
                    </Button>
                  </TabsContent>

                  {/* Forms Tab */}
                  <TabsContent value="forms" className="space-y-4">
                    {editingStep.formFields?.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Field Type</Label>
                            <Select
                              value={field.type}
                              onValueChange={(value: any) => {
                                const newFields = [...(editingStep.formFields || [])];
                                newFields[index] = { ...field, type: value };
                                setEditingStep({
                                  ...editingStep,
                                  formFields: newFields
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="file">File</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Field Label</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => {
                                const newFields = [...(editingStep.formFields || [])];
                                newFields[index] = { ...field, label: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  formFields: newFields
                                });
                              }}
                              placeholder="Enter field label"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Placeholder</Label>
                            <Input
                              value={field.placeholder || ''}
                              onChange={(e) => {
                                const newFields = [...(editingStep.formFields || [])];
                                newFields[index] = { ...field, placeholder: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  formFields: newFields
                                });
                              }}
                              placeholder="Enter placeholder text"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>JS ID</Label>
                            <Input
                              value={field.jsId || ''}
                              onChange={(e) => {
                                const newFields = [...(editingStep.formFields || [])];
                                newFields[index] = { ...field, jsId: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  formFields: newFields
                                });
                              }}
                              placeholder="Enter JS ID (e.g., firstName)"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Wire Model</Label>
                            <Input
                              value={field.wireModel || ''}
                              onChange={(e) => {
                                const newFields = [...(editingStep.formFields || [])];
                                newFields[index] = { ...field, wireModel: e.target.value };
                                setEditingStep({
                                  ...editingStep,
                                  formFields: newFields
                                });
                              }}
                              placeholder="Enter wire:model (e.g., form.firstName)"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => {
                                  const newFields = [...(editingStep.formFields || [])];
                                  newFields[index] = { ...field, required: checked };
                                  setEditingStep({
                                    ...editingStep,
                                    formFields: newFields
                                  });
                                }}
                              />
                              <Label>Required</Label>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => removeFormField(field.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    <Button onClick={addFormField} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Form Field
                    </Button>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Admin Message</Label>
                      <Textarea
                        value={editingStep.adminMessage || ''}
                        onChange={(e) => setEditingStep({
                          ...editingStep,
                          adminMessage: e.target.value
                        })}
                        placeholder="Enter admin message for this step"
                        rows={3}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Alerts</Label>
                      {editingStep.alerts?.map((alert, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Alert Type</Label>
                              <Select
                                value={alert.type}
                                onValueChange={(value: any) => {
                                  const newAlerts = [...(editingStep.alerts || [])];
                                  newAlerts[index] = { ...alert, type: value };
                                  setEditingStep({
                                    ...editingStep,
                                    alerts: newAlerts
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="info">Info</SelectItem>
                                  <SelectItem value="warning">Warning</SelectItem>
                                  <SelectItem value="error">Error</SelectItem>
                                  <SelectItem value="success">Success</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-end">
                              <Button
                                variant="outline"
                                onClick={() => removeAlert(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="col-span-2 space-y-2">
                              <Label>Alert Message</Label>
                              <Textarea
                                value={alert.message}
                                onChange={(e) => {
                                  const newAlerts = [...(editingStep.alerts || [])];
                                  newAlerts[index] = { ...alert, message: e.target.value };
                                  setEditingStep({
                                    ...editingStep,
                                    alerts: newAlerts
                                  });
                                }}
                                placeholder="Enter alert message"
                                rows={2}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                      
                      <Button onClick={addAlert} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Alert
                      </Button>
                    </div>

                    <Separator />

                    {editingStep.type === 'document' && (
                      <div className="space-y-4">
                        <Label>Required Documents</Label>
                        {editingStep.documents?.required.map((doc, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={doc}
                              onChange={(e) => {
                                const newDocs = [...(editingStep.documents?.required || [])];
                                newDocs[index] = e.target.value;
                                setEditingStep({
                                  ...editingStep,
                                  documents: {
                                    ...editingStep.documents,
                                    required: newDocs,
                                    uploaded: editingStep.documents?.uploaded || []
                                  }
                                });
                              }}
                              placeholder="Enter document name"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newDocs = editingStep.documents?.required.filter((_, i) => i !== index);
                                setEditingStep({
                                  ...editingStep,
                                  documents: {
                                    ...editingStep.documents,
                                    required: newDocs || [],
                                    uploaded: editingStep.documents?.uploaded || []
                                  }
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingStep({
                              ...editingStep,
                              documents: {
                                required: [...(editingStep.documents?.required || []), ''],
                                uploaded: editingStep.documents?.uploaded || []
                              }
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Required Document
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Select a step to edit</p>
                <p className="text-sm">Choose a step from the list or create a new one</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSteps;
