import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Calendar, 
  Clock,
  X,
  ChevronDown,
  GraduationCap,
  Building,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Program {
  id: number;
  title?: string;
  university: string;
  city: string;
  country: string;
  degree: string;
  program_name: string;
  field: string;
  matchPercentage: number;
  matchingKeywords: Record<string, string>;
  duration: string;
  first_tuition: string;
  total_tuition: string;
  program_start_date: string;
  currency: string;
  deadline: string;
  language: string;
  image: string;
  level: string;
  end_date: string;
  start_date: string;
  application_type: string;
  application_period_from: string;
  application_period_to: string;
  application_portal: string;
  study_destination_id: number;
  application_exist: string;
  requirements: Array<{
    name: string;
    tag: string;
    instruction: string | null;
  }>;
  specific_requirements: Array<{
    name: string;
    tag: string;
    instruction: string | null;
  }>;
}

interface ProgramSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgramSelect: (program: Program) => void;
  recommendedPrograms: Program[];
  selectedPrograms: number[];
  maxPrograms: number;
}

const ProgramSelectionModal: React.FC<ProgramSelectionModalProps> = ({
  isOpen,
  onClose,
  onProgramSelect,
  recommendedPrograms,
  selectedPrograms,
  maxPrograms
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  // Use recommended programs from API directly
  const programs = recommendedPrograms || [];

  const [loadingProgramId, setLoadingProgramId] = useState<number | null>(null);

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || program.level.toLowerCase() === filterType;
    const matchesLocation = filterLocation === 'all' || program.city === filterLocation;
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const uniqueLocations = [...new Set(programs.map(p => p.city))];

  if (!isOpen) return null;

 
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl mx-4 bg-white rounded-t-xl sm:rounded-xl shadow-2xl transform transition-all duration-300 ease-out animate-slide-in-right max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ChevronDown className="h-6 w-6 text-gray-400" />
            <div>
              <h2 className="text-xl font-semibold">Select Programs</h2>
              <p className="text-sm text-gray-500">
                {selectedPrograms.length} of {maxPrograms} programs selected
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Instruction */}
        <div className="px-6 pt-3 pb-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm flex items-center gap-2">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hand-pointer"><path d="M7 11.5V7a2 2 0 1 1 4 0v4.5"/><path d="M7 11.5a2 2 0 1 1 4 0"/><path d="M12 13.5V17a2 2 0 0 1-4 0v-3.5"/><path d="M12 13.5a2 2 0 1 1-4 0"/><path d="M12 13.5V7a2 2 0 1 0-4 0v6.5"/></svg>
            Click a program card to add it to your application.
          </div>
        </div>

        {/* Filters */}
        {/* <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Program Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="masters">Masters</SelectItem>
                <SelectItem value="bachelors">Bachelors</SelectItem>
                <SelectItem value="phd">PhD</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div> */}

        {/* Programs Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPrograms.map((program) => {
              const isSelected = selectedPrograms.includes(program.id);
              const canSelect = selectedPrograms.length < maxPrograms || isSelected;
              
              return (
                <Card 
                  key={program.id}
                  className={`transition-all hover:shadow-md cursor-pointer relative ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 
                    !canSelect ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200'
                  } ${loadingProgramId === program.id ? 'opacity-60 pointer-events-none' : ''}`}
                  onClick={async () => {
                    if (canSelect && loadingProgramId !== program.id) {
                      setLoadingProgramId(program.id);
                      await onProgramSelect(program);
                      setLoadingProgramId(null);
                    }
                  }}
                >
                  {loadingProgramId === program.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <p className="text-sm text-gray-600 font-medium">Updating...</p>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-2">{program.program_name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{program.university}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 text-green-600 fill-current" />
                          <span className="text-xs font-medium text-green-700">{program.matchPercentage}% match</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{program.city}, {program.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{program.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{program.program_start_date || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span className="capitalize">{program.level}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-2">{program.degree}</p>

                      {/* Requirements */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Document Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {program.requirements.slice(0, 5).map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req.name}
                              </Badge>
                            ))}
                            {program.requirements.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{program.requirements.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Document Requirements */}
                        <div className="space-y-2">
                          <div 
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900"
                            onClick={(e) => {
                              e.stopPropagation();
                              const details = document.getElementById(`doc-requirements-${program.id}`);
                              if (details) {
                                details.classList.toggle('hidden');
                              }
                            }}
                          >
                            <span>Specific Requirements</span>
                            <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                          </div>
                          <div id={`doc-requirements-${program.id}`} className="hidden space-y-2 pl-1">
                            {program.specific_requirements.length > 0 ? (
                              <ul className="space-y-2 text-xs text-gray-600">
                                {program.specific_requirements.map((req, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <div>
                                      <span className="font-medium">{req.name}</span>
                                      {req.instruction && (
                                        <p className="text-gray-500 text-xs mt-0.5">{req.instruction}</p>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-gray-500">No specific document requirements listed.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-sm font-medium">Tuition Fees</p>
                          <p className="text-xs text-red-500 font-medium">First: {program.currency} {program.first_tuition}</p>
                          <p className="text-xs text-red-500 font-medium">Total: {program.currency} {program.total_tuition}</p>
                        </div>
                        <div className="text-right">
                          {/* <p className="text-xs text-red-600 font-medium">Lectures start: {program.program_start_date}</p> */}
                          {isSelected ? (
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-6 px-2 text-xs flex items-center gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (loadingProgramId !== program.id) {
                                  setLoadingProgramId(program.id);
                                  // Use onProgramSelect for toggle behavior
                                  Promise.resolve(onProgramSelect(program)).then(() => {
                                    setLoadingProgramId(null);
                                  }).catch(() => {
                                    setLoadingProgramId(null);
                                  });
                                }
                              }}
                              disabled={loadingProgramId === program.id}
                            >
                              <Minus className="h-3 w-3" />
                              Remove
                            </Button>
                          ) : (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs mt-1 flex items-center gap-1">
                              <Plus className="h-3 w-3" />
                              Add
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selectedPrograms.length} of {maxPrograms} programs selected
          </span>
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgramSelectionModal;