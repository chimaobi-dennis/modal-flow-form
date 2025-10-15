import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, GraduationCap, Lightbulb } from "lucide-react";
import { toast } from 'sonner';

const PathwaySelection = () => {
  const navigate = useNavigate();

  const pathways = [
    {
      id: 'self-directed',
      title: 'Self-Directed Path',
      description: 'Explore universities and programs on your own with our resources.',
      icon: Rocket,
      recommended: false,
    },
    {
      id: 'premium',
      title: 'Premium Service',
      description: 'Get personalized guidance and support from our expert counselors.',
      icon: GraduationCap,
      recommended: true,
    },
    {
      id: 'guided',
      title: 'Guided Path (Coming Soon)',
      description: 'Follow a structured curriculum with milestones and deadlines.',
      icon: Lightbulb,
      recommended: false,
    },
  ];

  const universities = [
    {
      name: 'University of Oxford',
      country: 'United Kingdom',
    },
    {
      name: 'Stanford University',
      country: 'United States',
    },
    {
      name: 'Karolinska Institutet',
      country: 'Sweden',
    },
    {
      name: 'ETH Zurich',
      country: 'Switzerland',
    },
  ];

  const handlePathwaySelect = (pathwayId: string) => {
    const pathway = pathways.find(p => p.id === pathwayId);
    if (pathway) {
      toast.success(`Selected ${pathway.title} pathway`);
      toast.info('Redirecting to pathway details...');
      
      // Navigate based on pathway
      setTimeout(() => {
        switch (pathwayId) {
          case 'self-directed':
            navigate('/self-directed');
            break;
          case 'premium':
            navigate('/premium-service');
            break;
          case 'guided':
            toast.info('Guided pathway coming soon!');
            break;
          default:
            toast.error('Invalid pathway selection');
        }
      }, 1000);
    }
  };

  const handleUniversityClick = (universityName: string) => {
    toast.info(`${universityName} details coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Application Pathway
          </h2>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5">
            Select the pathway that best fits your needs and learning style. Each pathway offers a unique approach to guide you through the application process.
          </p>
        </div>

        {/* Pathways Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {pathways.map((pathway) => (
            <Card 
              key={pathway.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                pathway.recommended ? 'ring-2 ring-blue-500 border-blue-200' : ''
              }`}
              onClick={() => handlePathwaySelect(pathway.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <pathway.icon className="h-5 w-5" />
                  {pathway.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gray-500">
                  {pathway.description}
                </CardDescription>
                {pathway.recommended && (
                  <div className="mt-4">
                    <Button variant="default" size="sm" disabled>
                      Recommended
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Universities Section */}
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Explore Top Universities
          </h2>
          <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5">
            Discover some of the world's leading universities and start planning your academic journey.
          </p>

          <div className="mt-8 grid md:grid-cols-4 gap-6">
            {universities.map((university, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={() => handleUniversityClick(university.name)}>
                <CardContent className="p-4">
                  <CardTitle className="text-base font-medium">{university.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">{university.country}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathwaySelection;
