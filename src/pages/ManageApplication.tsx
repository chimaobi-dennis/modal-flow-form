import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    Check, Loader2,
    CheckCircle, Clock, AlertCircle, Upload, Eye, EyeOff,
    Edit,
    User,
    ChevronRight, ChevronUp, ChevronDown,
    Calendar,
    FileText,
    MessageSquare,
    Plus,
    Download,
    Play,
    X,
    HelpCircle,
    Menu,
    Bell,
    BellOff,
    Settings,
    Activity,
    MapPin,
    Wallet,
    GraduationCap,
    FileCheck,
    UserCheck,
    BarChart3,
    Youtube,
    Sparkles,
    CheckCircle2,
    School,
    Info,
    CreditCard,
    Globe,
    Award,
    RefreshCw,
    LogIn,
    AlertTriangle,
    Mail,
    BadgeAlert,
    InfoIcon,
    XCircle,
    BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ChatbotModal from "@/components/ChatbotModal";
import VideoModal from "@/components/VideoModal";
import FileManagerModal from "@/components/FileManagerModal";
import ProgramSelectionModal from "@/components/ProgramSelectionModal";
import { useStepsData, ApplicationStep } from "@/hooks/useStepsData";
import { useScholarshipSteps, ScholarshipStep } from "@/hooks/useScholarshipSteps";
import { useAdmissionSteps } from "@/hooks/useAdmissionSteps";
import { useVisaSteps } from "@/hooks/useVisaSteps";
import VisaInfoModal from "@/components/VisaInfoModal";
import { useActivityLogger, ActivityLog } from "@/components/ActivityLogger";
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { positive } from "zod";

interface UserDocument {
    id: number;
    type: string;
    name: string;
    path: string;
    program_id: number | null;
    status: string | null;
    date: string;
    word_count: string;
}

interface Application {
    id: number;
    isGroup: boolean;
    name: string;
    track: string;
    stage: number;
    admission_result_date: string | null;
    application_login: string;
    application_password: string;
    payment_id: string;
    status: string;
    progress: number;
    selected_programs: string[];
    admitted_programs: string[];
    rejected_programs: string[];
    accepted_admission: string[];
    rejected_admission: string[];
    recommendedPrograms: string[];
    userDocuments: UserDocument[];
    email_notification: boolean;
    officer: number;
    case_officer_name: string;
    case_officer_email: string;
    case_officer_phone: string;
    activityLogs: ActivityLog[];
    study_period: string;
    visa_decision: string;
    visa_appointment_details: string;
    visaSteps: VisaStep[];
    groupData: {
        programs: Program[];
    };
    created_at: string;
    updated_at: string;
}
interface Program {
    id: number;
    name: string;
    university: string;
    city: string;
    level: string;
    duration: string;
    first_tuition: string;
    currency: string;
    program_start_date: string;
    program_end_date: string;
    description: string;
    created_at: string;
    updated_at: string;
    status: string;
    admissionStatus: string;
    admissionAccepted: boolean;
}
interface ApplicationStep {
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
    buttons?: Array<{
        id: string;
        label: string;
        url?: string;
        variant?: string;
        icon?: string;
        jsId?: string;
    }>;
    alerts?: Array<{
        type: string;
        message: string;
    }>;
    programSettings?: {
        maxPrograms: number;
        selectedPrograms: number[];
    };
    documents?: {
        required: string[];
        uploaded: string[];
    };
    formFields?: any[];
    externalAccount?: {
        username: string;
        password: string;
        portalUrl?: string;
    };
    adminMessage?: string;
}
interface VisaStep {
    id: string;
    stepNumber: number;
    title: string;
    type: 'document' | 'application' | 'appointment' | 'interview' | 'decision' | 'information';
    status: 'completed' | 'current' | 'overdue' | 'pending';
    deadline?: string;
    videoUrl?: string;
    instructions: {
        header: string;
        paragraphs: string[];
        bulletPoints: string[];
        footer?: string;
    };
    buttons: Array<{
        id: string;
        label: string;
        url: string;
        variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
    }>;
    documents?: {
        required: string[];
        uploaded: string[];
    };
    alerts?: Array<{
        type: 'info' | 'warning' | 'error' | 'success';
        message: string;
    }>;
    appointmentDetails?: {
        location: string;
        date: string;
        time: string;
    };
}
type ApplicationSteps = ApplicationStep[];
// Helper function to convert 24-hour time format to 12-hour AM/PM format
const formatTimeTo12Hour = (time24: string): string => {
    if (!time24) return '';

    const [hours, minutes] = time24.split(':');
    const hoursNum = parseInt(hours, 10);

    if (isNaN(hoursNum)) return time24;

    const period = hoursNum >= 12 ? 'PM' : 'AM';
    const hours12 = hoursNum % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
};

