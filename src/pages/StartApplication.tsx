import { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, BookOpen, Award, ArrowRight, Filter, Search, GraduationCap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCurrencyForCountry } from '@/lib/utils';
import { ApplicationTermsModal } from '@/components/ApplicationTermsModal';
import { toast } from 'sonner';

const userId = document.getElementById('root')?.getAttribute('data-user-id') || '63';


interface Program {
  id: number;
  title: string;
  university: string;
  country: string;
  degree: string;
  field: string;
  program_name: string;
  matchPercentage: number;
  matchingKeywords: string[] | { [key: string]: string };
  duration: string;
  first_tuition: string;
  total_tuition: string;
  currency: string;
  original_currency: string;
  original_first_tuition: number;
  original_total_tuition: number;
  deadline: string;
  language: string;
  image?: string;
  city: string;
  converted_first_tuition?: string;
  converted_total_tuition?: string;
  converted_currency?: string;
  level: string;
  end_date: string;
  application_type: string;
  application_period_to: string;
  application_period_from: string;
  start_date: string;
  study_destination_id: number;
  application_exist: string;
}

interface StudyDestination {
  id: number;
  name: string;
  flag: string;
  image: string;
  status: number;
  study_period: string;
  application_period_from: string;
  application_period_to: string;
  application_type: string;
  max_program: number;
  programs_count?: number;
  destination_exist: string;
  applicationId: string;
  trx: string;
  profileId: string;
  degree: string;
  progress?: number | null;
}


