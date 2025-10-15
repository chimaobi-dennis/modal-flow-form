import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Crown,
  Shield,
  Users,
  TrendingUp,
  HeartHandshake,
  Headphones,
  FileCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Clock,
  Award,
  Zap,
  DollarSign,
  X
} from "lucide-react";

const PremiumService = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [canAgree, setCanAgree] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (termsScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsScrollRef.current;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 5;
      setCanAgree(scrolledToBottom);
    }
  };

  useEffect(() => {
    if (showTermsModal) {
      setCanAgree(false);
    }
  }, [showTermsModal]);

  const handlePayNow = () => {
    setShowTermsModal(true);
  };

  const handleAgreeAndContinue = () => {
    setShowTermsModal(false);
    // Proceed with payment logic here
    console.log("Proceeding with payment...");
  };

  const benefits = [
    {
      title: "One-Year Full Access Subscription",
      description: "Never miss an opportunity! Stay ahead of the competition with real-time notifications about upcoming application deadlines, new programs, and exclusive opportunities in Sweden tailored just for you for 365 days.",
      icon: Crown,
      highlight: true
    },
    {
      title: "Expert Consultation",
      description: "Enjoy personalized consultation with our AI powered algorithm, that will guide you through every step of the application process. From crafting the perfect personal statement to preparing for interviews, we've got you covered.",
      icon: Users,
      highlight: false
    },
    {
      title: "Enhanced Application Support",
      description: "We don't just support your application – we prioritize it. Receive top-tier support to ensure that every aspect of your application is polished to perfection, increasing your chances of acceptance into your dream program.",
      icon: FileCheck,
      highlight: false
    },
    {
      title: "98% Admission Success Rate",
      description: "Join thousands of students who have successfully secured their spots in top Master's programs through our services. With a 98% success rate, we confidently guarantee that our expert guidance will help you achieve your academic goals.",
      icon: TrendingUp,
      highlight: true
    },
    {
      title: "Money-Back Guarantee",
      description: "We believe in the quality of our services. If you follow our guidance and are not admitted to any Master's program, we offer a full premium package the next admission round. Your success is our success!",
      icon: Shield,
      highlight: false
    },
    {
      title: "Dedicated Support Team",
      description: "Access our dedicated support team 24/7. Whether you have a question about your application, need assistance with your documents, or require urgent advice, our team is here to help whenever you need it.",
      icon: Headphones,
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full px-6 py-3 mb-6 font-bold">
              <Crown className="h-5 w-5 mr-2" />
              <span>Premium VIP Experience</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Complete Document Verification
              <br />
              <span className="relative">
                & Subscription
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30 rounded-full transform rotate-1"></div>
              </span>
            </h1>
            
            <p className="text-xl mb-8 text-emerald-100 max-w-3xl mx-auto">
              <strong>Invest in Your Future: Secure Your Place in a Top Master's Program in Sweden for Just SEK300</strong>
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">
                Why is Paying the Document Verification Fee the Best Decision for Your Academic Journey:
              </h3>
              <p className="text-emerald-100">
                You're not just paying for a service – you're investing in peace of mind, knowing that 
                <span className="text-yellow-300 font-semibold"> experts are working tirelessly to help you achieve your academic dreams.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Award className="h-4 w-4 mr-1" />
                98% Success Rate
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Shield className="h-4 w-4 mr-1" />
                Money-Back Guarantee
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Clock className="h-4 w-4 mr-1" />
                24/7 Support
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Premium Benefits That Guarantee Your Success
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get everything you need to secure your spot in Sweden's top universities with our comprehensive premium package
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            
            return (
              <Card
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  benefit.highlight ? "ring-2 ring-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50" : ""
                }`}
              >
                {benefit.highlight && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 text-xs font-bold">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`${
                      benefit.highlight 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                        : "bg-gradient-to-r from-gray-700 to-gray-800"
                    } p-4 rounded-2xl flex-shrink-0 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-600/90 to-teal-700/90"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <CardContent className="relative p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center bg-white/20 rounded-full px-4 py-2 mb-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="text-sm font-bold">Premium Package</span>
                </div>
                
                <div className="flex items-center justify-center mb-2">
                  <span className="text-5xl font-bold">SEK300</span>
                </div>
                <p className="text-emerald-100">One-time investment in your future</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-3 text-green-300" />
                  <span>Complete document verification</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-3 text-green-300" />
                  <span>Expert consultation & guidance</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-3 text-green-300" />
                  <span>98% admission success rate</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-3 text-green-300" />
                  <span>Money-back guarantee</span>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-white text-emerald-600 hover:bg-gray-100 font-bold py-4 text-lg mb-4"
                onClick={handlePayNow}
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Pay Now - SEK300
              </Button>

              <Button 
                variant="outline" 
                size="lg"
                className="w-full border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate("/self-directed")}
              >
                Use Self Service Instead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full">
                <HeartHandshake className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Promise to You
            </h2>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8">
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                "You're not just paying for a service – you're investing in peace of mind, knowing that experts are working tirelessly to help you achieve your academic dreams."
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="bg-emerald-500/20 p-3 rounded-full w-fit mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">98% Success Rate</h4>
                  <p className="text-gray-400 text-sm">Proven track record of student success</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-teal-500/20 p-3 rounded-full w-fit mx-auto mb-3">
                    <Shield className="h-8 w-8 text-teal-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Money-Back Guarantee</h4>
                  <p className="text-gray-400 text-sm">Full refund if not admitted anywhere</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-cyan-500/20 p-3 rounded-full w-fit mx-auto mb-3">
                    <Headphones className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
                  <p className="text-gray-400 text-sm">Always here when you need us</p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-12 py-4 text-lg font-bold"
            >
              <Zap className="h-6 w-6 mr-2" />
              Secure Your Spot Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Terms and Conditions</DialogTitle>
          </DialogHeader>
          
          <div 
            ref={termsScrollRef}
            onScroll={handleScroll}
            className="max-h-96 overflow-y-auto px-6 py-4 space-y-4 text-sm leading-relaxed border rounded-lg"
          >
            <h3 className="text-lg font-semibold">Premium Service Agreement</h3>
            
            <div className="space-y-3">
              <p><strong>1. Service Description</strong></p>
              <p>By purchasing our premium service for SEK300, you gain access to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Complete document verification and review</li>
                <li>Expert consultation and guidance throughout your application process</li>
                <li>One-year full access subscription with real-time notifications</li>
                <li>Enhanced application support with priority assistance</li>
                <li>24/7 dedicated support team access</li>
              </ul>

              <p><strong>2. Success Rate and Guarantee</strong></p>
              <p>We maintain a 98% admission success rate based on historical data. However, admission decisions are ultimately made by individual universities and are subject to their specific requirements and criteria.</p>

              <p><strong>3. Money-Back Guarantee</strong></p>
              <p>If you follow our guidance completely and are not admitted to any Master's program you applied to through our service, we offer a full premium package for the next admission round at no additional cost.</p>

              <p><strong>4. Payment Terms</strong></p>
              <p>The SEK300 fee is a one-time payment that provides access to all premium features for one academic year. Payment is processed securely through our payment system.</p>

              <p><strong>5. Service Limitations</strong></p>
              <p>While we provide expert guidance and support, we cannot guarantee admission to any specific university or program. Final admission decisions rest solely with the respective educational institutions.</p>

              <p><strong>6. User Responsibilities</strong></p>
              <p>To be eligible for our guarantee, you must:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Follow all recommendations and guidance provided</li>
                <li>Submit applications within specified deadlines</li>
                <li>Respond promptly to requests for additional information</li>
              </ul>

              <p><strong>7. Privacy and Data Protection</strong></p>
              <p>We are committed to protecting your personal information and will handle all data in accordance with applicable privacy laws and regulations.</p>

              <p><strong>8. Refund Policy</strong></p>
              <p>Refunds are only available under the specific conditions outlined in our money-back guarantee. No refunds will be provided for other reasons.</p>

              <p><strong>9. Service Modifications</strong></p>
              <p>We reserve the right to modify our services, but any changes will not affect the core benefits you have paid for during your subscription period.</p>

              <p><strong>10. Contact Information</strong></p>
              <p>For any questions or concerns regarding these terms, please contact our support team available 24/7 through the platform.</p>

              <p className="text-center font-semibold mt-6">
                By clicking "Agree and Continue", you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowTermsModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAgreeAndContinue}
              disabled={!canAgree}
              className={`w-full sm:w-auto ${!canAgree ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {canAgree ? 'Agree and Continue' : 'Please scroll to read all terms'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PremiumService;