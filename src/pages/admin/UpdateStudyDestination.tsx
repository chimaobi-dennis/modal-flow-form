import React, { useState, useMemo } from "react";
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
    Check,
    Loader2,
    ListOrdered,
    Image as ImageIcon,
    PlusCircle,
    GraduationCap,
    VenetianMaskIcon,
    Paperclip,
    TicketCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStepsData, ApplicationStep, StepField, StepButton, Intake } from "@/hooks/useStepsData";
import { useVisaSteps, VisaStep } from "@/hooks/useVisaSteps";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Simple debounce implementation
const debounce = <F extends (...args: any[]) => any>(
    func: F,
    wait: number
) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const userId = document.getElementById('root')?.getAttribute('data-user-id');

const UpdateStudyDestination = () => {
    const [searchParams] = useSearchParams();
    const destinationId = searchParams.get('id');

    const {
        steps,
        destination,
        setDestination,
        isLoading,
        error,
        isUpdating,
        updateDestinationSteps,
        updateDestinationDetails,
        updateStep,
        addStep,
        deleteStep: removeStep,
        moveStep,
        refetch,
        whyStudyHere,
        intakes: intakesProp,
        setIntake,
        setWhyStudyHere
    } = useStepsData(destinationId || '');

    // Visa steps hook
    const {
        steps: visaSteps = [],
        loading: visaLoading,
        error: visaError,
        updateSteps: updateVisaSteps,
        updateStep: updateVisaStep,
        addStep: addVisaStep,
        deleteStep: deleteVisaStep
    } = useVisaSteps(destinationId || '');

    // Ensure visaSteps is always an array
    const safeVisaSteps = Array.isArray(visaSteps) ? visaSteps : [];

    // Ensure intakes is always an array
    const intakes = intakesProp || [];

    const [editingStep, setEditingStep] = useState<ApplicationStep | null>(null);
    const [editingVisaStep, setEditingVisaStep] = useState<VisaStep | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingVisa, setIsCreatingVisa] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // New visa step state
    const [newVisaStep, setNewVisaStep] = useState<VisaStep>({
        id: '',
        stepNumber: 1,
        title: '',
        type: 'information',
        status: 'pending',
        deadline: '',
        instructions: {
            header: '',
            paragraphs: [],
            bulletPoints: [],
            footer: ''
        },
        buttons: []
    });

    // Debounced update function to prevent too many API calls
    const debouncedUpdate = useMemo(
        () => debounce((field: string, value: any) => {
            if (field === "intakes") {
                updateDestinationDetails({ intakes: value });
            } else if (field === "why_study_here") {
                updateDestinationDetails({ why_study_here: value });
            } else {
                updateDestinationDetails({ [field]: value });
            }
        }, 1000),
        [destinationId]
    );


    const handleInputChange = (field: string, value: any) => {
        // Update local state immediately for instant UI feedback
        if (field === "intakes") {
            setIntake(value); // value is the new intakes array
        } else if (field === "why_study_here") {
            setWhyStudyHere(value); // value is the new why_study_here array
        } else if (destination) {
            setDestination({ ...destination, [field]: value });
        }
        // Debounce the API call
        debouncedUpdate(field, value);
    };

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
                paragraphs: [],
                bulletPoints: [],
                footer: ""
            },
            buttons: [],
            formFields: [],
            alerts: []
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
            const updatedSteps = steps.map(step =>
                step.id === editingStep.id ? editingStep : step
            );
            updateDestinationSteps(updatedSteps);
        }
        setEditingStep(null);
    };

    const deleteStepHandler = (stepId: string) => {
        removeStep(stepId);
        if (editingStep?.id === stepId) {
            setEditingStep(null);
        }
    };

    const moveStepHandler = (stepId: string, direction: 'up' | 'down') => {
        moveStep(stepId, direction);
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

    // Visa step handlers
    const handleCreateVisaStep = async () => {
        try {
            const stepWithId = {
                ...newVisaStep,
                id: Date.now().toString(),
                stepNumber: visaSteps.length + 1
            };
            await addVisaStep(stepWithId);
            setNewVisaStep({
                id: '',
                stepNumber: 1,
                title: '',
                type: 'information',
                status: 'pending',
                deadline: '',
                instructions: {
                    header: '',
                    paragraphs: [],
                    bulletPoints: [],
                    footer: ''
                },
                buttons: []
            });
            setIsCreatingVisa(false);
        } catch (error) {
            console.error('Failed to create visa step:', error);
        }
    };

    const handleSaveVisaStep = async () => {
        if (!editingVisaStep) return;
        try {
            await updateVisaStep(editingVisaStep.id, editingVisaStep);
            setEditingVisaStep(null);
        } catch (error) {
            console.error('Failed to save visa step:', error);
        }
    };

    const handleDeleteVisaStep = async (stepId: string) => {
        try {
            await deleteVisaStep(stepId);
            if (editingVisaStep?.id === stepId) {
                setEditingVisaStep(null);
            }
        } catch (error) {
            console.error('Failed to delete visa step:', error);
        }
    };
    const getTimeAgo = (dateString?: string) => {
        if (!dateString) return '';
        const updated = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - updated.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffMonths / 12);
        const secs = diffSecs % 60;
        const mins = diffMins % 60;
        const hours = diffHours % 24;
        const days = diffDays % 30;
        const months = diffMonths % 12;
        const years = diffYears;
        if (years > 0) {
            return `${years} year${years === 1 ? '' : 's'} ${months} month${months === 1 ? '' : 's'} ${days} day${days === 1 ? '' : 's'} ago`;
        }
        if (months > 0) {
            return `${months} month${months === 1 ? '' : 's'} ${days} day${days === 1 ? '' : 's'} ago`;
        }
        if (days > 0) {
            return `${days} day${days === 1 ? '' : 's'} ${hours} hour${hours === 1 ? '' : 's'} ago`;
        }
        if (hours > 0) {
            return `${hours} hour${hours === 1 ? '' : 's'} ${mins} minute${mins === 1 ? '' : 's'} ago`;
        }
        if (mins > 0) {
            return `${mins} minute${mins === 1 ? '' : 's'} ${secs} second${secs === 1 ? '' : 's'} ago`;
        }
        return `${secs} second${secs === 1 ? '' : 's'} ago`;
    };
    return (

        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Study in {destination?.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage everything about University Application to {destination?.name}
                    </p>
                </div>
                <div>
                    <Badge
                        variant={destination?.status == '1' ? 'secondary' : 'destructive'}
                        className="flex items-left"
                    >
                        {destination?.status == '1' ? 'Active' : 'Deactivated'} {destination?.status == '1' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Badge>
                </div>
            </div>
            {/* Header */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full space-y-4"
            >
                <div className="border-b border-gray-200 overflow-x-auto">
                    <TabsList className="h-auto p-0 bg-transparent w-full min-w-max">
                        <TabsTrigger value="details" className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                            <FileText className="h-4 w-4" />
                            <span> &nbsp;Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="intakes" className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                            <Calendar className="h-4 w-4" />
                            <span> &nbsp;Intakes</span>
                        </TabsTrigger>
                        <TabsTrigger value="why-study" className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                            <Star className="h-4 w-4" />
                            <span> &nbsp;Why Study Here</span>
                        </TabsTrigger>
                        <TabsTrigger value="application-steps" className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                            <ListOrdered className="h-4 w-4" />
                            <span> &nbsp;Application Steps</span>
                        </TabsTrigger>
                        <TabsTrigger value="visa" className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                            <TicketCheck className="h-4 w-4" />
                            <span> &nbsp;Visa Steps</span>
                        </TabsTrigger>
                        <TabsTrigger value="images" className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm">
                            <ImageIcon className="h-4 w-4" />
                            <span> &nbsp;Images</span>
                        </TabsTrigger>
                    </TabsList>
                </div>
                {isUpdating ? (
                    <Badge variant="outline">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                    </Badge>
                ) : (
                    <Badge variant="outline">
                        <Check className="h-4 w-4 mr-2" />
                        Updated {getTimeAgo(destination?.updated_at || '')}
                    </Badge>
                )}
                <TabsContent value="details">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Details */}
                        <div className="xl:col-span-3 ">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-semibold">Destination Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid xl:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                value={destination?.name || ''}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                disabled={isUpdating}
                                                className={isUpdating ? 'opacity-75' : ''}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Study Period</Label>
                                            <Input
                                                value={destination?.study_period || ''}
                                                onChange={(e) => handleInputChange('study_period', e.target.value)}
                                                disabled={isUpdating}
                                                className={isUpdating ? 'opacity-75' : ''}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Application Portal</Label>
                                            <Input
                                                value={destination?.application_portal || ''}
                                                onChange={(e) => handleInputChange('application_portal', e.target.value)}
                                                disabled={isUpdating}
                                                className={isUpdating ? 'opacity-75' : ''}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid xl:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Application Type</Label>
                                            <Select
                                                value={destination?.application_type ?? ''}
                                                onValueChange={(value: string) => {
                                                    if (destination) {
                                                        handleInputChange('application_type', value);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm">
                                                    <SelectValue placeholder="Select a step type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                                                    <SelectItem value="single_portal" className="cursor-pointer hover:bg-gray-100 p-2">Single Portal</SelectItem>
                                                    <SelectItem value="multiple_portal" className="cursor-pointer hover:bg-gray-100 p-2">Multiple Portals</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Application Period From</Label>
                                            <Input type="datetime-local" value={destination?.application_period_from ?? ''} onChange={(e) => handleInputChange('application_period_from', e.target.value)} disabled={isUpdating} className={isUpdating ? 'opacity-75' : 'date-picker'} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Application Period To</Label>
                                            <Input type="datetime-local" value={destination?.application_period_to ?? ''} onChange={(e) => handleInputChange('application_period_to', e.target.value)} disabled={isUpdating} className={isUpdating ? 'opacity-75' : 'date-picker'} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Timezone</Label>
                                            <Input type="text" value={destination?.timezone ?? ''} onChange={(e) => handleInputChange('timezone', e.target.value)} disabled={isUpdating} className={isUpdating ? 'opacity-75' : ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Programs</Label>
                                            <Input type="number" value={destination?.max_program ?? ''} onChange={(e) => handleInputChange('max_program', e.target.value)} disabled={isUpdating} className={isUpdating ? 'opacity-75' : ''} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Application Cost</Label>
                                            <Input type="number" value={destination?.application_cost ?? ''} onChange={(e) => handleInputChange('application_cost', e.target.value)} disabled={isUpdating} className={isUpdating ? 'opacity-75' : ''} />
                                        </div>
                                    </div>
                                    <div className="grid xl:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Currency</Label>
                                            <Input type="text" value={destination?.currency ?? ''} onChange={(e) => handleInputChange('currency', e.target.value)} disabled={isUpdating} className={isUpdating ? 'opacity-75' : ''} />
                                        </div>

                                    </div>

                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className={isUpdating ? 'opacity-75' : 'flex items-left'}
                                        onClick={() => handleInputChange('status', destination?.status == '1' ? '0' : '1')}
                                        disabled={isUpdating}
                                    >
                                        {destination?.status == '1' ? 'Deactivate Destination' : 'Activate Destination'} {destination?.status == '1' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="intakes">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Intakes List */}
                        <div className="xl:col-span-3">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-row items-center justify-between">
                                        <CardTitle>Intakes</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newIntake = {
                                                        id: Date.now().toString(),
                                                        name: '',
                                                        months: '',
                                                        deadline: ''
                                                    };
                                                    const updatedIntakes = [...intakes, newIntake];
                                                    handleInputChange('intakes', updatedIntakes);
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Intake
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription>
                                        Add all the admission rounds and intakes for this destination
                                    </CardDescription>

                                </CardHeader>
                                <CardContent>
                                    <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
                                        {intakes && intakes.length > 0 ? (
                                            intakes.map((intake, idx) => (
                                                <div key={intake.id} className="border rounded-md p-3 mb-2 bg-gray-50 relative">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-2 right-2 h-6 w-6 p-0"
                                                        onClick={() => {
                                                            const updatedIntakes = intakes.filter(i => i.id !== intake.id);
                                                            handleInputChange('intakes', updatedIntakes);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <div className="space-y-2">
                                                        <Label>Intake Name</Label>
                                                        <Input
                                                            type="text"
                                                            value={intake?.name ?? ""}
                                                            onChange={e => {
                                                                const updated = [...intakes];
                                                                const index = updated.findIndex(i => i.id === intake.id);
                                                                if (index !== -1) {
                                                                    updated[index] = { ...intake, name: e.target.value };
                                                                    handleInputChange('intakes', updated);
                                                                }
                                                            }}
                                                            disabled={isUpdating}
                                                            className={isUpdating ? 'opacity-75' : ''}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Intake Months</Label>
                                                        <Input
                                                            type="text"
                                                            value={intake?.months ?? ""}
                                                            onChange={e => {
                                                                const updated = [...intakes];
                                                                const index = updated.findIndex(i => i.id === intake.id);
                                                                if (index !== -1) {
                                                                    updated[index] = { ...intake, months: e.target.value };
                                                                    handleInputChange('intakes', updated);
                                                                }
                                                            }}
                                                            disabled={isUpdating}
                                                            className={isUpdating ? 'opacity-75' : ''}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Intake Deadline</Label>
                                                        <Input
                                                            type="text"
                                                            value={intake?.deadline ?? ""}
                                                            onChange={e => {
                                                                const updated = [...intakes];
                                                                const index = updated.findIndex(i => i.id === intake.id);
                                                                if (index !== -1) {
                                                                    updated[index] = { ...intake, deadline: e.target.value };
                                                                    handleInputChange('intakes', updated);
                                                                }
                                                            }}
                                                            disabled={isUpdating}
                                                            className={isUpdating ? 'opacity-75' : ''}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-8 text-gray-500">
                                                No intakes found. Click "Add Intake" to create one.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="why-study">
                    <div>
                        <Card>
                            <CardHeader>
                                <div className="flex flex-row justify-between items-center">
                                    <CardTitle className="text-lg font-semibold">Why Study Here</CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const newReason = {
                                                    id: Date.now().toString(),
                                                    header: '',
                                                    body: ''
                                                };
                                                const updatedReasons = [...(whyStudyHere || []), newReason];
                                                handleInputChange('why_study_here', updatedReasons);
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Reason
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription>
                                    Add reasons why students should study in this destination
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {whyStudyHere && whyStudyHere.length > 0 ? (
                                        whyStudyHere.map((reason, idx) => (
                                            <div key={reason.id} className="border rounded-md p-4 mb-2 bg-gray-50 relative">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-2 right-2 h-6 w-6 p-0"
                                                    onClick={() => {
                                                        const updatedReasons = whyStudyHere.filter(r => r.id !== reason.id);
                                                        handleInputChange('why_study_here', updatedReasons);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="space-y-2">
                                                    <Label>Header</Label>
                                                    <Input
                                                        type="text"
                                                        value={reason?.header ?? ""}
                                                        onChange={e => {
                                                            const updated = [...whyStudyHere];
                                                            const index = updated.findIndex(r => r.id === reason.id);
                                                            if (index !== -1) {
                                                                updated[index] = { ...reason, header: e.target.value };
                                                                handleInputChange('why_study_here', updated);
                                                            }
                                                        }}
                                                        disabled={isUpdating}
                                                        className={isUpdating ? 'opacity-75' : ''}
                                                    />
                                                </div>
                                                <div className="space-y-2 mt-2">
                                                    <Label>Body</Label>
                                                    <Textarea
                                                        value={reason?.body ?? ""}
                                                        onChange={e => {
                                                            const updated = [...whyStudyHere];
                                                            const index = updated.findIndex(r => r.id === reason.id);
                                                            if (index !== -1) {
                                                                updated[index] = { ...reason, body: e.target.value };
                                                                handleInputChange('why_study_here', updated);
                                                            }
                                                        }}
                                                        disabled={isUpdating}
                                                        className={isUpdating ? 'opacity-75' : ''}
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No reasons found. Click "Add Reason" to create one.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </TabsContent>
                <TabsContent value="application-steps">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Steps List */}
                        <div className="xl:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        All Steps
                                        <Button onClick={createNewStep} className="ml-auto items-left">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                {isLoading ? (
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
                                                    <div className="h-4 w-1/2 bg-gray-100 rounded-md animate-pulse"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                ) : (
                                    <CardContent className="p-0">
                                        <div className="space-y-1">
                                            {steps.map((step, index) => (
                                                <div
                                                    key={step.id}
                                                    className={`p-4 border-l-4 ${editingStep?.id === step.id
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
                                                                    onClick={() => moveStepHandler(step.id, 'up')}
                                                                    disabled={index === 0}
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <MoveUp className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => moveStepHandler(step.id, 'down')}
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
                                )}
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
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value);
                                                                if (!isNaN(value) && value > 0) {
                                                                    setEditingStep({
                                                                        ...editingStep,
                                                                        stepNumber: value
                                                                    });
                                                                }
                                                            }}
                                                            min="1"
                                                            step="1"
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
                                                            <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md shadow-sm">
                                                                <SelectValue placeholder="Select a step type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                                                                <SelectItem value="registration" className="cursor-pointer hover:bg-gray-100 p-2">Registration</SelectItem>
                                                                <SelectItem value="program" className="cursor-pointer hover:bg-gray-100 p-2">Program Selection</SelectItem>
                                                                <SelectItem value="document" className="cursor-pointer hover:bg-gray-100 p-2">Document</SelectItem>
                                                                <SelectItem value="payment" className="cursor-pointer hover:bg-gray-100 p-2">Application Fee</SelectItem>
                                                                <SelectItem value="admission" className="cursor-pointer hover:bg-gray-100 p-2">Admission</SelectItem>
                                                                <SelectItem value="information" className="cursor-pointer hover:bg-gray-100 p-2">Information</SelectItem>
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
                                                                className="disabled:bg-gray-200"
                                                                type="number"
                                                                min="1"
                                                                max="20"
                                                                value={destination?.max_program ?? 0}
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
                                                {editingStep.type === 'registration' && (
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
                                                                placeholder="Enter paragraph content (press Enter for new line)"
                                                                rows={3}
                                                                className="min-h-[80px]"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && e.shiftKey) {
                                                                        e.preventDefault();
                                                                        const newParagraphs = [...(editingStep.instructions.paragraphs || [])];
                                                                        newParagraphs.splice(index + 1, 0, '');
                                                                        setEditingStep({
                                                                            ...editingStep,
                                                                            instructions: {
                                                                                ...editingStep.instructions,
                                                                                paragraphs: newParagraphs
                                                                            }
                                                                        });
                                                                        // Focus the next input after a short delay
                                                                        setTimeout(() => {
                                                                            const nextInput = document.querySelector(`textarea[value=""]`) as HTMLTextAreaElement;
                                                                            if (nextInput) nextInput.focus();
                                                                        }, 0);
                                                                    }
                                                                }}
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
                                                            <Textarea
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
                                                                placeholder="Enter bullet point (press Enter for new line)"
                                                                rows={2}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        const newPoints = [...(editingStep.instructions.bulletPoints || [])];
                                                                        newPoints.splice(index + 1, 0, '');
                                                                        setEditingStep({
                                                                            ...editingStep,
                                                                            instructions: {
                                                                                ...editingStep.instructions,
                                                                                bulletPoints: newPoints
                                                                            }
                                                                        });
                                                                        // Focus the next input after a short delay
                                                                        setTimeout(() => {
                                                                            const nextInput = document.querySelector(`textarea[value=""]`) as HTMLTextAreaElement;
                                                                            if (nextInput) nextInput.focus();
                                                                        }, 0);
                                                                    }
                                                                }}
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
                </TabsContent>

                <TabsContent value="visa">
                    <div className="min-h-screen bg-background">
                        <div className="container mx-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-3xl font-bold">Visa Steps Admin</h1>
                                <Dialog open={isCreatingVisa} onOpenChange={setIsCreatingVisa}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Step
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg h-[calc(120vh-10rem)] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Create New Visa Step</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={newVisaStep.title}
                                                    onChange={(e) => setNewVisaStep({ ...newVisaStep, title: e.target.value })}
                                                    placeholder="Step title"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="type">Type</Label>
                                                <Select value={newVisaStep.type} onValueChange={(value) => setNewVisaStep({ ...newVisaStep, type: value as any })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        <SelectItem value="application">Application</SelectItem>
                                                        <SelectItem value="document">Document</SelectItem>
                                                        <SelectItem value="information">Information</SelectItem>
                                                        <SelectItem value="interview">Interview</SelectItem>
                                                        <SelectItem value="appointment">Appointment</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select value={newVisaStep.status} onValueChange={(value) => setNewVisaStep({ ...newVisaStep, status: value as any })}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white">
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="current">Current</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="overdue">Overdue</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="header">Header</Label>
                                                <Input
                                                    id="header"
                                                    value={newVisaStep.instructions?.header || ""}
                                                    onChange={(e) => setNewVisaStep({
                                                        ...newVisaStep,
                                                        instructions: { ...newVisaStep.instructions, header: e.target.value }
                                                    })}
                                                    placeholder="Step header"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="paragraphs">Instructions Paragraphs (one per line)</Label>
                                                <Textarea
                                                    id="paragraphs"
                                                    value={newVisaStep.instructions?.paragraphs?.join('\n') || ""}
                                                    onChange={(e) => setNewVisaStep({
                                                        ...newVisaStep,
                                                        instructions: {
                                                            ...newVisaStep.instructions,
                                                            paragraphs: e.target.value.split('\n').filter(p => p.trim())
                                                        }
                                                    })}
                                                    placeholder="Enter paragraphs, one per line"
                                                    rows={3}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="bulletPoints">Instructions Bullet Points (one per line)</Label>
                                                <Textarea
                                                    id="bulletPoints"
                                                    value={newVisaStep.instructions?.bulletPoints?.join('\n') || ""}
                                                    onChange={(e) => setNewVisaStep({
                                                        ...newVisaStep,
                                                        instructions: {
                                                            ...newVisaStep.instructions,
                                                            bulletPoints: e.target.value.split('\n').filter(p => p.trim())
                                                        }
                                                    })}
                                                    placeholder="Enter bullet points, one per line"
                                                    rows={3}
                                                />
                                            </div>
                                            {/* Document-specific fields */}
                                            {newVisaStep.type === 'document' && (
                                                <div className="space-y-4">
                                                    <Label>Required Documents</Label>
                                                    {newVisaStep.documents?.required.map((doc, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <Input
                                                                value={doc}
                                                                onChange={(e) => {
                                                                    const newDocs = [...(newVisaStep.documents?.required || [])];
                                                                    newDocs[index] = e.target.value;
                                                                    setNewVisaStep({
                                                                        ...newVisaStep,
                                                                        documents: {
                                                                            ...newVisaStep.documents,
                                                                            required: newDocs,
                                                                            uploaded: newVisaStep.documents?.uploaded || []
                                                                        }
                                                                    });
                                                                }}
                                                                placeholder="Enter document name"
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newDocs = newVisaStep.documents?.required.filter((_, i) => i !== index);
                                                                    setNewVisaStep({
                                                                        ...newVisaStep,
                                                                        documents: {
                                                                            ...newVisaStep.documents,
                                                                            required: newDocs || [],
                                                                            uploaded: newVisaStep.documents?.uploaded || []
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
                                                            setNewVisaStep({
                                                                ...newVisaStep,
                                                                documents: {
                                                                    required: [...(newVisaStep.documents?.required || []), ''],
                                                                    uploaded: newVisaStep.documents?.uploaded || []
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Required Document
                                                    </Button>
                                                </div>
                                            )}
                                            {/* Application-specific fields */}
                                            {newVisaStep.type === 'application' && (
                                                <div className="space-y-2">
                                                    <Label>Application URL</Label>
                                                    <Input
                                                        value={newVisaStep.application?.applicationUrl || ""}
                                                        onChange={(e) => {
                                                            setNewVisaStep({
                                                                ...newVisaStep,
                                                                application: {
                                                                    ...newVisaStep.application,
                                                                    applicationUrl: e.target.value
                                                                }
                                                            });
                                                        }}
                                                        placeholder="Enter application URL"
                                                    />
                                                </div>
                                            )}
                                            
                                            <div>
                                                <label htmlFor="alert">Optional Information Alert</label>
                                                {newVisaStep.alerts?.map((alert, index) => (
                                                    <div key={index} className="space-y-1">
                                                        <Input
                                                            value={alert.header || ""}
                                                            onChange={(e) => {
                                                                const newAlerts = [...(newVisaStep.alerts || [])];
                                                                newAlerts[index] = {
                                                                    ...newAlerts[index],
                                                                    header: e.target.value
                                                                };
                                                                setNewVisaStep({
                                                                    ...newVisaStep,
                                                                    alerts: newAlerts
                                                                });
                                                            }}
                                                            placeholder="Alert header"
                                                        />
                                                        <Input
                                                            value={alert.message || ""}
                                                            onChange={(e) => {
                                                                const newAlerts = [...(newVisaStep.alerts || [])];
                                                                newAlerts[index] = {
                                                                    ...newAlerts[index],
                                                                    message: e.target.value
                                                                };
                                                                setNewVisaStep({
                                                                    ...newVisaStep,
                                                                    alerts: newAlerts
                                                                });
                                                            }}
                                                            placeholder="Alert message"
                                                        />
                                                        <Input
                                                            value={alert.button?.label || ""}
                                                            onChange={(e) => {
                                                                const newAlerts = [...(newVisaStep.alerts || [])];
                                                                newAlerts[index] = {
                                                                    ...newAlerts[index],
                                                                    button: {
                                                                        ...newAlerts[index].button,
                                                                        label: e.target.value
                                                                    }
                                                                };
                                                                setNewVisaStep({
                                                                    ...newVisaStep,
                                                                    alerts: newAlerts
                                                                });
                                                            }}
                                                            placeholder="Alert button label"
                                                        />
                                                        <Input
                                                            value={alert.buttonLink || ""}
                                                            onChange={(e) => {
                                                                const newAlerts = [...(newVisaStep.alerts || [])];
                                                                newAlerts[index] = {
                                                                    ...newAlerts[index],
                                                                    buttonLink: e.target.value
                                                                };
                                                                setNewVisaStep({
                                                                    ...newVisaStep,
                                                                    alerts: newAlerts
                                                                });
                                                            }}
                                                            placeholder="Alert button URL"
                                                        />
                                                        <Input
                                                            value={alert.footer || ""}
                                                            onChange={(e) => {
                                                                const newAlerts = [...(newVisaStep.alerts || [])];
                                                                newAlerts[index] = {
                                                                    ...newAlerts[index],
                                                                    footer: e.target.value
                                                                };
                                                                setNewVisaStep({
                                                                    ...newVisaStep,
                                                                    alerts: newAlerts
                                                                });
                                                            }}
                                                            placeholder="Alert footer"
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setNewVisaStep({
                                                            ...newVisaStep,
                                                            alerts: [...(newVisaStep.alerts || []), {
                                                                header: '',
                                                                message: '',
                                                                button: {
                                                                    label: '',
                                                                    link: ''
                                                                },
                                                                footer: ''
                                                            }]
                                                        });
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Alert
                                                </Button>
                                            </div>
                                            <div>
                                                <Label htmlFor="footer">Footer</Label>
                                                <Input
                                                    id="footer"
                                                    value={newVisaStep.instructions?.footer || ""}
                                                    onChange={(e) => setNewVisaStep({
                                                        ...newVisaStep,
                                                        instructions: { ...newVisaStep.instructions, footer: e.target.value }
                                                    })}
                                                    placeholder="Step footer"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => setIsCreatingVisa(false)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleCreateVisaStep}>
                                                    Create Step
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-6">
                                {safeVisaSteps.map((step) => (
                                    <Card key={step.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        Step {step.stepNumber}: {step.title}
                                                        <Badge variant={
                                                            step.status === 'completed' ? 'default' :
                                                                step.status === 'current' ? 'secondary' :
                                                                    step.status === 'overdue' ? 'destructive' : 'outline'
                                                        }>
                                                            {step.status}
                                                        </Badge>
                                                        <Badge variant="outline">{step.type}</Badge>
                                                    </CardTitle>
                                                </div>
                                                <div className="flex gap-2">
                                                    {editingVisaStep?.id === step.id ? (
                                                        <>
                                                            <Button size="sm" onClick={handleSaveVisaStep}>
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={() => setEditingVisaStep(null)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button size="sm" variant="outline" onClick={() => setEditingVisaStep({ ...step })}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleDeleteVisaStep(step.id)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {editingVisaStep?.id === step.id ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label>Title</Label>
                                                        <Input
                                                            value={editingVisaStep.title}
                                                            onChange={(e) => setEditingVisaStep({ ...editingVisaStep, title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Type</Label>
                                                        <Select value={editingVisaStep.type} onValueChange={(value) => setEditingVisaStep({ ...editingVisaStep, type: value as any })}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                <SelectItem value="document">Document</SelectItem>
                                                                <SelectItem value="information">Information</SelectItem>
                                                                <SelectItem value="appointment">Appointment</SelectItem>
                                                                <SelectItem value="application">Application</SelectItem>
                                                                <SelectItem value="interview">Interview</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Status</Label>
                                                        <Select value={editingVisaStep.status} onValueChange={(value) => setEditingVisaStep({ ...editingVisaStep, status: value as any })}>
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white">
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="current">Current</SelectItem>
                                                                <SelectItem value="completed">Completed</SelectItem>
                                                                <SelectItem value="overdue">Overdue</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Step Number</Label>
                                                        <Input
                                                            type="number"
                                                            value={editingVisaStep.stepNumber}
                                                            onChange={(e) => setEditingVisaStep({ ...editingVisaStep, stepNumber: parseInt(e.target.value) || 1 })}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label>Header</Label>
                                                        <Input
                                                            value={editingVisaStep.instructions.header || ""}
                                                            onChange={(e) => setEditingVisaStep({
                                                                ...editingVisaStep,
                                                                instructions: { ...editingVisaStep.instructions, header: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Instructions Paragraphs (one per line)</Label>
                                                        <Textarea
                                                            value={editingVisaStep.instructions.paragraphs?.join('\n') || ""}
                                                            onChange={(e) => setEditingVisaStep({
                                                                ...editingVisaStep,
                                                                instructions: {
                                                                    ...editingVisaStep.instructions,
                                                                    paragraphs: e.target.value.split('\n').filter(p => p.trim())
                                                                }
                                                            })}
                                                            placeholder="Enter paragraphs, one per line"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Instructions Bullet Points (one per line)</Label>
                                                        <Textarea
                                                            value={editingVisaStep.instructions.bulletPoints?.join('\n') || ""}
                                                            onChange={(e) => setEditingVisaStep({
                                                                ...editingVisaStep,
                                                                instructions: {
                                                                    ...editingVisaStep.instructions,
                                                                    bulletPoints: e.target.value.split('\n').filter(p => p.trim())
                                                                }
                                                            })}
                                                            placeholder="Enter bullet points, one per line"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Footer</Label>
                                                        <Input
                                                            value={editingVisaStep.instructions.footer || ""}
                                                            onChange={(e) => setEditingVisaStep({
                                                                ...editingVisaStep,
                                                                instructions: { ...editingVisaStep.instructions, footer: e.target.value }
                                                            })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Deadline</Label>
                                                        <Input
                                                            type="date"
                                                            value={editingVisaStep.deadline || ""}
                                                            onChange={(e) => setEditingVisaStep({ ...editingVisaStep, deadline: e.target.value })}
                                                        />
                                                    </div>

                                                    {/* Document-specific fields */}
                                                    {editingVisaStep.type === 'document' && (
                                                        <div className="space-y-4">
                                                            <Label>Required Documents</Label>
                                                            {editingVisaStep.documents?.required.map((doc, index) => (
                                                                <div key={index} className="flex gap-2">
                                                                    <Input
                                                                        value={doc}
                                                                        onChange={(e) => {
                                                                            const newDocs = [...(editingVisaStep.documents?.required || [])];
                                                                            newDocs[index] = e.target.value;
                                                                            setEditingVisaStep({
                                                                                ...editingVisaStep,
                                                                                documents: {
                                                                                    ...editingVisaStep.documents,
                                                                                    required: newDocs,
                                                                                    uploaded: editingVisaStep.documents?.uploaded || []
                                                                                }
                                                                            });
                                                                        }}
                                                                        placeholder="Enter document name"
                                                                    />
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const newDocs = editingVisaStep.documents?.required.filter((_, i) => i !== index);
                                                                            setEditingVisaStep({
                                                                                ...editingVisaStep,
                                                                                documents: {
                                                                                    ...editingVisaStep.documents,
                                                                                    required: newDocs || [],
                                                                                    uploaded: editingVisaStep.documents?.uploaded || []
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
                                                                    setEditingVisaStep({
                                                                        ...editingVisaStep,
                                                                        documents: {
                                                                            required: [...(editingVisaStep.documents?.required || []), ''],
                                                                            uploaded: editingVisaStep.documents?.uploaded || []
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add Required Document
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Application-specific fields */}
                                                    {editingVisaStep.type === 'application' && (
                                                        <div className="space-y-2">
                                                            <Label>Application URL</Label>
                                                            <Input
                                                                value={editingVisaStep.application?.applicationUrl || ""}
                                                                onChange={(e) => {
                                                                    setEditingVisaStep({
                                                                        ...editingVisaStep,
                                                                        application: {
                                                                            ...editingVisaStep.application,
                                                                            applicationUrl: e.target.value
                                                                        }
                                                                    });
                                                                }}
                                                                placeholder="Enter application URL"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Label>Optional Information alert</Label>
                                                        <ul className="list-disc list-inside ml-4 mt-1">
                                                            {editingVisaStep?.alerts?.map((alert, index) => (
                                                                <div key={index} className="space-y-1">
                                                                    <Input
                                                                        value={alert.header || ""}
                                                                        onChange={(e) => {
                                                                            const newAlerts = [...(editingVisaStep.alerts || [])];
                                                                            newAlerts[index] = {
                                                                                ...newAlerts[index],
                                                                                header: e.target.value
                                                                            };
                                                                            setEditingVisaStep({
                                                                                ...editingVisaStep,
                                                                                alerts: newAlerts
                                                                            });
                                                                        }}
                                                                        placeholder="Alert header"
                                                                    />
                                                                    <Input
                                                                        value={alert.message || ""}
                                                                        onChange={(e) => {
                                                                            const newAlerts = [...(editingVisaStep.alerts || [])];
                                                                            newAlerts[index] = {
                                                                                ...newAlerts[index],
                                                                                message: e.target.value
                                                                            };
                                                                            setEditingVisaStep({
                                                                                ...editingVisaStep,
                                                                                alerts: newAlerts
                                                                            });
                                                                        }}
                                                                        placeholder="Alert message"
                                                                    />
                                                                    <Input
                                                                        value={alert.button?.label || ""}
                                                                        onChange={(e) => {
                                                                            const newAlerts = [...(editingVisaStep.alerts || [])];
                                                                            newAlerts[index] = {
                                                                                ...newAlerts[index],
                                                                                button: {
                                                                                    ...newAlerts[index].button,
                                                                                    label: e.target.value
                                                                                }
                                                                            };
                                                                            setEditingVisaStep({
                                                                                ...editingVisaStep,
                                                                                alerts: newAlerts
                                                                            });
                                                                        }}
                                                                        placeholder="Alert button label"
                                                                    />
                                                                    <Input
                                                                        value={alert.buttonLink || ""}
                                                                        onChange={(e) => {
                                                                            const newAlerts = [...(editingVisaStep.alerts || [])];
                                                                            newAlerts[index] = {
                                                                                ...newAlerts[index],
                                                                                buttonLink: e.target.value
                                                                            };
                                                                            setEditingVisaStep({
                                                                                ...editingVisaStep,
                                                                                alerts: newAlerts
                                                                            });
                                                                        }}
                                                                        placeholder="Alert button URL"
                                                                    />
                                                                    <Input
                                                                        value={alert.footer || ""}
                                                                        onChange={(e) => {
                                                                            const newAlerts = [...(editingVisaStep.alerts || [])];
                                                                            newAlerts[index] = {
                                                                                ...newAlerts[index],
                                                                                footer: e.target.value
                                                                            };
                                                                            setEditingVisaStep({
                                                                                ...editingVisaStep,
                                                                                alerts: newAlerts
                                                                            });
                                                                        }}
                                                                        placeholder="Alert footer"
                                                                    />
                                                                </div>
                                                            ))}
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setEditingVisaStep({
                                                                        ...editingVisaStep,
                                                                        alerts: [...(editingVisaStep.alerts || []), {
                                                                            header: '',
                                                                            message: '',
                                                                            button: {
                                                                                label: '',
                                                                                link: ''
                                                                            },
                                                                            footer: ''
                                                                        }]
                                                                    });
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add Alert
                                                            </Button>
                                                        </ul>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p><strong>Header:</strong> {step.instructions.header}</p>
                                                    {step.deadline && <p><strong>Deadline:</strong> {step.deadline}</p>}
                                                    {step.instructions.bulletPoints && step.instructions.bulletPoints.length > 0 && (
                                                        <div>
                                                            <strong>Instructions:</strong>
                                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                                <Label>{step.instructions.paragraphs}</Label>
                                                                {step.instructions.bulletPoints.map((point, index) => (
                                                                    <li key={index} className="text-sm">{point}</li>
                                                                ))}
                                                                {step.type === 'document' && (
                                                                    <div>
                                                                        <Label>All required Documents</Label>
                                                                        <ul className="list-disc list-inside ml-4 mt-1">
                                                                            {step.documents?.required.map((doc, index) => (
                                                                                <li key={index} className="text-sm">{doc}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {step.appointmentDetails && (
                                                        <div className="mt-2 p-2 bg-muted rounded">
                                                            <strong>Appointment:</strong> {step.appointmentDetails.location} - {step.appointmentDetails.date} at {step.appointmentDetails.time}
                                                        </div>
                                                    )}
                                                    {step.alerts && step.alerts.length > 0 && (
                                                        <div className="mt-2 p-2">
                                                            <strong>Alerts:</strong>
                                                            <ul className="list-disc list-inside ml-4 mt-1">
                                                                {step.alerts.map((alert, index) => (
                                                                    <li key={index} className="text-sm">
                                                                        <div className={`bg-${alert.type === 'info' ? 'orange' : alert.type === 'warning' ? 'yellow' : 'red'}-100 p-2 rounded mb-2`}>
                                                                            <strong className="text-black">{alert.header}</strong>
                                                                            <p className="text-black">{alert.message}</p>
                                                                            {alert.button && (
                                                                                <div className="mt-2">
                                                                                    <Button onClick={() => window.open(alert.buttonLink, '_blank')} className="text-white">{alert.button.label}</Button>
                                                                                </div>
                                                                            )}
                                                                            <p className="text-black">{alert.footer}</p>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="images">

                </TabsContent>
                <Separator />
                {saveError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                )}
            </Tabs>

        </div>

    );
};

export default UpdateStudyDestination;