// Enhanced ProgramCard component with better visual hierarchy and information display
const ProgramCard = ({ program, showLocalCurrency }: { program: Program, showLocalCurrency: boolean }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Extract query parameters from URL
  const profileID = searchParams.get('profileID') || '';
  const degree = searchParams.get('Degree') || '';
  const field = searchParams.get('Field') || '';
  const desiredFields = searchParams.getAll('desiredFields[]') || [];
  const country = searchParams.get('country') || '';
  //Terms and condition
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  //terms and condition
  const handleDestinationClick = (destination: any, programId: any) => {
    setSelectedDestination(destination);
    setSelectedProgramId(programId);
    console.log("destination.id/programId", destination, programId);
    setIsTermsOpen(true);
  };
  const handleAgree = async () => {
    if (!selectedDestination) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('https://uniplanr.com/api/v1/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileID,
          user_id: userId,
          study_destination_id: selectedDestination,
          selected_programs: selectedProgramId,
        })
      });

      const responseData = await response.json();
      console.log("responseData", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit application');
      }
      toast.success('Application started');
      navigate(`/student/start-application-p2?trx=${responseData.trx}&studyDestination=${encodeURIComponent(responseData.study_destination)}&degree=${encodeURIComponent(responseData.degree)}&profileId=${responseData.profile_id}&ID=${responseData.id}`);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsTermsOpen(false);
    }
  };
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'from-green-500 to-emerald-600';
    if (percentage >= 75) return 'from-blue-500 to-cyan-600';
    if (percentage >= 60) return 'from-yellow-500 to-amber-600';
    return 'from-gray-500 to-gray-600';
  };

  // Get the image URL, fallback to empty string if not provided
  const imageUrl = program.image ?
    `${import.meta.env.VITE_API_BASE_URL || ''}/site-data/${program.image}` :
    null;

  // Convert matchingKeywords to array if it's an object
  const matchingKeywords = Array.isArray(program.matchingKeywords)
    ? program.matchingKeywords
    : program.matchingKeywords
      ? Object.values(program.matchingKeywords)
      : [];

  // Format the tuition values based on the currency
  const formatTuition = (amount: string, convertedAmount?: string) => {
    if (showLocalCurrency && convertedAmount) {
      // Format only the converted amount with thousand separators
      const numericValue = parseFloat(convertedAmount);
      if (!isNaN(numericValue)) {
        return `${program.converted_currency} ${numericValue.toLocaleString('en-US', {
          maximumFractionDigits: 0,
          minimumFractionDigits: 0,
          useGrouping: true
        })}`;
      }
    }
    // Return original amount as is (it should already be formatted)
    return `${program.currency} ${amount}`;
  };

  return (
    <div className="group h-full flex flex-col overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200">
      {/* University and Match Badge */}
      <div
        className="relative h-32 bg-cover bg-center"
        style={imageUrl ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageUrl})`
        } : { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getMatchColor(program.matchPercentage)} shadow-md`}>
            {program.matchPercentage}% Match
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h6
            className="text-white font-bold text-lg truncate"
            title={program.program_name}
          >
            {program.program_name}
          </h6>
          <p className="text-white/90 text-sm truncate">
            {program.university}
          </p>
        </div>
      </div>

      {/* Program Details */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Basic Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{program.city} • {program.country}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            <span>{program.field}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="h-4 w-4 flex-shrink-0" />
            <span>{program.degree}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{program.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {program.application_type === 'single_portal' && program.application_period_from && program.application_period_to ? (
              <span>
                {new Date(program.application_period_from).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(program.application_period_to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : (
              <span>
                {new Date(program.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(program.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Matching Keywords */}
        <div className="mt-2 mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-1">
            {matchingKeywords.length ? 'MATCHING YOUR PROFILE' : 'NO MATCHING KEYWORDS'}
          </h4>
          {matchingKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {matchingKeywords.slice(0, 4).map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  title={keyword}
                >
                  {keyword}
                </span>
              ))}
              {matchingKeywords.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  +{matchingKeywords.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">No matching keywords found for this program</div>
          )}
        </div>

        {/* Tuition and Deadline */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center gap-2">
              <div className="font-medium text-gray-900 whitespace-nowrap overflow-visible flex items-baseline gap-1.5">
                <span className="text-sm font-normal text-gray-500">First:</span>
                <span className="text-base font-semibold">
                  {formatTuition(program.first_tuition, program.converted_first_tuition)}
                </span>
              </div>
              <div className="text-gray-500 whitespace-nowrap flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {program.level.toLowerCase()}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center gap-2">
              {program.total_tuition && (
                <div className="text-xs text-gray-500">
                  <span>Total: {formatTuition(program.total_tuition, program.converted_total_tuition)} </span>
                  {showLocalCurrency && program.converted_currency && (
                    <span className="text-xs text-gray-400">
                      (≈ {program.currency} {program.total_tuition} )
                    </span>
                  )}
                </div>
              )}
              {/* Application Status */}
              {(program.end_date || program.application_period_to) && (
                <div className="flex items-center gap-1.5 text-xs">
                  {program.application_type === 'single_portal' && program.application_period_to ? (
                    <>
                      <span className={`inline-block w-2 h-2 rounded-full ${new Date(program.application_period_to) >= new Date() ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-gray-600">
                        {new Date(program.application_period_to) >= new Date() ? 'Application Open' : 'Application Closed'}
                      </span>
                    </>
                  ) : program.end_date ? (
                    <>
                      <span className={`inline-block w-2 h-2 rounded-full ${new Date(program.end_date) >= new Date() ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-gray-600">
                        {new Date(program.end_date) >= new Date() ? 'Application Open' : 'Application Closed'}
                      </span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {program.application_type === 'multiple_portal' ? (
        (new Date(program.end_date) >= new Date() ? (
          <div className="px-4 pb-4">
            {program.application_exist === 'no' ? (
              <Button onClick={() => handleDestinationClick(program.study_destination_id, program.id)} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-[1.02]">
                Start Application
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button onClick={() => {
                const programName = encodeURIComponent(program.program_name || program.title || '');
                window.open(`/pages/program-details/programs?id=${program.id}&param1=${programName}`, '_blank');
              }} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-[1.02]">
                Program Added to Application 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>) :
          <div className="px-4 pb-4">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-[1.02]"
              onClick={() => {
                const programName = encodeURIComponent(program.program_name || program.title || '');
                window.open(`/pages/program-details/programs?id=${program.id}&param1=${programName}`, '_blank');
              }}
            >
              View Program Details  
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>)
      ) : (
        <div className="px-4 pb-4">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-[1.02]"
          onClick={() => {
            const programName = encodeURIComponent(program.program_name || program.title || '');
            window.open(`/pages/program-details/programs?id=${program.id}&param1=${programName}`, '_blank');
          }}>
            View Program Details 
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      )}
      {selectedDestination && (
        <ApplicationTermsModal
          isOpen={isTermsOpen}
          onClose={() => {
            setIsTermsOpen(false);
            setSelectedDestination(null);
          }}
          onAgree={handleAgree}
          isSubmitting={isSubmitting}
        />
      )}
    </div>

  );
};

const StartApplication = () => {

  const [programs, setPrograms] = useState<Program[]>([]);
  const [countries, setCountries] = useState<StudyDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    degree: '',
    match: '0',
    sortBy: 'match' as 'match' | 'deadline' | 'tuition-asc' | 'tuition-desc'
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Extract query parameters from URL
  const profileID = searchParams.get('profileID') || 13;
  const degree = searchParams.get('Degree') || '';
  const field = searchParams.get('Field') || '';
  const desiredFields = searchParams.getAll('desiredFields[]') || [];
  const country = searchParams.get('country') || '';
  //Terms and condition
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  //terms and condition
  const handleDestinationClick = (destination: any) => {
    setSelectedDestination(destination);
    console.log("destination.id", destination);
    setIsTermsOpen(true);
  };
  const handleAgree = async () => {
    if (!selectedDestination) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('https://uniplanr.com/api/v1/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileID,
          user_id: userId,
          study_destination_id: selectedDestination,
        })
      });

      const responseData = await response.json();
      console.log("responseData", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit application');
      }
      toast.success('Application started');
      navigate(`/student/start-application-p2?trx=${responseData.trx}&studyDestination=${encodeURIComponent(responseData.study_destination)}&degree=${encodeURIComponent(responseData.degree)}&profileId=${responseData.profile_id}&ID=${responseData.id}`);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsTermsOpen(false);
    }
  };
  const [showLocalCurrency, setShowLocalCurrency] = useState(false);
  const [localCurrency, setLocalCurrency] = useState('SEK'); // Default to USD
  const [conversionRate, setConversionRate] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const hasProcessedPrograms = useRef(false);



  // Check for toast error message from Laravel session on component mount
  useEffect(() => {
    const rootElement = document.getElementById('root');
    const toastError = rootElement?.getAttribute('data-toast-error');
    const toastSuccess = rootElement?.getAttribute('data-toast-success');

    if (toastError && toastError.trim() !== '') {
      toast.error(toastError);
      // Clear the attribute after showing the toast
      rootElement?.removeAttribute('data-toast-error');
    }
    if (toastSuccess && toastSuccess.trim() !== '') {
      toast.success(toastSuccess);
      // Clear the attribute after showing the toast
      rootElement?.removeAttribute('data-toast-success');
    }
  }, []);

  // Fetch recommended programs for the student profile
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!profileID) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`https://uniplanr.com/api/v1/recommended-programs/${profileID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched programs with keywords:', data.data?.map((p: any) => ({
          id: p.id,
          title: p.title,
          matchingKeywords: p.matchingKeywords,
          hasKeywords: !!p.matchingKeywords?.length
        })));
        setPrograms(data.data || []);
      } catch (error) {
        console.error('Error fetching recommended programs:', error);
        // Optionally set an error state here to show to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [profileID]);

  // Fetch study destinations from Laravel API
  useEffect(() => {
    const fetchStudyDestinations = async () => {
      setIsLoadingCountries(true);
      try {
        const response = await fetch(`https://uniplanr.com/api/v1/study-destinations/${userId}`, {
          method: 'GET', 
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }, 
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched study destinations:', data);

        // Transform the data to match the StudyDestination interface
        // Handle the new API response structure with 'destination' key
        const destinationsData = Array.isArray(data) ? data : (data.destination || data.destinations || data.data || []);
        const transformedCountries = destinationsData.map((destination: any) => ({
          id: destination.id,
          name: destination.name,
          flag: destination.flag || '🏳️',
          image: destination.image || '',
          status: destination.status || 0,
          study_period: destination.study_period || '',
          application_period_from: destination.application_period_from || '',
          application_period_to: destination.application_period_to || '',
          application_type: destination.application_type || '',
          max_program: destination.max_program || 0,
          programs_count: destination.programs_count || 0,
          destination_exist: data.destination_exist || 'no', 
          applicationId: data.applicationId || null,
          trx: data.trx || null,
          profileId: data.profileId || null,
          degree: data.degree || null,
          progress: data.progress || null,
        }));
        console.log('Transformed study destinations:', transformedCountries);
        setCountries(transformedCountries);

      } catch (error) {
        console.error('Error fetching study destinations:', error);
        setCountries([]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchStudyDestinations();
  }, []);

  // Fetch student's local currency based on origin country
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await fetch(`https://uniplanr.com/api/v1/student-profile/${profileID}`);
        const data = await response.json();
        if (data?.origin_country) {
          // You'll need to implement this mapping based on your countries table
          const currency = await getCurrencyForCountry(data.origin_country);
          console.log('Currency:', currency);
          setLocalCurrency(currency);
        }
        console.log('Student profile:', data);
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    };

    fetchStudentProfile();
    console.log('Student profile okat:', fetchStudentProfile());
  }, [profileID]);

  // Convert currency when toggle changes or programs update
  useEffect(() => {
    // Skip if we've already processed these programs or no programs to process
    if (hasProcessedPrograms.current || programs.length === 0) {
      return;
    }

    const convertCurrencies = async () => {
      console.log('Currency conversion triggered. Show local currency:', showLocalCurrency);

      if (!showLocalCurrency) {
        console.log('Resetting currency conversion');
        setConversionRate(1);
        // Only update if we actually need to clear the converted values
        setPrograms(prevPrograms => {
          const needsUpdate = prevPrograms.some(p =>
            p.converted_first_tuition !== undefined ||
            p.converted_total_tuition !== undefined ||
            p.converted_currency !== undefined
          );

          if (!needsUpdate) return prevPrograms;

          return prevPrograms.map(program => ({
            ...program,
            converted_first_tuition: undefined,
            converted_total_tuition: undefined,
            converted_currency: undefined
          }));
        });
        hasProcessedPrograms.current = false;
        return;
      }

      console.log('Starting currency conversion to:', localCurrency);
      setIsConverting(true);

      try {
        const uniqueCurrencies = Array.from(new Set(programs
          .map(p => p.currency)
          .filter(Boolean)
        ));

        console.log('Unique currencies to convert:', uniqueCurrencies);

        const conversionPromises = uniqueCurrencies.map(async (baseCurrency) => {
          if (!baseCurrency || baseCurrency === localCurrency) {
            return { base: baseCurrency, rate: 1 };
          }

          console.log(`Fetching conversion rate for ${baseCurrency} to ${localCurrency}`);

          try {
            const response = await fetch(
              `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
            );

            if (!response.ok) {
              throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const rate = data.rates?.[localCurrency];

            if (!rate) {
              console.warn(`No conversion rate found for ${baseCurrency} to ${localCurrency}`);
              return { base: baseCurrency, rate: 1 };
            }

            console.log(`Conversion rate for ${baseCurrency} to ${localCurrency}:`, rate);
            return { base: baseCurrency, rate };
          } catch (error) {
            console.error(`Error fetching rates for ${baseCurrency}:`, error);
            return { base: baseCurrency, rate: 1, error: true };
          }
        });

        const results = await Promise.all(conversionPromises);
        const rates = results.reduce((acc, result) => {
          if (result?.base) {
            acc[result.base] = result.rate;
          }
          return acc;
        }, {} as Record<string, number>);

        console.log('All conversion rates:', rates);

        // Only update programs if we're still supposed to be showing local currency
        // and if the rates have changed
        setPrograms(prevPrograms => {
          const newPrograms = prevPrograms.map(program => {
            const rate = rates[program.currency] || 1;
            const firstTuition = parseFloat(program.first_tuition.replace(/[^0-9.-]+/g, ''));
            const totalTuition = parseFloat(program.total_tuition.replace(/[^0-9.-]+/g, ''));

            const convertedFirst = (firstTuition * rate).toFixed(2);
            const convertedTotal = (totalTuition * rate).toFixed(2);

            // Only update if values have actually changed
            if (program.converted_first_tuition === convertedFirst &&
              program.converted_total_tuition === convertedTotal &&
              program.converted_currency === localCurrency) {
              return program;
            }

            return {
              ...program,
              converted_first_tuition: convertedFirst,
              converted_total_tuition: convertedTotal,
              converted_currency: localCurrency
            };
          });

          // Mark that we've processed these programs
          hasProcessedPrograms.current = true;
          return newPrograms;
        });

        console.log('Currency conversion completed successfully');
      } catch (error) {
        console.error('Error during currency conversion:', error);
      } finally {
        setIsConverting(false);
      }
    };

    convertCurrencies();

    // Reset the ref when showLocalCurrency changes
    return () => {
      hasProcessedPrograms.current = false;
    };
  }, [showLocalCurrency, localCurrency]); // Removed programs from dependencies

  const filteredPrograms = programs.filter(program => {
    const searchLower = searchQuery.toLowerCase();
    const programTitle = program.title || '';
    const programUniversity = program.university || '';

    const matchesSearch = programTitle.toLowerCase().includes(searchLower) ||
      programUniversity.toLowerCase().includes(searchLower);
    const matchesCountry = !filters.country || program.country === filters.country;
    const matchesDegree = !filters.degree || program.degree === filters.degree;
    const matchesPercentage = program.matchPercentage >= parseInt(filters.match || '0');

    return matchesSearch && matchesCountry && matchesDegree && matchesPercentage;
  });

  const getMatchColor = (percentage: number) => {
    if (percentage >= 60) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Recommended Programs</h1>
          <p className="mt-2 text-gray-600">
            Based on your academic background and preferences, we've found the best matching programs for you.
          </p>
          {profileID && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Profile Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><strong>Profile ID:</strong> {profileID}</div>
                <div><strong>Degree:</strong> {degree}</div>
                <div><strong>Field:</strong> {field}</div>
                <div><strong>Country:</strong> {country}</div>
                {desiredFields.length > 0 && (
                  <div className="col-span-2 md:col-span-4">
                    <strong>Desired Fields:</strong> {desiredFields.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Study Destinations Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Study Destinations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing study opportunities around the world. Each destination offers unique programs and experiences.
            </p>
          </div>

          {isLoadingCountries ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : countries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countries.map((destination) => (
                <div
                  key={destination.id}
                  className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${destination.status === 0
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-2xl'
                    }`}

                >
                  {/* Background Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {destination.image && (
                      <img
                        src={`/site-data/study_destinations/${destination.image}`}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30" />

                    {/* Status Badge */}
                    {destination.status === 0 && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Coming Soon
                      </div>
                    )}

                    {/* Country Flag and Name */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center space-x-3">
                        <span className="text-4xl">{destination.flag}</span>
                        <div>
                          <h3 className="text-2xl font-bold">{destination.name}</h3>
                          <p className="text-sm opacity-90">
                            {filteredPrograms.length || 0} programs recommended
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 bg-white">
                    {destination.status === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium">Applications opening soon!</p>
                        <p className="text-sm text-gray-500 mt-1">Stay tuned for updates</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Study Period */}
                        {destination.study_period && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span className="text-sm text-gray-600">Study Period:</span>
                            <span className="text-sm font-semibold text-gray-800">{destination.study_period}</span>
                          </div>
                        )}

                        {/* Application Period */}
                        {destination.application_period_from && destination.application_period_to && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-1">
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-semibold text-green-800">Application Period</span>
                            </div>
                            <p className="text-xs text-green-700">
                              {new Date(destination.application_period_from).toLocaleDateString()} - {new Date(destination.application_period_to).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {/* Application Type */}
                        {destination.application_type && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm text-gray-600">Application Type:</span>
                            </div>
                            <span className="text-sm font-semibold text-purple-600 capitalize">
                              {destination.application_type.replace('_', ' ')}
                            </span>
                          </div>
                        )}

                        {/* Max Programs */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800">Max Programs per Application:</span>
                            <span className="text-lg font-bold text-blue-600">
                              {!destination.max_program || destination.max_program <= 1 ? 'Multiple' : destination.max_program}
                            </span>
                          </div>
                          {destination.application_type === 'single_portal' && (
                            <p className="text-xs text-blue-600 mt-1">
                              Apply to {destination.name} universities through a single unified portal. You can apply to up to {destination.max_program} programs in one application.
                            </p>
                          )}
                          {destination.application_type === 'multiple_portal' && (
                            <p className="text-xs text-blue-600 mt-1">
                              Each university in {destination.name} has its own application portal. You'll need to apply separately to each institution.
                            </p>
                          )}
                        </div>


                        {/* Action Button */}
                        {/* For single portal, open application journey in a new tab */}
                        {destination.application_type === 'single_portal' && (
                          destination.destination_exist === 'no' ? (
                            <button  
                              onClick={() => handleDestinationClick(destination.id)}
                              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                            >
                              Start Application
                              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (destination.progress === null || destination.progress === 0) {
                                  navigate(`/student/start-application-p2?trx=${destination.trx}&studyDestination=${encodeURIComponent(destination.name)}&degree=${encodeURIComponent(destination.degree)}&profileId=${destination.profileId}&ID=${destination.applicationId}`);
                                } else {
                                  navigate(`/student/manage-application?trx=${destination.trx}&studyDestination=${encodeURIComponent(destination.name)}&degree=${encodeURIComponent(destination.degree)}&profileId=${destination.profileId}&ID=${destination.applicationId}`);
                                }
                              }}
                              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                            >
                              {!destination.progress ? 'View Application' : 'Continue Application'}
                              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          )
                        )}

                        {/* For multiple portals, just apply the country filter */}
                        {destination.application_type === 'multiple_portal' && (
                          <button
                            onClick={() => {

                              // For multiple portals, just apply the country filter
                              setFilters({ ...filters, country: destination.name });
                              // Scroll to programs section
                              document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                          >
                            Explore Programs
                            <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No study destinations found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters to find more options.</p>
            </div>
          )}
        </section>

        {/* Recommended Programs Section */}
        <section className="mb-16" id="programs-section">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-3">
              Personalized Matches
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Recommended Programs For You</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've analyzed your profile and found programs that align with your academic background and career goals.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8 border border-gray-100">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search programs or universities..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                >
                  <option value="">All Countries</option>
                  {Array.from(new Set(programs.map(p => p.country))).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <select
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={filters.degree}
                  onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
                >
                  <option value="">All Degrees</option>
                  <option value="Bachelor's">Bachelor's</option>
                  <option value="Master's">Master's</option>
                  <option value="PhD">PhD</option>
                </select>
                <select
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={filters.match}
                  onChange={(e) => setFilters({ ...filters, match: e.target.value })}
                >
                  <option value="0">All Matches</option>
                  <option value="90">90%+ Match</option>
                  <option value="75">75%+ Match</option>
                  <option value="60">60%+ Match</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-500">Match strength:</span>
                {[
                  { label: 'Excellent', value: '60', color: 'from-green-500 to-emerald-600' },
                  { label: 'Good', value: '50', color: 'from-blue-500 to-cyan-600' },
                  { label: 'Fair', value: '40', color: 'from-yellow-500 to-amber-600' },
                  { label: 'Basic', value: '0', color: 'from-gray-400 to-gray-500' }
                ].map(({ label, value, color }) => (
                  <div key={value} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color} mr-1.5`}></div>
                    <span className="text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Label>Show in local currency</Label>
                <Switch
                  checked={showLocalCurrency}
                  onCheckedChange={setShowLocalCurrency}
                  disabled={isConverting}
                />
                {isConverting && <span className="text-xs text-gray-500">Converting...</span>}
              </div>
            </div>
          </div>

          {/* Programs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[420px] bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredPrograms.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Showing {filteredPrograms.length} {filteredPrograms.length === 1 ? 'program' : 'programs'}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Sort by:</span>
                  <select
                    className="border rounded-lg px-3 py-1.5 text-sm bg-white"
                    value={filters.sortBy || 'match'}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  >
                    <option value="match">Best Match</option>
                    <option value="deadline">Application Deadline</option>
                    <option value="tuition-asc">Tuition (Low to High)</option>
                    <option value="tuition-desc">Tuition (High to Low)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms
                  .sort((a, b) => {
                    if (filters.sortBy === 'deadline') {
                      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                    } else if (filters.sortBy === 'tuition-asc') {
                      return parseFloat(a.tuition.replace(/[^0-9.]/g, '')) - parseFloat(b.tuition.replace(/[^0-9.]/g, ''));
                    } else if (filters.sortBy === 'tuition-desc') {
                      return parseFloat(b.tuition.replace(/[^0-9.]/g, '')) - parseFloat(a.tuition.replace(/[^0-9.]/g, ''));
                    }
                    return b.matchPercentage - a.matchPercentage; // Default sort by match
                  })
                  .map((program) => (
                    <ProgramCard key={program.id} program={program} showLocalCurrency={showLocalCurrency} />
                  ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No programs match your filters</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters to find more options.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    country: '',
                    degree: '',
                    match: '0',
                    sortBy: 'match'
                  });
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </main>
      {selectedDestination && (
        <ApplicationTermsModal
          isOpen={isTermsOpen}
          onClose={() => {
            setIsTermsOpen(false);
            setSelectedDestination(null);
          }}
          onAgree={handleAgree}
          isSubmitting={isSubmitting}
        />
      )}
    </div>

  );
};



export default StartApplication;