const ManageApplication = () => {
    const [searchParams] = useSearchParams();
    const userId = document.getElementById('root')?.getAttribute('data-user-id');
    const applicationId = searchParams.get('ID');

    const [activeTab, setActiveTab] = useState("application");
    const [selectedStep, setSelectedStep] = useState<string>("1");
    const [selectedScholarshipStep, setSelectedScholarshipStep] = useState<string>("sch1");
    const [chatbotOpen, setChatbotOpen] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState("");
    const [currentVideoTitle, setCurrentVideoTitle] = useState("");
    const [fileManagerOpen, setFileManagerOpen] = useState(false);
    const [programSelectionOpen, setProgramSelectionOpen] = useState(false);
    const [currentStepId, setCurrentStepId] = useState<string>("");
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);

    const [applicationSteps, setApplicationSteps] = useState<ApplicationStep[]>([]);
    const { steps: scholarshipSteps, updateStep: updateScholarshipStep } = useScholarshipSteps();
    const { applications, acceptAdmission, declineAdmission } = useAdmissionSteps();
    const { steps: defaultVisaSteps, updateStep: updateVisaStep } = useVisaSteps();
    const [visaSteps, setVisaSteps] = useState<VisaStep[]>([]);

    const [showVisaInfoModal, setShowVisaInfoModal] = useState(false);
    // Use activity logger for sending logs to API
    const { logActivity } = useActivityLogger(userId, applicationId);

    const [loadingApplication, setLoadingApplication] = useState(true);
    const [userApplication, setUserApplication] = useState<Application | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updatingDocuments, setUpdatingDocuments] = useState<Record<string, boolean>>({});
    const [errorLoadingApplication, setErrorLoadingApplication] = useState<string | null>(null);
    const [expandedPrograms, setExpandedPrograms] = useState<Record<number, boolean>>({});
    const [activityPage, setActivityPage] = useState(1);
    const [allActivityLogs, setAllActivityLogs] = useState<any[]>([]);
    const [hasMoreActivities, setHasMoreActivities] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [appointmentFormData, setAppointmentFormData] = useState<Record<string, { date: string; time: string; location: string }>>({});
    const navigate = useNavigate();


    // Update allActivityLogs when userApplication changes
    useEffect(() => {
        if (userApplication?.activityLogs) {
            if (activityPage === 1) {
                setAllActivityLogs(userApplication.activityLogs);
            } else {
                setAllActivityLogs(prev => [...prev, ...(userApplication.activityLogs || [])]);
            }
            setHasMoreActivities(userApplication.activityLogs.length >= 10); // Assuming 10 items per page
        }
    }, [userApplication?.activityLogs, activityPage]);

    const loadMoreActivities = async () => {
        if (isLoadingMore || !hasMoreActivities) return;

        setIsLoadingMore(true);
        try {
            setActivityPage(prev => prev + 1);
        } catch (error) {
            console.error('Error loading more activities:', error);
            toast.error('Failed to load more activities');
        } finally {
            setIsLoadingMore(false);
        }
    };

    //update the page very 30 mints - For document and better collaboration ik will use web socket in next version
    useEffect(() => {
        const fetchData = async () => {
            await fetchApplication();
        };

        // Initial fetch
        fetchData();

        // Poll every 30 seconds
        const intervalId = setInterval(fetchData, 15000);
        return () => clearInterval(intervalId);
    }, []);

    // Set initial selected step based on application stage
    // useEffect(() => {
    //     if (userApplication?.stage && applicationSteps.length > 0) {
    //         // Find the first step that matches or exceeds the current stage
    //         const currentStep = applicationSteps.find(step =>
    //             step.stepNumber >= userApplication.stage
    //         );
    //         if (currentStep) {
    //             setSelectedStep(currentStep.id);
    //         } else if (applicationSteps.length > 0) {
    //             // Fallback to last step if stage is beyond our steps
    //             setSelectedStep(applicationSteps[applicationSteps.length - 1].id);
    //         }
    //     }
    // }, [userApplication, applicationSteps]);

    // Function to update a specific step
    const updateStep = (stepId: string, updatedData: Partial<ApplicationStep>) => {
        setApplicationSteps(prevSteps =>
            prevSteps.map(step =>
                step.id === stepId ? { ...step, ...updatedData } : step
            )
        );
    };

    // Mobile UX improvements
    const detailsRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [tempCredentials, setTempCredentials] = useState({ username: '', password: '' });
    const fetchApplication = useCallback(async () => {
        try {
            setLoadingApplication(true);
            const response = await fetch(`/api/v1/user-application/${userId}/${applicationId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch application');
            }

            if (data.status === 'success') {
                const applicationData = data.data[0];
                setApplicationSteps(applicationData.applicationSteps || []);
                // Use visaSteps from API if available, otherwise fall back to defaultVisaSteps
                const visaStepsData = applicationData.visaSteps?.length
                    ? applicationData.visaSteps
                    : defaultVisaSteps;
                console.log('Visa Steps Data:', visaStepsData);
                console.log('Default Visa Steps:', defaultVisaSteps);
                setVisaSteps(visaStepsData);
                setUserApplication(applicationData);
                setErrorLoadingApplication(null);
            } else {
                throw new Error(data.message || 'Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching application:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to load application. Please try again later.';
            setErrorLoadingApplication(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoadingApplication(false);
        }
    }, [userId, applicationId]);

    // Initial fetch
    // useEffect(() => {
    //     fetchApplication();
    // }, [fetchApplication]);

    const updateApplication = async (updatedData: Partial<Application>) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/v1/update-application/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(
                    updatedData
                )
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.message || 'Failed to update application';
                throw new Error(errorMessage);
            }
            if (result.success) {
                if (result.warning) {
                    toast.warning(result.warning);
                }
                await fetchApplication();
            } else {
                throw new Error(result.message || 'Failed to update application');
            }
            toast.success('Application updated');

        } catch (error) {
            console.error('Error updating application:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(`Failed to update application: ${errorMessage}`);
        }
        setIsUpdating(false);
    }
    useEffect(() => {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth < 1280); // xl breakpoint
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // Handle step selection with mobile UX improvements
    const handleStepSelection = (stepId: string) => {
        setSelectedStep(stepId);

        if (isMobile) {
            // Show toast notification for mobile users
            toast.info('Scroll down to view step details ↓', {
                duration: 3000,
            });

            // Auto-scroll to details section after a short delay
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 500);
        }

        const step = applicationSteps.find(s => s.id === stepId);
    };

    // Handle program removal
    const removeProgram = async (stepId: string, programId: number) => {
        const step = applicationSteps.find(s => s.id === stepId);
        if (step?.programSettings) {
            const originalPrograms = [...step.programSettings.selectedPrograms];
            const updatedPrograms = step.programSettings.selectedPrograms.filter((p: number) => p !== programId);

            // Find the program name for the toast message
            const program = userApplication?.recommendedPrograms?.find((p: any) => p.id === programId);
            const programName = program ? program.program_name : `Program ID: ${programId}`;

            // Get current added_documents and filter out any for the removed program
            const currentAddedDocuments = userApplication?.uploaded || [];
            const updatedDocuments = currentAddedDocuments.filter(
                (doc: any) => doc.program_id !== programId
            );

            // Update local state first for immediate UI feedback
            updateStep(stepId, {
                programSettings: {
                    ...step.programSettings,
                    selectedPrograms: updatedPrograms
                }
            });

            // Also update the userApplication state to remove the documents
            if (userApplication) {
                setUserApplication(prev => ({
                    ...prev!,
                    uploaded: updatedDocuments
                }));
            }

            try {
                const response = await fetch(`/api/v1/update-application/${applicationId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        selected_programs: updatedPrograms,
                        added_documents: updatedDocuments,
                        stage: 2
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Failed to update application');
                }

                toast.success(`🗑️ Removed "${programName}" from your application`);
                try {
                    await logActivity({
                        type: 'program',
                        activity: 'Removed Program',
                        details: `${programName} from selected programs`,
                    });
                } catch (error) {
                    console.error('Failed to log activity:', error);
                    // Don't show error to user since this is not critical
                }
            } catch (err) {
                // Revert local state on error
                updateStep(stepId, {
                    programSettings: {
                        ...step.programSettings,
                        selectedPrograms: originalPrograms
                    }
                });

                // Also revert the documents in the userApplication state if it was updated
                if (userApplication) {
                    setUserApplication(prev => ({
                        ...prev!,
                        uploaded: currentAddedDocuments
                    }));
                }

                console.error('Error removing program:', err);
                toast.error(`Failed to remove "${programName}". Please try again.`);
                throw err; // Re-throw to ensure any loading state is cleared
            }
        }
    };

    // Handle program ranking (move up/down)
    const moveProgram = async (stepId: string, programId: number, direction: 'up' | 'down') => {
        const step = applicationSteps.find(s => s.id === stepId);
        if (!step?.programSettings) return;

        const { selectedPrograms } = step.programSettings;
        const index = selectedPrograms.indexOf(programId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= selectedPrograms.length) return; // Cannot move

        const reordered = [...selectedPrograms];
        // Swap positions
        [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

        // Optimistic UI update
        updateStep(stepId, {
            programSettings: {
                ...step.programSettings,
                selectedPrograms: reordered
            }
        });

        try {
            const response = await fetch(`/api/v1/update-application/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ selected_programs: reordered, stage: 2 })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || 'Failed to update application');
            }

            toast.success(`📊 Program order updated`);
            try {
                // Find the program name for the activity log
                const program = userApplication?.recommendedPrograms?.find((p: any) => p.id === programId);
                const programName = program ? program.program_name : `Program ID: ${programId}`;

                await logActivity({
                    activity: 'Ranked Program',
                    details: `${programName} to #${newIndex + 1}`,
                    type: 'program'
                });
            } catch (error) {
                console.error('Failed to log activity:', error);
                // Don't show error to user since this is not critical
            }
        } catch (err) {
            // Revert on error
            updateStep(stepId, {
                programSettings: {
                    ...step.programSettings,
                    selectedPrograms
                }
            });
            console.error('Error reordering program:', err);
            toast.error('Failed to update program order. Please try again.');
        }
    };

    // Reusable debounce hook
    const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
        const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

        return (...args: any[]) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        };
    };

    // Debounced update function for any application field
    const debouncedUpdate = useRef(useDebounce(async (updates: Record<string, any>) => {
        updateApplication(updates);
        await fetchApplication();
    }, 3200)).current;

    // Generic input change handler for any field
    const handleInputChange = (field: string, value: any, stepId?: string) => {
        // Map frontend field names to backend API field names
        const apiFieldMap: Record<string, string> = {
            'externalAccount.username': 'application_login',
            'externalAccount.password': 'application_password',
            // Add other field mappings as needed
        };

        // Get the API field name from the map, or use the original field name
        const apiField = apiFieldMap[field] || field;

        if (stepId) {
            setApplicationSteps(prevSteps =>
                prevSteps.map(step => {
                    if (step.id !== stepId) return step;

                    // Handle nested fields (e.g., 'externalAccount.username')
                    if (field.includes('.')) {
                        const [parent, child] = field.split('.');
                        return {
                            ...step,
                            [parent]: {
                                ...(step as any)[parent],
                                [child]: value
                            }
                        };
                    }

                    return { ...step, [field]: value };
                })
            );
        }

        // Send the update with the mapped field name
        debouncedUpdate({ [apiField]: value });
    };

    // Specific handler for external account inputs (for backward compatibility)
    const handleExternalAccountInput = (stepId: string, field: 'username' | 'password', value: string) => {
        handleInputChange(`externalAccount.${field}`, value, stepId);
    };
    const updateDocumentStatus = async (field: string, programId: number, documentAbbr: string) => {
        if (!applicationId) {
            toast.error('Application ID is missing');
            return;
        }

        const documentKey = `${programId}-${documentAbbr}`;

        try {
            setUpdatingDocuments(prev => ({
                ...prev,
                [documentKey]: true
            }));

            await updateApplication({
                [field]: [{
                    program_id: programId,
                    document_abbr: documentAbbr
                }]
            });

            await fetchApplication();
            toast.success('Document status updated successfully');
        } catch (error) {
            console.error('Error updating document status:', error);
            toast.error('Failed to update document status. Please try again.');
        } finally {
            setUpdatingDocuments(prev => ({
                ...prev,
                [documentKey]: false
            }));
            try {
                const program = userApplication?.recommendedPrograms?.find((p: any) => p.id === programId);
                const programName = program ? program.program_name : `Program ID: ${programId}`;
                await logActivity({
                    activity: 'Document',
                    details: `${documentAbbr} added for ${programName}`,
                    type: 'document'
                });
            } catch (error) {
                console.error('Failed to log activity:', error);
                // Don't show error to user since this is not critical
            }
        }
    };
    const updateApplicationStage = async (field: string, value: any) => {
        // Update the application stage in the backend
        await updateApplication({ [field]: value });
        await fetchApplication();

        // Also update the local state to reflect the change immediately
        setApplicationSteps(prevSteps =>
            prevSteps.map(step => ({
                ...step,
                status: getUpdatedStepStatus(step.stepNumber, value)
            }))
        );
    };

    // Helper function to determine step status based on current stage
    const getUpdatedStepStatus = (stepNumber: number, currentStage: number) => {
        if (stepNumber < currentStage) return 'completed';
        if (stepNumber === currentStage) return 'current';
        return 'pending';
    };

    // Handle external account save
    const saveExternalAccount = async (stepId: string, username: string, password: string) => {
        const step = applicationSteps.find(s => s.id === stepId);
        if (step?.externalAccount) {
            updateApplication({
                application_login: username,
                application_password: password
            });
            toast.success('External account credentials saved successfully');
            try {
                await logActivity({
                    activity: 'Account Created',
                    details: 'On application portal',
                    type: 'account'
                });
            } catch (error) {
                console.error('Failed to log activity:', error);
                // Don't show error to user since this is not critical
            }
        }
    };

    const updateAdmissionStatus = async (field: 'admitted_programs' | 'rejected_programs' | 'rejected_admission' | 'accepted_admission', programId: number) => {
        try {
            let updateData: Record<string, any> = {};

            if (field === 'accepted_admission') {
                // For accepted admission, set the single program ID and update progress
                updateData[field] = programId;
                updateData['progress'] = 3;
            } else {
                // For array fields, get current values and update accordingly
                const currentValue = userApplication?.[field] || [];
                const currentArray = Array.isArray(currentValue) ? currentValue : [];

                if (field === 'admitted_programs' || field === 'rejected_programs' || field === 'rejected_admission') {
                    // For these fields, we want to add to the array if not present
                    if (!currentArray.includes(programId)) {
                        updateData[field] = [...currentArray, programId];
                    } else {
                        updateData[field] = currentArray.filter((id: number) => id !== programId);
                    }
                }
            }

            await updateApplication(updateData);
            await fetchApplication();
            try {
                // Find the program name for the activity log
                const program = userApplication?.recommendedPrograms?.find((p: any) => p.id === programId);
                const programName = program ? program.program_name : `Program ID: ${programId}`;

                let statusText = '';
                switch (field) {
                    case 'accepted_admission':
                        statusText = 'Admission accepted';
                        break;
                    case 'rejected_admission':
                        statusText = 'Admission rejected';
                        break;
                    case 'admitted_programs':
                        statusText = 'Program admitted';
                        break;
                    case 'rejected_programs':
                        statusText = 'Program not admitted';
                        break;
                    default:
                        statusText = 'Admission status updated';
                }

                await logActivity({
                    activity: 'Admission Status Updated',
                    details: `${statusText} for ${programName}`,
                    type: 'admission'
                });
            } catch (error) {
                console.error('Failed to log activity:', error);
                // Don't show error to user since this is not critical
            }
        } catch (error) {
            console.error('Error updating admission status:', error);
            toast.error('Failed to update admission status');
        }
    };
    // Handle program addition
    const addProgram = async (stepId: string, program: any) => {
        const step = applicationSteps.find(s => s.id === stepId);
        if (step?.programSettings) {
            if (step.programSettings.selectedPrograms.includes(program.id)) {
                // If the program is already selected, toggle by removing it
                await removeProgram(stepId, program.id);
                return;
            }
            const updatedPrograms = [...step.programSettings.selectedPrograms, program.id];

            // Update local state first for immediate UI feedback
            updateStep(stepId, {
                programSettings: {
                    ...step.programSettings,
                    selectedPrograms: updatedPrograms
                }
            });

            try {
                const response = await fetch(`/api/v1/update-application/${applicationId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ selected_programs: updatedPrograms, stage: 2 })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || 'Failed to update application');
                }

                toast.success(`✅ Added "${program.program_name}" to your application`);
                try {
                    await logActivity({
                        activity: 'Program Added',
                        details: `${program.program_name} to program selection`,
                        type: 'program'
                    });
                } catch (error) {
                    console.error('Failed to log activity:', error);
                    // Don't show error to user since this is not critical
                }
            } catch (err) {
                // Revert local state on error
                updateStep(stepId, {
                    programSettings: {
                        ...step.programSettings,
                        selectedPrograms: step.programSettings.selectedPrograms.filter((p: number) => p !== program.id)
                    }
                });

                console.error('Error adding program:', err);
                toast.error(`Failed to add "${program.program_name}". Please try again.`);
                throw err; // Re-throw to ensure the loading state is cleared
            }
        }
    };
    const handleProgramsContinue = async () => {
        const currentStep = applicationSteps.find(step => step.id === selectedStep);
        if (!currentStep?.programSettings) return;

        const { selectedPrograms } = currentStep.programSettings;
        const maxPrograms = currentStep.programSettings.maxPrograms;

        // First confirmation: Check if user wants to continue with fewer than max programs
        if (selectedPrograms.length < maxPrograms) {
            const confirmed = await new Promise<boolean>((resolve) => {
                toast.custom((t) => (
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <p className="mb-4">
                            You have only selected {selectedPrograms.length} out of {maxPrograms} recommended programs.
                            Are you sure you want to continue? You can update your selection later before the deadline.
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    toast.dismiss(t);
                                    resolve(false);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    toast.dismiss(t);
                                    resolve(true);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                ), {
                    duration: 30000,
                    position: 'bottom-right',
                });
            });

            if (!confirmed) return;
        }

        // Second confirmation: Confirm ranking before final submission
        const confirmedRanking = await new Promise<boolean>((resolve) => {
            toast.custom((t) => (
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm">
                    <p className="mb-4 text-sm">
                        I confirm that I have ranked the programs in the same order as in the university admission portal.
                        You can update your selection and ranking before the deadline.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                resolve(false);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                resolve(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                        >
                            Confirm & Continue
                        </button>
                    </div>
                </div>
            ), {
                duration: 30000, // 30 seconds for this important confirmation
                position: 'bottom-right',
            });
        });

        if (!confirmedRanking) return;
        try {
            await logActivity({
                activity: 'Program Selection',
                details: `Completed, ranked and submitted`,
                type: 'program'
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't show error to user since this is not critical
        }
        // Proceed with stage update
        await updateApplicationStage('stage', 3);
    };
    const handleDocumentsContinue = async () => {
        const currentStep = applicationSteps.find(step => step.id === selectedStep);

        // Second confirmation: Confirm ranking before final submission
        const confirmedRanking = await new Promise<boolean>((resolve) => {
            toast.custom((t) => (
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm">
                    <p className="mb-4 text-sm">
                        I confirm that I have uploaded all required documents to the different universities.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                resolve(false);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                resolve(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                        >
                            Confirm & Continue
                        </button>
                    </div>
                </div>
            ), {
                duration: 30000, // 30 seconds for this important confirmation
                position: 'bottom-right',
            });
        });

        if (!confirmedRanking) return;
        try {
            await logActivity({
                activity: 'Document',
                details: 'Confirmation that all documents has been uploaded to admission portal',
                type: 'document'
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't show error to user since this is not critical
        }
        // Proceed with stage update
        await updateApplicationStage('stage', 4);
    };
    const handlePaymentContinue = async () => {
        const currentStep = applicationSteps.find(step => step.id === selectedStep);

        // Second confirmation: Confirm ranking before final submission
        const confirmedRanking = await new Promise<boolean>((resolve) => {
            toast.custom((t) => (
                <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm">
                    <p className="mb-4 text-sm">
                        I confirm that I have completed the application fees payment. You can update your program ranking until the deadline.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                resolve(false);
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t);
                                resolve(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                        >
                            Confirm & Continue
                        </button>
                    </div>
                </div>
            ), {
                duration: 30000, // 30 seconds for this important confirmation
                position: 'bottom-right',
            });
        });

        if (!confirmedRanking) return;
        try {
            await logActivity({
                activity: 'Application Fees',
                details: 'Confirmation that application fees has been paid',
                type: 'payment'
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't show error to user since this is not critical
        }
        // Proceed with stage and progress update
        await updateApplicationStage('stage', 5);
        await updateApplication({ progress: 2 });
    };
    // Handle file upload
    const handleFileUpload = (stepId: string) => {
        setCurrentStepId(stepId);
        setFileManagerOpen(true);
        toast.info('Opening file manager...');
    };

    // Handle program selection
    const handleProgramSelection = (stepId: string) => {
        setCurrentStepId(stepId);
        setProgramSelectionOpen(true);
        toast.info('Opening program selection...');
    };

    const openVideoModal = async (videoUrl: string, title: string) => {
        setCurrentVideoUrl(videoUrl);
        setCurrentVideoTitle(title);
        setVideoModalOpen(true);

        toast.success(`Opening video: "${title}"`);

        try {
            await logActivity({
                activity: 'view_video',
                details: `Watched video: "${title}"`,
                type: 'other'
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
            // Don't show error to user since this is not critical
        }
    };

    // Handle notification toggle
    const toggleNotifications = () => {
        setEmailNotifications(!emailNotifications);
        toast.success(`Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`);
    };

    // Handle admission actions
    const handleAcceptAdmission = (appId: string) => {
        acceptAdmission(appId);
        toast.success('Admission accepted successfully!');
    };

    const handleDeclineAdmission = (appId: string) => {
        declineAdmission(appId);
        toast.info('Admission declined');
    };

    // Handle step completion
    const handleStepCompletion = (stepId: string) => {
        const step = applicationSteps.find(s => s.id === stepId);
        if (step) {
            setApplicationSteps(prevSteps =>
                prevSteps.map(s =>
                    s.id === stepId ? { ...s, status: 'completed' } : s
                )
            );
            toast.success(`Step "${step.title}" marked as completed!`);
        }
    };

    const getStepStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'current':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'overdue':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    const getProgramProgressValue = () => {
        if (!applicationSteps || applicationSteps.length === 0) return 0;
        const completed = applicationSteps.filter(step => step.status === 'completed').length;
        return (completed / applicationSteps.length) * 100;
    };
    const getVisaProgressValue = () => {
        if (!visaSteps || visaSteps.length === 0) return 0;
        const completed = visaSteps.filter(step => step.status === 'completed').length;
        return (completed / visaSteps.length) * 100;
    };

    // Activity log grouped by date - using activity logs from API response
    const groupedActivities = userApplication?.activityLogs?.reduce((groups: { [key: string]: any[] }, activity: any) => {
        if (!activity || !activity.created_at) return groups;
        const date = new Date(activity.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(activity);
        return groups;
    }, {}) || {};

    const getActivityIcon = (type: string | null) => {
        if (!type) return <Activity className="h-4 w-4 text-gray-500" />;

        const typeLower = type.toLowerCase();

        if (typeLower.includes('acc') || typeLower.includes('user')) {
            return <UserCheck className="h-4 w-4 text-purple-500" />;
        } else if (typeLower.includes('doc')) {
            return <FileCheck className="h-4 w-4 text-green-500" />;
        } else if (typeLower.includes('prog')) {
            return <GraduationCap className="h-4 w-4 text-blue-500" />;
        } else if (typeLower.includes('form') || typeLower.includes('app')) {
            return <Edit className="h-4 w-4 text-orange-500" />;
        } else if (typeLower.includes('pay') || typeLower.includes('fee')) {
            return <CreditCard className="h-4 w-4 text-teal-500" />;
        } else if (typeLower.includes('visa') || typeLower.includes('immigr')) {
            return <Globe className="h-4 w-4 text-indigo-500" />;
        } else if (typeLower.includes('scholar')) {
            return <Award className="h-4 w-4 text-amber-500" />;
        } else if (typeLower.includes('comm') || typeLower.includes('message')) {
            return <MessageSquare className="h-4 w-4 text-sky-500" />;
        } else if (typeLower.includes('status') || typeLower.includes('update')) {
            return <RefreshCw className="h-4 w-4 text-cyan-500" />;
        } else if (typeLower.includes('deadline') || typeLower.includes('due')) {
            return <Calendar className="h-4 w-4 text-rose-500" />;
        } else if (typeLower.includes('login') || typeLower.includes('auth')) {
            return <LogIn className="h-4 w-4 text-lime-500" />;
        } else if (typeLower.includes('profile') || typeLower.includes('account')) {
            return <User className="h-4 w-4 text-violet-500" />;
        } else if (typeLower.includes('upload') || typeLower.includes('file')) {
            return <Upload className="h-4 w-4 text-emerald-500" />;
        } else if (typeLower.includes('email') || typeLower.includes('notification')) {
            return <Mail className="h-4 w-4 text-pink-500" />;
        } else if (typeLower.includes('system') || typeLower.includes('admin')) {
            return <Settings className="h-4 w-4 text-gray-500" />;
        } else if (typeLower.includes('error') || typeLower.includes('warning')) {
            return <AlertTriangle className="h-4 w-4 text-red-500" />;
        } else if (typeLower.includes('success') || typeLower.includes('complete')) {
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        } else if (typeLower.includes('info') || typeLower.includes('note')) {
            return <Info className="h-4 w-4 text-blue-500" />;
        } else {
            return <Activity className="h-4 w-4 text-gray-400" />;
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
        <div className="min-h-screen bg-gray-50 relative">


            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 ">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">My Application</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">Track your study abroad journey</p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleNotifications}
                            className="flex items-center gap-2 text-xs sm:text-sm"
                        >
                            {emailNotifications ? <Bell className="h-3 w-3 sm:h-4 sm:w-4" /> : <BellOff className="h-3 w-3 sm:h-4 sm:w-4" />}
                            <span className="hidden sm:inline">
                                {emailNotifications ? 'Notifications On' : 'Notifications Off'}
                            </span>
                            <span className="sm:hidden">
                                {emailNotifications ? 'On' : 'Off'}
                            </span>
                        </Button>
                        <Badge variant="outline" className="text-xs sm:text-sm">
                            {applicationSteps?.filter(s => s.status === 'completed').length + visaSteps.filter(s => (userApplication?.stage || 0) > s.stepNumber).length || 0}/{applicationSteps?.length + visaSteps?.length || 0} Complete
                        </Badge>
                        {/* Progress Overview */}
                        <div className="flex flex-col lg:flex-row lg:items-left justify-between gap-4">
                            {isUpdating ? (
                                <Badge variant="outline">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </Badge>
                            ) : (
                                <Badge variant="outline">
                                    <Check className="h-4 w-4 mr-2" />
                                    Updated {getTimeAgo(userApplication?.updated_at || '')}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Horizontal Navigation */}
                <div className="bg-white rounded-lg border shadow-sm">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="bg-white border-b border-gray-200 overflow-x-auto sticky top-16 z-10">
                            <TabsList className="h-auto p-0 bg-transparent w-full min-w-max">
                                <TabsTrigger
                                    value="application"
                                    className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm"
                                >
                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="whitespace-nowrap">Application</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="scholarships"
                                    className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm"
                                >
                                    <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="whitespace-nowrap">Scholarships</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="admission"
                                    className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm"
                                >
                                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="whitespace-nowrap">Admission Status</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="visa"
                                    className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm"
                                >
                                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="whitespace-nowrap">Visa</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none text-xs sm:text-sm"
                                >
                                    <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="whitespace-nowrap">Activity</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Program Application Tab */}
                        <TabsContent value="application" className="p-2 space-y-2">

                            <Card>
                                <CardContent className="p-6">
                                    {getProgramProgressValue() === 100 ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                <h3 className="text-lg font-semibold">Application Submitted Successfully!</h3>
                                            </div>
                                            <p className="text-gray-600">
                                                You have successfully submitted and uploaded all required documents to the university admission portal.
                                            </p>
                                            {userApplication?.admitted_programs?.length > 0 ? (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800 space-y-2">
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        <span className="font-medium">Admission Status:</span> You've been admitted to {userApplication.admitted_programs.length} program{userApplication.admitted_programs.length !== 1 ? 's' : ''}.
                                                    </p>
                                                    {userApplication.accepted_admission && userApplication.groupData?.programs?.find((p: any) => p.id === userApplication.accepted_admission) && (
                                                        <p className="text-sm text-green-700 dark:text-green-300">
                                                            <span className="font-medium">✓ Accepted Admission:</span> {userApplication.groupData.programs.find((p: any) => p.id === userApplication.accepted_admission)?.name} at {userApplication.groupData.programs.find((p: any) => p.id === userApplication.accepted_admission)?.university}, {userApplication.groupData.programs.find((p: any) => p.id === userApplication.accepted_admission)?.city}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        <span className="font-medium">Admission Results:</span> Will be published on {userApplication?.admission_result_date ? 
                                                            new Date(userApplication.admission_result_date).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : 'a future date'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">Application Progress</h3>
                                                <p className="text-gray-600">
                                                    {applicationSteps?.filter(s => s.status === 'completed').length || 0} of {applicationSteps?.length || 0} steps completed
                                                </p>
                                            </div>
                                            <div className="w-full lg:w-64">
                                                <Progress value={getProgramProgressValue()} className="h-3" />
                                                <p className="text-right text-sm text-gray-500 mt-1">
                                                    {Math.round(getProgramProgressValue())}%
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Steps */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Steps List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Application Steps</h3>
                                    {applicationSteps.map((step, index) => (
                                        <Card
                                            key={step.id}
                                            className={`cursor-pointer transition-all hover:shadow-md ${selectedStep === step.id ? 'border-blue-500 bg-blue-50' : ''
                                                }`}
                                            onClick={() => handleStepSelection(step.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {getStepStatusIcon(step.status)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-medium">{step.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Step {step.stepNumber}
                                                                    </Badge>

                                                                    <Badge
                                                                        variant={step.status === 'completed' ? 'default' : 'secondary'}
                                                                        className="text-xs"
                                                                    >
                                                                        {step.status}
                                                                    </Badge>
                                                                </div>
                                                                {step.deadline && (
                                                                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                                                        <Calendar className="h-3 w-3" />
                                                                        Due: {step.deadline}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Step Details */}
                                <div className="space-y-4" ref={detailsRef}>
                                    {applicationSteps.find(step => step.id === selectedStep) ? (
                                        (() => {
                                            const currentStep = applicationSteps.find(step => step.id === selectedStep)!;
                                            return (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            {getStepStatusIcon(currentStep.status)}
                                                            {currentStep.title}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                        {/* Video */}
                                                        {currentStep.videoUrl && (
                                                            <div className="space-y-2">
                                                                <Label>Step Video</Label>
                                                                <div
                                                                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                                                    onClick={() => openVideoModal(currentStep.videoUrl!, currentStep.title)}
                                                                >
                                                                    <div className="text-center">
                                                                        <Play className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                                                                        <p className="text-sm text-gray-600">Click to watch video</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Instructions */}
                                                        <div className="space-y-4">
                                                            {currentStep.instructions.header && (
                                                                <div>
                                                                    <h4 className="font-medium mb-2">{currentStep.instructions.header}</h4>
                                                                </div>
                                                            )}

                                                            {currentStep.instructions.paragraphs?.map((paragraph, index) => (
                                                                <p key={index} className="text-gray-600">{paragraph}</p>
                                                            ))}

                                                            {currentStep.instructions.bulletPoints && (
                                                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                                                    {currentStep.instructions.bulletPoints.map((point, index) => (
                                                                        <li key={index}>{point}</li>
                                                                    ))}
                                                                </ul>
                                                            )}

                                                            {currentStep.instructions.footer && (
                                                                <p className="text-sm text-gray-500 border-t pt-3">
                                                                    {currentStep.instructions.footer}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Alerts */}
                                                        {currentStep.alerts?.map((alert, index) => (
                                                            <Alert key={index} className={`
                                ${alert.type === 'error' ? 'border-red-200 bg-red-50' : ''}
                                ${alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                                ${alert.type === 'success' ? 'border-green-200 bg-green-50' : ''}
                                ${alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
                              `}>
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertDescription>{alert.message}</AlertDescription>
                                                            </Alert>
                                                        ))}
                                                        {currentStep.type === 'document' && currentStep.documents && (
                                                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                                                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <h4 className="font-medium text-gray-900 dark:text-white">AI-Powered Document Service</h4>
                                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                                            Let our AI help you prepare and optimize your application documents. Save time and increase your chances of acceptance with perfectly tailored materials.
                                                                        </p>
                                                                        <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                                            <li>✓ AI-assisted document review and optimization</li>
                                                                            <li>✓ Formatting according to university standards</li>
                                                                            <li>✓ Plagiarism and grammar check</li>
                                                                            <li>✓ Personalized improvement suggestions</li>
                                                                        </ul>
                                                                        <Button
                                                                            onClick={() => navigate('/student/documents')}
                                                                            className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                                                            size="sm"
                                                                        >
                                                                            <Sparkles className="h-4 w-4 mr-2" />
                                                                            Try AI Document Assistant
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>)}

                                                        {/* External Account Form */}
                                                        {currentStep.type === 'registration' && currentStep.externalAccount && (
                                                            <div className="space-y-4 border-t pt-4">
                                                                <Label>Save External Account Details</Label>
                                                                {userApplication && userApplication.stage > 1 ? (
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                                                                                <div>
                                                                                    <Label>Username</Label>
                                                                                    {editMode ? (
                                                                                        <Input
                                                                                            placeholder="Enter username"
                                                                                            value={tempCredentials.username}
                                                                                            onChange={(e) => setTempCredentials(prev => ({ ...prev, username: e.target.value }))}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Badge variant="outline" className="text-sm font-normal">
                                                                                                {currentStep.externalAccount.username || 'Not set'}
                                                                                            </Badge>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <Label>Password</Label>
                                                                                    <div className="relative">
                                                                                        {editMode ? (
                                                                                            <Input
                                                                                                type={showPassword ? "text" : "password"}
                                                                                                placeholder={showPassword ? (currentStep?.externalAccount?.password || '') : '•'.repeat(20)}
                                                                                                value={tempCredentials.password}
                                                                                                onChange={(e) => setTempCredentials(prev => ({ ...prev, password: e.target.value }))}
                                                                                                className="pr-10"

                                                                                            />
                                                                                        ) : (
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Badge variant="outline" className="font-mono text-sm font-normal">
                                                                                                    {showPassword ? (currentStep?.externalAccount?.password || '') : '•'.repeat(25)}
                                                                                                </Badge>
                                                                                            </div>
                                                                                        )}
                                                                                        <button
                                                                                            type="button"
                                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                                        >
                                                                                            {showPassword ? (
                                                                                                <EyeOff className="h-4 w-4" />
                                                                                            ) : (
                                                                                                <Eye className="h-4 w-4" />
                                                                                            )}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            {editMode ? (
                                                                                <>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        onClick={() => {
                                                                                            setEditMode(false);
                                                                                            setTempCredentials({ username: '', password: '' });
                                                                                        }}
                                                                                    >
                                                                                        Cancel
                                                                                    </Button>
                                                                                    <Button
                                                                                        onClick={async () => {
                                                                                            await updateApplication({
                                                                                                application_login: tempCredentials.username || currentStep?.externalAccount?.username,
                                                                                                application_password: tempCredentials.password || currentStep?.externalAccount?.password
                                                                                            });
                                                                                            await fetchApplication();
                                                                                            setEditMode(false);
                                                                                            setTempCredentials({ username: '', password: '' });
                                                                                        }}
                                                                                        disabled={isUpdating}
                                                                                    >
                                                                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                                                                    </Button>
                                                                                </>
                                                                            ) : (
                                                                                <Button
                                                                                    variant="outline"
                                                                                    onClick={() => {
                                                                                        setTempCredentials({
                                                                                            username: currentStep?.externalAccount?.username,
                                                                                            password: currentStep?.externalAccount?.password
                                                                                        });
                                                                                        setEditMode(true);
                                                                                    }}
                                                                                >
                                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                                    Update Account
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <Label>Username</Label>
                                                                            <Input
                                                                                placeholder="Enter username"
                                                                                value={currentStep?.externalAccount?.username}
                                                                                onChange={(e) => handleExternalAccountInput(currentStep.id, 'username', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label>Password</Label>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    type={showPassword ? "text" : "password"}
                                                                                    placeholder="Enter password"
                                                                                    value={currentStep.externalAccount.password}
                                                                                    onChange={(e) => handleExternalAccountInput(currentStep.id, 'password', e.target.value)}
                                                                                    className="pr-10"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                                >
                                                                                    {showPassword ? (
                                                                                        <EyeOff className="h-4 w-4" />
                                                                                    ) : (
                                                                                        <Eye className="h-4 w-4" />
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {userApplication && userApplication.stage <= 1 && (
                                                                    <Button
                                                                        onClick={() => updateApplicationStage('stage', 2)}
                                                                        className="mt-4"
                                                                        disabled={isUpdating}
                                                                    >
                                                                        {isUpdating ? (
                                                                            <>
                                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                Saving details...
                                                                            </>
                                                                        ) : (
                                                                            'Complete account setup'
                                                                        )}
                                                                    </Button>
                                                                )}
                                                                {currentStep.externalAccount.portalUrl && (
                                                                    <div className="col-span-full text-sm text-gray-600">
                                                                        <div className="flex flex-col sm:flex-row gap-1 sm:items-center">
                                                                            <span className="whitespace-nowrap">Application Portal:</span>
                                                                            <a
                                                                                href={currentStep.externalAccount.portalUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-500 hover:underline break-all overflow-hidden text-ellipsis"
                                                                            >
                                                                                {currentStep.externalAccount.portalUrl}
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Program Selection */}
                                                        {currentStep.type === 'program' && currentStep.programSettings && (
                                                            <div className="space-y-4 border-t pt-4">
                                                                <div className="flex items-center justify-between">
                                                                    <Label>Selected Programs ({currentStep.programSettings.selectedPrograms.length}/{currentStep.programSettings.maxPrograms})</Label>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    {currentStep.programSettings.selectedPrograms.map((programId, index) => {
                                                                        // Find the program object by ID
                                                                        const program = userApplication?.recommendedPrograms?.find(p => p.id === programId);
                                                                        const programName = program ? program.program_name : `Program ID: ${programId}`;
                                                                        const isFirst = index === 0;
                                                                        const isLast = index === currentStep.programSettings.selectedPrograms.length - 1;

                                                                        return (
                                                                            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                                                                <div className="flex items-start justify-between">
                                                                                    <div className="flex-1">
                                                                                        <div className="flex items-center gap-2 mb-2">
                                                                                            <Badge variant="outline" className="text-xs font-medium">
                                                                                                Ranked #{index + 1}
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <h4 className="font-semibold text-lg mb-2 line-clamp-2">{programName}</h4>

                                                                                        {program && (
                                                                                            <div className="grid grid-cols sm:grid-cols-3 gap-3 text-sm text-gray-600">
                                                                                                {program.city && (
                                                                                                    <div className="flex items-center gap-1">
                                                                                                        <MapPin className="h-4 w-4" />
                                                                                                        <span>{program.city} | {program.duration}</span>
                                                                                                    </div>
                                                                                                )}
                                                                                                {program.study_duration && (
                                                                                                    <div className="flex items-center gap-1">
                                                                                                        <Clock className="h-4 w-4" />
                                                                                                        <span>{program.study_duration}</span>
                                                                                                    </div>
                                                                                                )}
                                                                                                {program.total_tuition && (
                                                                                                    <div className="flex items-center gap-1">
                                                                                                        <Wallet className="h-4 w-4" />
                                                                                                        <span>{program.currency}{program.total_tuition}</span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>

                                                                                    {currentStep.deadline && new Date(currentStep.deadline) < new Date() ? (
                                                                                        <div className="flex items-center gap-1 ml-4 opacity-50" title="The deadline has passed. You can no longer update your program selection or ranking.">
                                                                                            <div className="flex flex-col gap-1">
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    disabled
                                                                                                    className="h-8 w-8 p-0 cursor-not-allowed"
                                                                                                >
                                                                                                    <ChevronUp className="h-3 w-3" />
                                                                                                </Button>
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    disabled
                                                                                                    className="h-8 w-8 p-0 cursor-not-allowed"
                                                                                                >
                                                                                                    <ChevronDown className="h-3 w-3" />
                                                                                                </Button>
                                                                                            </div>
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                disabled
                                                                                                className="h-8 w-8 p-0 text-gray-400 cursor-not-allowed"
                                                                                            >
                                                                                                <X className="h-3 w-3" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="flex items-center gap-1 ml-4">
                                                                                            <div className="flex flex-col gap-1">
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    onClick={() => moveProgram(currentStep.id, programId, 'up')}
                                                                                                    disabled={isFirst}
                                                                                                    className="h-8 w-8 p-0"
                                                                                                    title="Move up"
                                                                                                >
                                                                                                    <ChevronUp className="h-3 w-3" />
                                                                                                </Button>
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant="outline"
                                                                                                    onClick={() => moveProgram(currentStep.id, programId, 'down')}
                                                                                                    disabled={isLast}
                                                                                                    className="h-8 w-8 p-0"
                                                                                                    title="Move down"
                                                                                                >
                                                                                                    <ChevronDown className="h-3 w-3" />
                                                                                                </Button>
                                                                                            </div>
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="outline"
                                                                                                onClick={() => removeProgram(currentStep.id, programId)}
                                                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
                                                                                                title="Remove program"
                                                                                            >
                                                                                                <X className="h-3 w-3" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}

                                                                    {currentStep.programSettings.selectedPrograms.length < currentStep.programSettings.maxPrograms && (
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={() => handleProgramSelection(currentStep.id)}
                                                                            className="w-full"
                                                                        >
                                                                            <Plus className="h-4 w-4 mr-2" />
                                                                            Add Program
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Program-Specific Document Requirements */}
                                                        {currentStep.type === 'document' && currentStep.documents && (
                                                            <div className="space-y-6 border-t pt-4">
                                                                <Label>Document Requirements by Program</Label>

                                                                {/* Check if we have program requirements */}
                                                                {currentStep.documents.required && currentStep.documents.required.length > 0 &&
                                                                    typeof currentStep.documents.required[0] === 'object' ? (
                                                                    // New format with program-specific requirements
                                                                    currentStep.documents.required.map((programReq: any, programIndex: number) => (
                                                                        <div key={programIndex} className="border rounded-lg overflow-hidden">
                                                                            <div
                                                                                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                                                onClick={() => {
                                                                                    // Toggle program visibility
                                                                                    const updatedExpanded = { ...expandedPrograms };
                                                                                    updatedExpanded[programReq.program_id] = !updatedExpanded[programReq.program_id];
                                                                                    setExpandedPrograms(updatedExpanded);
                                                                                }}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <GraduationCap className="h-5 w-5 text-blue-500" />
                                                                                    <h3 className="font-medium">{programReq.program_name}</h3>
                                                                                </div>
                                                                                <ChevronDown
                                                                                    className={`h-5 w-5 transition-transform ${expandedPrograms[programReq.program_id] ? 'rotate-180' : ''}`}
                                                                                />
                                                                            </div>

                                                                            {expandedPrograms[programReq.program_id] && (
                                                                                <div className="p-4 space-y-3 bg-white">
                                                                                    {programReq.requirements && programReq.requirements.map((req: any, reqIndex: number) => {
                                                                                        // Check if document is uploaded by matching both program_id and document_abbr
                                                                                        const isUploaded = currentStep.documents?.uploaded.some(
                                                                                            doc => doc.program_id === programReq.program_id && doc.document_abbr === req.abbr
                                                                                        );
                                                                                        return (
                                                                                            <div key={reqIndex} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                                                                <div className="flex items-start gap-3">
                                                                                                    {isUploaded ? (
                                                                                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                                                                    ) : (
                                                                                                        <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                                                                                    )}
                                                                                                    <div>
                                                                                                        <div className="font-medium text-sm">{req.name}</div>
                                                                                                        <div className="text-xs text-gray-600 mt-1">{req.instruction} {req.abbr}</div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    variant={isUploaded ? "outline" : "default"}
                                                                                                    onClick={() => updateDocumentStatus('added_documents', programReq.program_id, req.abbr)}
                                                                                                    disabled={isUploaded || updatingDocuments[`${programReq.program_id}-${req.abbr}`]}
                                                                                                >
                                                                                                    {updatingDocuments[`${programReq.program_id}-${req.abbr}`] ? (
                                                                                                        <>
                                                                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                                                            Updating...
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <Check className="h-4 w-4 mr-2" />
                                                                                                            {isUploaded ? 'Added' : 'Add'}
                                                                                                        </>
                                                                                                    )}
                                                                                                </Button>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-center py-8">
                                                                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Requirements Yet</h3>
                                                                        <p className="text-gray-500 max-w-md mx-auto">
                                                                            All required documents will be available when you add a program to your application.
                                                                        </p>
                                                                        <Button
                                                                            className="mt-4"
                                                                            onClick={() => handleProgramSelection(currentStep.id)}
                                                                        >
                                                                            Add Program Now
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Form Fields */}
                                                        {currentStep.formFields && currentStep.formFields.length > 0 && (
                                                            <div className="space-y-4 border-t pt-4">
                                                                <Label>Form Information</Label>
                                                                <div className="space-y-4">
                                                                    {currentStep.formFields.map((field) => (
                                                                        <div key={field.id} className="space-y-2">
                                                                            <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                                                                            {field.type === 'textarea' ? (
                                                                                <Textarea placeholder={field.placeholder} />
                                                                            ) : (
                                                                                <Input type={field.type} placeholder={field.placeholder} />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Action Buttons */}
                                                        <div className="flex flex-wrap gap-2 border-t pt-4">

                                                            {currentStep.type === 'program' && currentStep.programSettings && userApplication?.stage === currentStep.stepNumber && (
                                                                (currentStep.deadline && new Date(currentStep.deadline) < new Date()) ? (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        disabled
                                                                        className="cursor-not-allowed"
                                                                    >
                                                                        Program selection deadline passed
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        onClick={handleProgramsContinue}
                                                                        size="sm"
                                                                        disabled={currentStep.programSettings?.selectedPrograms.length === 0}
                                                                    >
                                                                        {currentStep.programSettings?.selectedPrograms.length === 0
                                                                            ? 'Select at least one program to continue'
                                                                            : 'Update Programs and continue'}
                                                                    </Button>
                                                                )
                                                            )}
                                                            {currentStep.type === 'document' && userApplication?.stage < currentStep.stepNumber && (
                                                                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md border border-amber-200 dark:border-amber-800">
                                                                    ⚠️ Program selection not completed or updated. Please complete this step to continue.
                                                                </div>
                                                            )}
                                                            {currentStep.type === 'document' && userApplication?.stage === currentStep.stepNumber && (
                                                                <Button
                                                                    onClick={handleDocumentsContinue}
                                                                    size="sm"
                                                                >
                                                                    Update documents and continue
                                                                </Button>

                                                            )}
                                                            {currentStep.type === 'payment' && userApplication?.stage === currentStep.stepNumber && (
                                                                <Button
                                                                    onClick={handlePaymentContinue}
                                                                    size="sm"
                                                                >
                                                                    Update payment and continue
                                                                </Button>

                                                            )}

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setChatbotOpen(true)}
                                                            >
                                                                <HelpCircle className="h-4 w-4 mr-2" />
                                                                Need Help?
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })()
                                    ) : (
                                        <Card className="h-96 flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <FileText className="h-12 w-12 mx-auto mb-4" />
                                                <p>Select a step to view details</p>
                                                {isMobile && (
                                                    <p className="text-sm mt-2">Tap any step above to see details here</p>
                                                )}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Scholarships Tab */}
                        <TabsContent value="scholarships" className="p-6 space-y-6">
                            {/* Progress Overview */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Scholarship Progress</h3>
                                            <p className="text-gray-600">
                                                {scholarshipSteps.filter(s => s.status === 'completed').length} of {scholarshipSteps.length} steps completed
                                            </p>
                                        </div>
                                        <div className="w-full lg:w-64">
                                            <Progress value={(scholarshipSteps.filter(s => s.status === 'completed').length / scholarshipSteps.length) * 100} className="h-3" />
                                            <p className="text-right text-sm text-gray-500 mt-1">
                                                {Math.round((scholarshipSteps.filter(s => s.status === 'completed').length / scholarshipSteps.length) * 100)}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Scholarship Steps */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Steps List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Scholarship Steps</h3>
                                    {scholarshipSteps.map((step, index) => (
                                        <Card
                                            key={step.id}
                                            className={`cursor-pointer transition-all hover:shadow-md ${selectedScholarshipStep === step.id ? 'border-blue-500 bg-blue-50' : ''
                                                }`}
                                            onClick={() => setSelectedScholarshipStep(step.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {getStepStatusIcon(step.status)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-medium">{step.title}</h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Step {step.stepNumber}
                                                                    </Badge>
                                                                    <Badge
                                                                        variant={step.status === 'completed' ? 'default' : 'secondary'}
                                                                        className="text-xs"
                                                                    >
                                                                        {step.status}
                                                                    </Badge>
                                                                </div>
                                                                {step.deadline && (
                                                                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                                                        <Calendar className="h-3 w-3" />
                                                                        Due: {step.deadline}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Step Details */}
                                <div className="space-y-4">
                                    {scholarshipSteps.find(step => step.id === selectedScholarshipStep) ? (
                                        (() => {
                                            const currentStep = scholarshipSteps.find(step => step.id === selectedScholarshipStep)!;
                                            return (
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="flex items-center gap-2">
                                                            {getStepStatusIcon(currentStep.status)}
                                                            {currentStep.title}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                        {/* Video */}
                                                        {currentStep.videoUrl && (
                                                            <div className="space-y-2">
                                                                <Label>Step Video</Label>
                                                                <div
                                                                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                                                    onClick={() => openVideoModal(currentStep.videoUrl!, currentStep.title)}
                                                                >
                                                                    <div className="text-center">
                                                                        <Play className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                                                                        <p className="text-sm text-gray-600">Click to watch video</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Instructions */}
                                                        <div className="space-y-4">
                                                            {currentStep.instructions.header && (
                                                                <div>
                                                                    <h4 className="font-medium mb-2">{currentStep.instructions.header}</h4>
                                                                </div>
                                                            )}

                                                            {currentStep.instructions.paragraphs?.map((paragraph, index) => (
                                                                <p key={index} className="text-gray-600">{paragraph}</p>
                                                            ))}

                                                            {currentStep.instructions.bulletPoints && (
                                                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                                                    {currentStep.instructions.bulletPoints.map((point, index) => (
                                                                        <li key={index}>{point}</li>
                                                                    ))}
                                                                </ul>
                                                            )}

                                                            {currentStep.instructions.footer && (
                                                                <p className="text-sm text-gray-500 border-t pt-3">
                                                                    {currentStep.instructions.footer}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Alerts */}
                                                        {currentStep.alerts?.map((alert, index) => (
                                                            <Alert key={index} className={`
                                ${alert.type === 'error' ? 'border-red-200 bg-red-50' : ''}
                                ${alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                                ${alert.type === 'success' ? 'border-green-200 bg-green-50' : ''}
                                ${alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
                              `}>
                                                                <AlertCircle className="h-4 w-4" />
                                                                <AlertDescription>{alert.message}</AlertDescription>
                                                            </Alert>
                                                        ))}

                                                        {/* Document Upload */}
                                                        {currentStep.type === 'document' && currentStep.documents && (
                                                            <div className="space-y-4 border-t pt-4">
                                                                <Label>Required Documents</Label>
                                                                <div className="space-y-3">
                                                                    {currentStep.documents.required.map((doc, index) => {
                                                                        const isUploaded = currentStep.documents?.uploaded.includes(doc);
                                                                        return (
                                                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                                                <div className="flex items-center gap-3">
                                                                                    {isUploaded ? (
                                                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                                                    ) : (
                                                                                        <Clock className="h-5 w-5 text-gray-400" />
                                                                                    )}
                                                                                    <span className="text-sm">{doc}</span>
                                                                                </div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant={isUploaded ? "outline" : "default"}
                                                                                    onClick={() => handleFileUpload(currentStep.id)}
                                                                                >
                                                                                    <Upload className="h-4 w-4 mr-2" />
                                                                                    {isUploaded ? 'Replace' : 'Upload'}
                                                                                </Button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Action Buttons */}
                                                        <div className="flex flex-wrap gap-2 border-t pt-4">
                                                            {currentStep.buttons.map((button) => (
                                                                <Button
                                                                    key={button.id}
                                                                    variant={button.variant || 'default'}
                                                                    size="sm"
                                                                >
                                                                    {button.label}
                                                                </Button>
                                                            ))}

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setChatbotOpen(true)}
                                                            >
                                                                <HelpCircle className="h-4 w-4 mr-2" />
                                                                Need Help?
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })()
                                    ) : (
                                        <Card className="h-96 flex items-center justify-center">
                                            <div className="text-center text-gray-500">
                                                <GraduationCap className="h-12 w-12 mx-auto mb-4" />
                                                <p>Select a scholarship step to view details</p>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Admission Status Tab */}
                        <TabsContent value="admission" className="p-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        Admission Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(userApplication?.progress ?? 0) < 2 ? (
                                        <div className="text-center py-8">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                <School className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <h3 className="mt-3 text-lg font-medium text-gray-900">Program Application Incomplete</h3>
                                            <p className="mt-2 text-sm text-gray-500">
                                                You need to complete your program application to view admission status.
                                            </p>
                                        </div>
                                    ) : userApplication?.groupData?.programs?.map((program) => (
                                        <div key={program.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{program.name}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <School className="h-4 w-4" />
                                                        {program.university}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {program.city}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant="outline" className="capitalize">
                                                        {program.level.toLowerCase()}
                                                    </Badge>
                                                    <Badge variant="outline" className="capitalize">
                                                        {program.status === 'rejected' ? 'Not Admitted' : program.admissionStatus === 'accepted' ? 'Admission Accepted' : program.admissionStatus === 'pending' ? 'Pending Acceptance' : program.admissionStatus === 'rejected' ? 'Admission Declined' : 'Under Review'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">Duration</p>
                                                    <p className="font-medium">{program.duration}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">Tuition Fee</p>
                                                    <p className="font-medium">
                                                        {program.currency} {parseInt(program.first_tuition).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">Start Date</p>
                                                    <p className="font-medium">
                                                        {new Date(program.program_start_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-muted-foreground">End Date</p>
                                                    <p className="font-medium">
                                                        {new Date(program.program_end_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {program.status === 'admitted' && (
                                                <div className="space-y-3 p-3 bg-muted/50 rounded-md">
                                                    {program.admissionStatus === 'pending' ? (
                                                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                                                            {program.admissionAccepted ? (
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full sm:flex-1 disabled:opacity-50"
                                                                    disabled
                                                                >
                                                                    <InfoIcon className="h-4 w-4 mr-2" />
                                                                    <span className="whitespace-normal text-left">Admission already accepted for another program</span>
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    onClick={() => updateAdmissionStatus('accepted_admission', program.id)}
                                                                    size="sm"
                                                                    className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    Accept Admission
                                                                </Button>
                                                            )}
                                                            <Button
                                                                onClick={() => updateAdmissionStatus('rejected_admission', program.id)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full sm:flex-1"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Decline
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-3">
                                                            <Badge
                                                                variant={program.admissionStatus === 'accepted' ? 'default' : 'secondary'}
                                                                className="text-sm py-1 px-2"
                                                            >
                                                                {program.admissionStatus === 'accepted' ? (
                                                                    <span className="flex items-center">
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Admission Accepted
                                                                    </span>
                                                                ) : (
                                                                    <span className="flex items-center">
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Admission Declined
                                                                    </span>
                                                                )}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    {program.admissionStatus === 'accepted' && (
                                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm text-blue-700 dark:text-blue-300">
                                                            <div className="flex items-start gap-2">
                                                                <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                                <span>
                                                                    You will receive more information from {program.university} on how to proceed with tuition fee payment.
                                                                    <button
                                                                        className="font-medium text-blue-700 dark:text-blue-300 hover:underline"
                                                                        onClick={() => setChatbotOpen(true)}
                                                                    >
                                                                        Send a message
                                                                    </button> to your case officer if you need help with this.
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {program.status === 'under_review' && (

                                                <div className="flex gap-2 mt-3">
                                                    <Button
                                                        onClick={() => updateAdmissionStatus('admitted_programs', program.id)}
                                                        size="sm"
                                                        className="flex-1"
                                                    >
                                                        Admitted
                                                    </Button>
                                                    <Button
                                                        onClick={() => updateAdmissionStatus('rejected_programs', program.id)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                    >
                                                        Not admitted
                                                    </Button>
                                                </div>

                                            )}
                                        </div>
                                    ))}

                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Visa Application Tab */}
                        <TabsContent value="visa" className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-2 2xl:gap-2">
                                {/* YouTube Video Button */}
                                <Card>
                                    <CardContent className="p-6">
                                        {getVisaProgressValue() === 100 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    <h3 className="text-lg font-semibold">Visa Application Submitted Successfully!</h3>
                                                </div>
                                                <p className="text-gray-600">
                                                    You have successfully submitted and uploaded all required documents to the Swedish Immigration agency. Be on the look out for your visa decision.
                                                </p>
                                                {userApplication?.visa_decision && (
                                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                                                        {userApplication.visa_decision === 'positive' ? (
                                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                            <span className="font-medium">Swedish Visa Decision:</span>&nbsp;Congratulations! You have been granted a visa.
                                                        </p>
                                                        ) : (
                                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                <span className="font-medium">Swedish Visa Decision:</span>&nbsp;We understand this isn't the news we were hoping for, and we're here to support you. While we can't offer a refund, we want you to know that we believe in your dreams. Your current package includes our full support for one more year - we'll work together to make your next application even stronger. Please reach out to your case officer to discuss next steps and let's prepare for success together.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Visa Application Steps
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Desktop Layout - Column with Alerts Area */}
                                        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Main Content Column */}
                                            <div className="lg:col-span-2 space-y-6">
                                                {visaSteps.length === 0 ? (
                                                    <div className="text-center py-4 text-muted-foreground">
                                                        No visa steps available. Please check back later.
                                                    </div>
                                                ) : (
                                                    visaSteps.map((step) => (
                                                        <div key={step.id} className="border rounded-lg p-5 space-y-4 bg-card shadow-sm">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="font-semibold flex items-center gap-2">
                                                                        Step {step.stepNumber}: {step.title}

                                                                        <Badge
                                                                            variant={
                                                                                userApplication?.stage === step.stepNumber ? 'secondary' :
                                                                                    (userApplication?.stage || 0) > step.stepNumber ? 'default' : 'outline'
                                                                            }
                                                                        >
                                                                            {userApplication?.stage === step.stepNumber ? 'current' :
                                                                                (userApplication?.stage || 0) > step.stepNumber ? 'completed' : 'pending'}
                                                                        </Badge>
                                                                    </h3>

                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {step.videoUrl && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => openVideoModal(step.videoUrl, `Step ${step.stepNumber} Video Guide`)}
                                                                        >
                                                                            <Play className="h-4 w-4 mr-1" />
                                                                            Watch Guide
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {step.instructions.header && (
                                                                <div className="space-y-3">
                                                                    <h4 className="font-medium text-base">{step.instructions.header}</h4>
                                                                    {step.instructions.paragraphs?.map((paragraph, index) => (
                                                                        <p key={index} className="text-sm text-muted-foreground">{paragraph}</p>
                                                                    ))}
                                                                    {step.instructions.bulletPoints && step.instructions.bulletPoints.length > 0 && (
                                                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                                                                            {step.instructions.bulletPoints.map((point, index) => (
                                                                                <li key={index}>{point}</li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {step.type === 'decision' && userApplication?.visa_decision && (
                                                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                        <span className="font-medium">Next Step:</span> Please go to the Documents section and upload your visa decision document.
                                                                    </p>
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full sm:w-auto mt-2"
                                                                        onClick={() => {
                                                                            navigate('/student/documents');
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        <span>Documents</span>
                                                                    </Button>
                                                                    
                                                                </div>
                                                            )}
                                                            {step.type === 'appointment' && (
                                                                <div className="space-y-4">
                                                                    {step.appointmentDetails && step.appointmentDetails.date && step.appointmentDetails.time && step.appointmentDetails.location ? (
                                                                        // Display existing appointment details
                                                                        <div className="bg-muted/50 p-4 rounded-md space-y-2 border border-muted">
                                                                            <h4 className="font-medium text-base flex items-center gap-2">
                                                                                <Calendar className="h-4 w-4" />
                                                                                Appointment Details
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                                                <div>
                                                                                    <p className="text-muted-foreground">Location</p>
                                                                                    <p className="font-medium">{step.appointmentDetails.location}</p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-muted-foreground">Date</p>
                                                                                    <p className="font-medium">{step.appointmentDetails.date}</p>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-muted-foreground">Time</p>
                                                                                    <p className="font-medium">{formatTimeTo12Hour(step.appointmentDetails.time)}</p>
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                variant="outline"
                                                                                className="mt-4"
                                                                                onClick={() => {
                                                                                    // Clear appointment details and show form again

                                                                                    // Prepare empty appointment details for this step
                                                                                    const appointmentDetails = [];

                                                                                    // Update the application with empty appointment details and reduce stage
                                                                                    updateApplication({
                                                                                        visa_appointment_details: appointmentDetails,
                                                                                        stage: Math.max(1, step.stepNumber - 1)
                                                                                    });


                                                                                }}
                                                                            >
                                                                                <Calendar className="h-4 w-4 mr-2" />
                                                                                Reschedule Appointment
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        // Show appointment request form if no details exist
                                                                        <div className="space-y-4">
                                                                            <h4 className="font-medium text-base flex items-center gap-2">
                                                                                <Calendar className="h-4 w-4" />
                                                                                Schedule Appointment
                                                                            </h4>

                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div className="space-y-2">
                                                                                    <Label htmlFor={`appointment-date-${step.id}`}>Appointment Date</Label>
                                                                                    <Input
                                                                                        id={`appointment-date-${step.id}`}
                                                                                        type="date"
                                                                                        className="w-full"
                                                                                        value={appointmentFormData[step.id]?.date || ''}
                                                                                        onChange={(e) => setAppointmentFormData(prev => ({
                                                                                            ...prev,
                                                                                            [step.id]: {
                                                                                                ...prev[step.id],
                                                                                                date: e.target.value
                                                                                            }
                                                                                        }))}
                                                                                    />
                                                                                </div>

                                                                                <div className="space-y-2">
                                                                                    <Label htmlFor={`appointment-time-${step.id}`}>Appointment Time</Label>
                                                                                    <Input
                                                                                        id={`appointment-time-${step.id}`}
                                                                                        type="time"
                                                                                        className="w-full"
                                                                                        value={appointmentFormData[step.id]?.time || ''}
                                                                                        onChange={(e) => setAppointmentFormData(prev => ({
                                                                                            ...prev,
                                                                                            [step.id]: {
                                                                                                ...prev[step.id],
                                                                                                time: e.target.value
                                                                                            }
                                                                                        }))}
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <Label htmlFor={`appointment-location-${step.id}`}>Location</Label>
                                                                                <Input
                                                                                    id={`appointment-location-${step.id}`}
                                                                                    placeholder="Enter appointment location"
                                                                                    className="w-full"
                                                                                    value={appointmentFormData[step.id]?.location || ''}
                                                                                    onChange={(e) => setAppointmentFormData(prev => ({
                                                                                        ...prev,
                                                                                        [step.id]: {
                                                                                            ...prev[step.id],
                                                                                            location: e.target.value
                                                                                        }
                                                                                    }))}
                                                                                />
                                                                            </div>

                                                                            <div className="flex justify-end gap-2 pt-2">

                                                                                <Button
                                                                                    variant="default"
                                                                                    onClick={() => {
                                                                                        // Handle form submission

                                                                                        const appointmentData = appointmentFormData[step.id];
                                                                                        if (!appointmentData.date || !appointmentData.time || !appointmentData.location) {
                                                                                            toast.error('Please fill in all appointment details');
                                                                                            return;
                                                                                        }

                                                                                        // Update the step with appointment details
                                                                                        const updatedStep = {
                                                                                            ...step,
                                                                                            appointmentDetails: {
                                                                                                date: appointmentData.date,
                                                                                                time: appointmentData.time,
                                                                                                location: appointmentData.location
                                                                                            }
                                                                                        };

                                                                                        // Prepare appointment details object with step ID as key
                                                                                        const appointmentDetails = {

                                                                                            date: appointmentData.date,
                                                                                            time: appointmentData.time,
                                                                                            location: appointmentData.location

                                                                                        };

                                                                                        // Update the application with the new appointment details
                                                                                        updateApplication({
                                                                                            visa_appointment_details: appointmentDetails,
                                                                                            stage: step.stepNumber + 1
                                                                                        });

                                                                                    }}
                                                                                >
                                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                                    Schedule Appointment
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {step.type === 'document' && step.documents?.required?.length > 0 && (
                                                                <div className="space-y-3">
                                                                    <h4 className="font-medium text-base flex items-center gap-2">
                                                                        <FileText className="h-4 w-4" />
                                                                        Required Documents
                                                                    </h4>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                                        {step.documents?.required?.map((doc) => (
                                                                            <label key={doc} className="flex items-center space-x-3 p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors border border-muted">
                                                                                <Checkbox
                                                                                    id={`doc-${doc}`}
                                                                                    checked={(step.documents?.uploaded || []).includes(doc)}
                                                                                    onCheckedChange={async (checked) => {
                                                                                        try {
                                                                                            let updatedDocuments = [...(step.documents?.uploaded || [])];

                                                                                            if (checked) {
                                                                                                // Add document to visa_documents array if not already present
                                                                                                if (!updatedDocuments.includes(doc)) {
                                                                                                    updatedDocuments = [...updatedDocuments, doc];
                                                                                                }
                                                                                            } else {
                                                                                                // Remove document from visa_documents array
                                                                                                updatedDocuments = updatedDocuments.filter((d: string) => d !== doc);
                                                                                            }

                                                                                            const currentDocuments = step.documents?.uploaded || [];

                                                                                            // Merge the current documents with our updated documents
                                                                                            const mergedDocuments = [...new Set([...currentDocuments, ...updatedDocuments])];

                                                                                            // Update the backend with the merged documents
                                                                                            const response = await updateApplication({
                                                                                                visa_documents: mergedDocuments
                                                                                            });

                                                                                            if (response) {
                                                                                                await fetchApplication(); // Refresh the application data
                                                                                            }
                                                                                        } catch (error) {
                                                                                            console.error('Error updating document status:', error);
                                                                                            toast.error('Failed to update document status. Please try again.');
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <span className="text-sm">{doc}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>

                                                                </div>
                                                            )}

                                                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                                {step.type === 'document' && step.documents?.required?.every(doc => step.documents?.uploaded?.includes(doc)) && userApplication?.stage === step.stepNumber && (
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full sm:w-auto"
                                                                        onClick={() => {
                                                                            updateApplicationStage('stage', step.stepNumber + 1)
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        <span>Proceed to Next Step</span>
                                                                    </Button>
                                                                )}
                                                                {step.type === 'application' && userApplication?.stage === step.stepNumber && (
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full sm:w-auto"
                                                                        onClick={() => {
                                                                            updateApplicationStage('stage', step.stepNumber + 1)
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        <span>Proceed to Next Step</span>
                                                                    </Button>
                                                                )}
                                                                {step.type === 'interview' && userApplication?.stage === step.stepNumber && (
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full sm:w-auto"
                                                                        onClick={() => {
                                                                            updateApplicationStage('stage', step.stepNumber + 1)
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        <span>Visa Interview Done</span>
                                                                    </Button>
                                                                )}
                                                                {step.type === 'decision' && userApplication?.stage === step.stepNumber && (
                                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                                        <Button
                                                                            variant="default"
                                                                            className="w-full sm:w-auto"
                                                                            onClick={() => {
                                                                                updateApplication({
                                                                                    stage: step.stepNumber + 1, visa_decision: 'positive',
                                                                                    progress: 4,status:1
                                                                                });
                                                                            }}
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                                            <span>Visa Approved</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="default"
                                                                            className="w-full sm:w-auto"
                                                                            onClick={() => {
                                                                                updateApplication({
                                                                                    stage: step.stepNumber + 1, visa_decision: 'negative', progress: 4,status:1
                                                                                });
                                                                            }}
                                                                        >
                                                                            <X className="h-4 w-4 mr-2" />
                                                                            <span>Visa Rejected</span>
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                                
                                                            
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full sm:w-auto "
                                                                    onClick={() => setChatbotOpen(true)}
                                                                >
                                                                    <MessageSquare className="h-4 w-4 mr-2" />
                                                                    Need Help?
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )))}
                                            </div>

                                            {/* Alerts Area (Area A) - Only show alerts for current step */}
                                            <div className="lg:col-span-1 space-y-4 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                                                        <Bell className="h-5 w-5 text-blue-600" />
                                                        Important Information
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {visaSteps
                                                            .filter(step => userApplication?.stage === step.stepNumber)
                                                            .flatMap(step =>
                                                                step.alerts?.map((alert, index) => (
                                                                    <div
                                                                        key={`${step.id}-alert-${index}`}
                                                                        className={`p-4 rounded-md border ${alert.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                                                                            alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                                                                alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                                                                    'bg-blue-50 border-blue-200 text-blue-800'
                                                                            }`}
                                                                    >
                                                                        {alert.header && (
                                                                            <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                                                                                {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                                                                {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                                                                                {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                                                                {alert.type === 'info' && <InfoIcon className="h-4 w-4" />}
                                                                                {alert.header}
                                                                            </h4>
                                                                        )}
                                                                        <div className="flex items-start gap-2 mb-3">
                                                                            <div>
                                                                                <span>{alert.message}</span>
                                                                            </div>
                                                                        </div>
                                                                        {alert.button && (
                                                                            <Button
                                                                                variant={alert.button.type === 'success' ? 'default' : 'outline'}
                                                                                size="sm"
                                                                                className="mb-2"
                                                                                onClick={() => window.open(alert.buttonLink || alert.button.url, '_blank')}
                                                                            >
                                                                                {alert.button.label}
                                                                            </Button>
                                                                        )}
                                                                        {alert.footer && (
                                                                            <p className="text-xs mt-2 opacity-80">
                                                                                {alert.footer}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )) || []
                                                            )}
                                                        {visaSteps
                                                            .filter(step => userApplication?.stage === step.stepNumber)
                                                            .flatMap(step => step.alerts || []).length === 0 && (
                                                                <div className="text-center py-6 text-muted-foreground">
                                                                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                                                                    <p>No alerts for current step</p>
                                                                    <p className="text-xs mt-1">Complete this step to proceed</p>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>

                                                {/* Progress Summary */}
                                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-4">
                                                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                                                        <BarChart className="h-5 w-5 text-purple-600" />
                                                        Visa Progress
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Steps Completed</span>
                                                            <span className="font-medium">
                                                                {visaSteps.filter(s => (userApplication?.stage || 0) > s.stepNumber).length} of {visaSteps.length}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-muted rounded-full h-2">
                                                            <div
                                                                className="bg-primary h-2 rounded-full"
                                                                style={{
                                                                    width: `${visaSteps.length > 0 ? (visaSteps.filter(s => (userApplication?.stage || 0) > s.stepNumber).length / visaSteps.length) * 100 : 0}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-2">
                                                            Keep going! You're making great progress.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Layout - Stacked */}
                                        <div className="lg:hidden space-y-4">
                                            {visaSteps.length === 0 ? (
                                                <div className="text-center py-4 text-muted-foreground">
                                                    No visa steps available. Please check back later.
                                                </div>
                                            ) : (
                                                visaSteps.map((step) => (
                                                    <div key={step.id} className="border rounded-lg p-4 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-semibold flex items-center gap-2">
                                                                    Step {step.stepNumber}: {step.title}

                                                                    <Badge
                                                                        variant={
                                                                            userApplication?.stage === step.stepNumber ? 'secondary' :
                                                                                (userApplication?.stage || 0) > step.stepNumber ? 'default' : 'outline'
                                                                        }
                                                                    >
                                                                        {userApplication?.stage === step.stepNumber ? 'current' :
                                                                            (userApplication?.stage || 0) > step.stepNumber ? 'completed' : 'pending'}
                                                                    </Badge>
                                                                </h3>

                                                            </div>
                                                        </div>

                                                        {step.instructions.header && (
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium">{step.instructions.header}</h4>
                                                                {step.instructions.paragraphs?.map((paragraph, index) => (
                                                                    <p key={index} className="text-sm text-muted-foreground">{paragraph}</p>
                                                                ))}
                                                                {step.instructions.bulletPoints && step.instructions.bulletPoints.length > 0 && (
                                                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                                        {step.instructions.bulletPoints.map((point, index) => (
                                                                            <li key={index}>{point}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        )}

                                                        {step.type === 'document' && step.documents?.required?.length > 0 && (
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-sm">Required Documents:</h4>
                                                                <div className="space-y-2">
                                                                    {step.documents?.required?.map((doc) => (
                                                                        <label key={doc} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                                                                            <Checkbox
                                                                                id={`doc-${doc}`}
                                                                                checked={(step.documents?.uploaded || []).includes(doc)}
                                                                                onCheckedChange={async (checked) => {
                                                                                    try {
                                                                                        let updatedDocuments = [...(step.documents?.uploaded || [])];

                                                                                        if (checked) {
                                                                                            // Add document to visa_documents array if not already present
                                                                                            if (!updatedDocuments.includes(doc)) {
                                                                                                updatedDocuments = [...updatedDocuments, doc];
                                                                                            }
                                                                                        } else {
                                                                                            // Remove document from visa_documents array
                                                                                            updatedDocuments = updatedDocuments.filter((d: string) => d !== doc);
                                                                                        }


                                                                                        const currentDocuments = step.documents?.uploaded || [];

                                                                                        // Merge the current documents with our updated documents
                                                                                        const mergedDocuments = [...new Set([...currentDocuments, ...updatedDocuments])];

                                                                                        // Update the backend with the merged documents
                                                                                        const response = await updateApplication({
                                                                                            visa_documents: mergedDocuments
                                                                                        });

                                                                                        if (response) {
                                                                                            await fetchApplication(); // Refresh the application data
                                                                                        }
                                                                                    } catch (error) {
                                                                                        console.error('Error updating document status:', error);
                                                                                        toast.error('Failed to update document status. Please try again.');
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <span className="text-sm">{doc}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>

                                                            </div>
                                                        )}

                                                        {step.type === 'appointment' && (
                                                            <div className="space-y-4">
                                                                {step.appointmentDetails && step.appointmentDetails.date && step.appointmentDetails.time && step.appointmentDetails.location ? (
                                                                    // Display existing appointment details
                                                                    <div className="bg-muted/50 p-4 rounded-md space-y-2 border border-muted">
                                                                        <h4 className="font-medium text-base flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4" />
                                                                            Appointment Details
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                                            <div>
                                                                                <p className="text-muted-foreground">Location</p>
                                                                                <p className="font-medium">{step.appointmentDetails.location}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-muted-foreground">Date</p>
                                                                                <p className="font-medium">{step.appointmentDetails.date}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-muted-foreground">Time</p>
                                                                                <p className="font-medium">{formatTimeTo12Hour(step.appointmentDetails.time)}</p>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            variant="outline"
                                                                            className="mt-4 w-full"
                                                                            onClick={() => {
                                                                                // Clear appointment details and show form again

                                                                                // Prepare empty appointment details for this step
                                                                                const appointmentDetails = [];

                                                                                // Update the application with empty appointment details and reduce stage
                                                                                updateApplication({
                                                                                    visa_appointment_details: appointmentDetails,
                                                                                    stage: Math.max(1, step.stepNumber - 1)
                                                                                });


                                                                            }}
                                                                        >
                                                                            <Calendar className="h-4 w-4 mr-2" />
                                                                            Reschedule Appointment
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    // Show appointment request form if no details exist
                                                                    <div className="space-y-4">
                                                                        <h4 className="font-medium text-base flex items-center gap-2">
                                                                            <Calendar className="h-4 w-4" />
                                                                            Schedule Appointment
                                                                        </h4>

                                                                        <div className="space-y-4">
                                                                            <div className="space-y-2">
                                                                                <Label htmlFor={`mobile-appointment-date-${step.id}`}>Appointment Date</Label>
                                                                                <Input
                                                                                    id={`mobile-appointment-date-${step.id}`}
                                                                                    type="date"
                                                                                    className="w-full"
                                                                                    value={appointmentFormData[step.id]?.date || ''}
                                                                                    onChange={(e) => setAppointmentFormData(prev => ({
                                                                                        ...prev,
                                                                                        [step.id]: {
                                                                                            ...prev[step.id],
                                                                                            date: e.target.value
                                                                                        }
                                                                                    }))}
                                                                                />
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <Label htmlFor={`mobile-appointment-time-${step.id}`}>Appointment Time</Label>
                                                                                <Input
                                                                                    id={`mobile-appointment-time-${step.id}`}
                                                                                    type="time"
                                                                                    className="w-full"
                                                                                    value={appointmentFormData[step.id]?.time || ''}
                                                                                    onChange={(e) => setAppointmentFormData(prev => ({
                                                                                        ...prev,
                                                                                        [step.id]: {
                                                                                            ...prev[step.id],
                                                                                            time: e.target.value
                                                                                        }
                                                                                    }))}
                                                                                />
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <Label htmlFor={`mobile-appointment-location-${step.id}`}>Location</Label>
                                                                                <Input
                                                                                    id={`mobile-appointment-location-${step.id}`}
                                                                                    placeholder="Enter appointment location"
                                                                                    className="w-full"
                                                                                    value={appointmentFormData[step.id]?.location || ''}
                                                                                    onChange={(e) => setAppointmentFormData(prev => ({
                                                                                        ...prev,
                                                                                        [step.id]: {
                                                                                            ...prev[step.id],
                                                                                            location: e.target.value
                                                                                        }
                                                                                    }))}
                                                                                />
                                                                            </div>

                                                                            <div className="flex flex-col gap-2 pt-2">
                                                                                <Button
                                                                                    variant="default"
                                                                                    className="w-full"
                                                                                    onClick={() => {
                                                                                        // Handle form submission

                                                                                        const appointmentData = appointmentFormData[step.id];
                                                                                        if (!appointmentData?.date || !appointmentData?.time || !appointmentData?.location) {
                                                                                            toast.error('Please fill in all appointment details');
                                                                                            return;
                                                                                        }

                                                                                        // Prepare appointment details object
                                                                                        const appointmentDetails = {

                                                                                            date: appointmentData.date,
                                                                                            time: appointmentData.time,
                                                                                            location: appointmentData.location

                                                                                        };

                                                                                        // Update the application with the new appointment details
                                                                                        updateApplication({
                                                                                            visa_appointment_details: appointmentDetails,
                                                                                            stage: step.stepNumber + 1
                                                                                        } as any);


                                                                                    }}
                                                                                >
                                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                                    Schedule Appointment
                                                                                </Button>

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {step.alerts?.map((alert, index) => (
                                                            <div
                                                                key={index}
                                                                className={`p-4 rounded-md border ${alert.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                                                                    alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                                                        alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                                                            'bg-blue-50 border-blue-200 text-blue-800'
                                                                    }`}
                                                            >
                                                                {alert.header && (
                                                                    <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                                                                        {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                                                        {alert.type === 'error' && <XCircle className="h-4 w-4" />}
                                                                        {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                                                        {alert.type === 'info' && <InfoIcon className="h-4 w-4" />}
                                                                        {alert.header}
                                                                    </h4>
                                                                )}
                                                                <div className="flex items-start gap-2 mb-3">
                                                                    <div>
                                                                        <span>{alert.message}</span>
                                                                    </div>
                                                                </div>
                                                                {alert.button && (
                                                                    <Button
                                                                        variant={alert.button.type === 'success' ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        className="mb-2"
                                                                        onClick={() => window.open(alert.buttonLink || alert.button.url, '_blank')}
                                                                    >
                                                                        {alert.button.label}
                                                                    </Button>
                                                                )}
                                                                {alert.footer && (
                                                                    <p className="text-xs mt-2 opacity-80">
                                                                        {alert.footer}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}

                                                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                                                            {step.type === 'document' && step.documents?.required?.every(doc => step.documents?.uploaded?.includes(doc)) && userApplication?.stage === step.stepNumber && (
                                                                <Button
                                                                    variant="default"
                                                                    className="w-full sm:w-auto"
                                                                    onClick={() => {
                                                                        updateApplicationStage('stage', step.stepNumber + 1)
                                                                    }}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    <span>Proceed to Next Step</span>
                                                                </Button>
                                                            )}
                                                            {step.type === 'application' && userApplication?.stage === step.stepNumber && (
                                                                <Button
                                                                    variant="default"
                                                                    className="w-full sm:w-auto"
                                                                    onClick={() => {
                                                                        updateApplicationStage('stage', step.stepNumber + 1)
                                                                    }}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    <span>Proceed to Next Step</span>
                                                                </Button>
                                                            )}
                                                            {step.type === 'interview' && userApplication?.stage === step.stepNumber && (
                                                                <Button
                                                                    variant="default"
                                                                    className="w-full sm:w-auto"
                                                                    onClick={() => {
                                                                        updateApplicationStage('stage', step.stepNumber + 1)
                                                                    }}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    <span>Visa Interview Done</span>
                                                                </Button>
                                                            )}
                                                            {step.type === 'decision' && userApplication?.stage === step.stepNumber && (
                                                                <div className="flex flex-col sm:flex-row gap-3">
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full sm:w-auto"
                                                                        onClick={() => {
                                                                            updateApplication({
                                                                                stage: step.stepNumber + 1, visa_decision: 'positive', progress: 4,status:1
                                                                            });
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        <span>Visa Approved</span>
                                                                    </Button>
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full sm:w-auto"
                                                                        onClick={() => {
                                                                            updateApplication({
                                                                                stage: step.stepNumber + 1, visa_decision: 'negative',progress: 4,status:1
                                                                            });
                                                                        }}
                                                                    >
                                                                        <X className="h-4 w-4 mr-2" />
                                                                        <span>Visa Rejected</span>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            
                                                            {step.type === 'decision' && userApplication?.visa_decision && (
                                                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                        <span className="font-medium">Next Step:</span> Please go to the Documents section and upload your visa decision document.
                                                                    </p>
                                                                    <Button
                                                                        variant="default"
                                                                        className="w-full sm:w-auto mt-2"
                                                                        onClick={() => {
                                                                            navigate('/student/documents');
                                                                        }}
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        <span>Documents</span>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                className="w-full sm:w-auto"
                                                                onClick={() => setChatbotOpen(true)}
                                                            >
                                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                                Need Help?
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )))}
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                                            {/* Video Button - Full width on mobile, half on desktop */}
                                            <div className="border rounded-lg p-4 flex flex-col h-full">

                                                <div className="mb-4">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                        <Youtube className="h-5 w-5" />
                                                        Visa Application Guide
                                                    </h3>
                                                    <p className="text-muted-foreground mt-2">
                                                        Watch our video guide to learn how to prepare your documents and submit visa application.
                                                    </p>
                                                </div>
                                                <div className="mt-auto">
                                                    <Button
                                                        onClick={() => openVideoModal("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "Visa Application Guide")}
                                                        className="w-full flex items-center justify-center gap-2"
                                                        variant="outline"
                                                    >
                                                        <Youtube className="h-5 w-5 text-red-500" />
                                                        Watch Visa Application Guide
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Interview Preparation - Full width on mobile, half on desktop */}
                                            <div className="border rounded-lg p-4 flex flex-col h-full">
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                        <MessageSquare className="h-5 w-5" />
                                                        Visa Interview Preparation
                                                    </h3>
                                                    <p className="text-muted-foreground mt-2">
                                                        Practice your visa interview with our AI-powered mock interview system. Get personalized feedback and improve your confidence.
                                                    </p>
                                                </div>
                                                <div className="mt-auto">
                                                    <Button
                                                        onClick={() => setShowVisaInfoModal(true)}
                                                        className="w-full flex items-center justify-center gap-2"
                                                    >
                                                        <MessageSquare className="h-4 w-4" />
                                                        Try Mock Visa Interview
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Mock Visa Interview */}

                            </div>
                        </TabsContent>

                        {/* Activity Log Tab */}
                        <TabsContent value="activity" className="p-6 space-y-6 flex flex-col h-full">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Activity Log</h3>
                                <Badge variant="outline">{userApplication?.activityLogs?.length || 0} activities</Badge>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                                {allActivityLogs && allActivityLogs.length > 0 ? (
                                    <div className="space-y-6">
                                        {(() => {
                                            // Group activities by date
                                            const grouped: Record<string, any[]> = {};
                                            allActivityLogs?.forEach((activity: any) => {
                                                const date = new Date(activity.created_at).toLocaleDateString();
                                                if (!grouped[date]) {
                                                    grouped[date] = [];
                                                }
                                                grouped[date].push(activity);
                                            });

                                            // Function to get icon based on activity type
                                            const getActivityIcon = (type: string) => {
                                                switch (type) {
                                                    case 'program':
                                                        return <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5" />;
                                                    case 'document':
                                                        return <FileText className="h-4 w-4 text-green-500 mt-0.5" />;
                                                    case 'payment':
                                                        return <CreditCard className="h-4 w-4 text-purple-500 mt-0.5" />;
                                                    case 'admission':
                                                        return <Award className="h-4 w-4 text-yellow-500 mt-0.5" />;
                                                    case 'user':
                                                        return <User className="h-4 w-4 text-indigo-500 mt-0.5" />;
                                                    default:
                                                        return <Activity className="h-4 w-4 text-gray-500 mt-0.5" />;
                                                }
                                            };

                                            return Object.entries(grouped)
                                                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                                                .map(([date, dayActivities]) => (
                                                    <div key={date}>
                                                        <h4 className="font-medium text-gray-700 mb-3">{date}</h4>
                                                        <div className="space-y-2">
                                                            {dayActivities.map((activity: any) => (
                                                                <Card key={activity.id} className="p-4">
                                                                    <div className="flex items-start gap-3">
                                                                        {getActivityIcon(activity.type)}
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-medium">{activity.activity}: '{activity.details}'</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <Badge variant="outline" className="text-xs capitalize">
                                                                                    {activity.type || 'activity'}
                                                                                </Badge>
                                                                                {activity.role && (
                                                                                    <Badge variant="outline" className="text-xs text-gray-500">
                                                                                        {activity.role}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-gray-400 mt-1">
                                                                                {new Date(activity.created_at).toLocaleTimeString()}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ));
                                        })()}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <Card className="w-full">
                                            <CardContent className="p-6 text-center">
                                                <Activity className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                                <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                                                <p className="text-gray-600">Your activities will appear here as you progress through your application.</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                            {hasMoreActivities && (
                                <div className="pt-2 border-t">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-primary hover:bg-transparent"
                                        onClick={loadMoreActivities}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                Load More Activities
                                                <ChevronDown className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Floating Footer Menu */}
            <div className="fixed bottom-6 right-6 z-40">
                <div className="flex flex-col gap-2">
                    <Button
                        onClick={() => setChatbotOpen(true)}
                        className="rounded-full h-12 w-12 p-0 shadow-lg"
                        variant="default"
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <ChatbotModal
                isOpen={chatbotOpen}
                onClose={() => setChatbotOpen(false)}
            />

            <VideoModal
                isOpen={videoModalOpen}
                onClose={() => setVideoModalOpen(false)}
                videoUrl={currentVideoUrl}
                title={currentVideoTitle}
            />

            <FileManagerModal
                isOpen={fileManagerOpen}
                onClose={() => setFileManagerOpen(false)}
                title="Upload Documents"
                userDocuments={userApplication?.userDocuments || []}
                selectedPrograms={applicationSteps.find(s => s.id === currentStepId)?.programSettings?.selectedPrograms?.map(Number) || []}
                onFileSelect={(file) => {
                    console.log('Selected file:', file);
                    setFileManagerOpen(false);
                }}
            />

            <ProgramSelectionModal
                isOpen={programSelectionOpen}
                onClose={() => setProgramSelectionOpen(false)}
                onProgramSelect={async (program) => {
                    await addProgram(currentStepId, program);
                }}
                recommendedPrograms={userApplication?.recommendedPrograms || []}
                selectedPrograms={applicationSteps.find(s => s.id === currentStepId)?.programSettings?.selectedPrograms || []}
                maxPrograms={applicationSteps.find(s => s.id === currentStepId)?.programSettings?.maxPrograms || 8}
            />

            {/* Visa Info Modal */}
            <VisaInfoModal
                isOpen={showVisaInfoModal}
                onClose={() => setShowVisaInfoModal(false)}
            />
        </div>
    );
};

export default ManageApplication;
