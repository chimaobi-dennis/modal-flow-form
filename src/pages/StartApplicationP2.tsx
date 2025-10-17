import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, GraduationCap, Lightbulb } from "lucide-react";
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

const userId = document.getElementById('root')?.getAttribute('data-user-id') || '63';

const StartApplicationP2 = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const subscriptionPlans = [
    {
        id: 'self-directed',
        title: 'Guided Pathway',
        subtitle: 'Perfect for Independent Learners',
        price: 'FREE',
        priceAmount: 0,
        currency: 'SEK',
        description: 'Take control of your application journey with our comprehensive self-guided tools.',
        icon: Lightbulb,
        recommended: false,
        popular: false,
        features: [
            'Step-by-Step Checklist',
            'Self-Paced Learning',
            'Learn as You Go',
            'Regular Updates',
            'Basic Document Templates',
            'Application Timeline Tracker',
            'University Database Access',
            'Semantic Program Matching',
            'Email Support',
            'Can upgrade to premium at any time'
        ],
        buttonText: 'Start Free Journey',
        gradient: 'from-blue-600 to-blue-700',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
        id: 'premium',
        title: 'Premium Service',
        subtitle: 'Complete Success Package',
        price: '300',
        priceAmount: 300,
        currency: 'SEK',
        description: 'Get expert guidance and maximize your chances of admission success.',
        icon: GraduationCap,
        recommended: true,
        popular: true,
        features: [
            'One-Year Full Access Subscription',
            'AI-Powered Program Matching',
            'Personalized AI Program Matching with Explanations',
            'Contextual Program Ranking',
            'Expert Consultation (1-on-1)',
            'Enhanced Application Support',
            '98% Admission Success Rate',
            'Complete Document Reviews',
            'Priority Customer Support',
            'Scholarship Matching Service',
            'Visa Application Assistance',
            'All Free Features Included'             
        ],
        buttonText: 'Upgrade to Premium',
        gradient: 'from-gray-800 to-gray-900',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-900',
        borderColor: 'border-gray-200',
        buttonColor: 'bg-gray-900 hover:bg-gray-800'
    },
];

    const handlePathwaySelect = async (pathwayId: string) => {
        const plan = subscriptionPlans.find(p => p.id === pathwayId);
        if (!plan) return;

        if (pathwayId === 'self-directed') {
          try {
            const searchParams = new URLSearchParams(window.location.search);
            const applicationId = searchParams.get('ID');
            
            if (!applicationId) {
              throw new Error('Application ID not found in URL');
            }

            const response = await fetch(`https://uniplanr.com/api/v1/update-application/${applicationId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json',
              },
              body: JSON.stringify({
                progress: 1,
                track: 'self-service',
                payment_id: 'self-service',
                stage:1
              })
            });

            const result = await response.json();
            
            if (!response.ok) {
              const errorMessage = result.message || 'Failed to update application';
              throw new Error(errorMessage);
            }
            
            toast.success('Application started with guided pathway');
            navigate(`/student/manage-application?trx=${searchParams.get('trx')}&studyDestination=${searchParams.get('studyDestination')}&degree=${searchParams.get('degree')}&profileId=${searchParams.get('profileId')}&ID=${searchParams.get('ID')}`);
            
          } catch (error) {
            console.error('Error updating application:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(`Failed to update application: ${errorMessage}`);
          }
        } else if (pathwayId === 'premium') {
          toast.success(`Upgrading to ${plan.title}!`);
          toast.info('Redirecting to premium checkout...');
          setTimeout(() => {
            navigate('/premium-checkout');
          }, 2000);
        }
      };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Choose Your Success Plan
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        Unlock your potential with our tailored application pathways. From self-guided learning to premium expert support.
                    </p>
                </div>

                {/* Subscription Plans Grid */}
                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {subscriptionPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-lg shadow-sm border ${plan.borderColor} overflow-hidden transition-all duration-300 hover:shadow-md`}
                            onClick={() => handlePathwaySelect(plan.id)}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-gray-900 text-white px-4 py-1.5 text-xs font-medium tracking-wide">
                                    MOST POPULAR
                                </div>
                            )}

                            {/* Header */}
                            <div className={`${plan.bgColor} p-8`}>
                                <div className="flex items-center justify-between mb-4">
                                    <plan.icon className={`h-10 w-10 ${plan.textColor}`} />
                                    {plan.recommended && (
                                        <span className="bg-white bg-opacity-80 text-xs font-medium px-3 py-1 rounded-full border border-gray-200">
                                            Recommended
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.title}</h3>
                                <p className="text-gray-600">{plan.subtitle}</p>
                                <div className="mt-4">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {plan.priceAmount === 0 ? 'FREE' : `${plan.currency} ${plan.price}`}
                                    </span>
                                    {plan.priceAmount > 0 && (
                                        <span className="text-gray-500 ml-1">/yr</span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <p className="text-gray-600 mb-6">{plan.description}</p>
                                
                                {/* Features List */}
                                <div className="space-y-4 mb-8">
                                    <h4 className="font-medium text-gray-900 text-lg mb-4">What's Included:</h4>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CTA Button */}
                                <Button 
                                    className={`w-full py-3 font-medium rounded-md transition-colors ${plan.buttonColor} text-white`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePathwaySelect(plan.id);
                                    }}
                                >
                                    {plan.buttonText}
                                    <Rocket className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Features Section */}
                <section className="py-16 bg-white border-t border-gray-100">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
                            Our Key Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    title: 'Personalized Guidance',
                                    description: 'Receive tailored advice and support from our expert advisors.'
                                },
                                {
                                    title: 'Application Assistance',
                                    description: 'Get help with every step of your application, from essays to interviews.'
                                },
                                {
                                    title: 'Scholarship Matching',
                                    description: 'Find the perfect scholarships to fund your education abroad.'
                                },
                                {
                                    title: 'Visa Support',
                                    description: 'Navigate the visa application process with our comprehensive support.'
                                },
                                {
                                    title: 'Accommodation Finder',
                                    description: 'Find safe and comfortable housing options near your university.'
                                },
                                {
                                    title: 'Community Forum',
                                    description: 'Connect with other students and share your experiences.'
                                }
                            ].map((feature, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white p-6 rounded-lg border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all duration-200"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StartApplicationP2;
