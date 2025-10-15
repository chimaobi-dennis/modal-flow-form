import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  PlayCircle, 
  BookOpen, 
  Clock, 
  Zap, 
  Target,
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  DollarSign,
  Star
} from "lucide-react";

const SelfDirectedPath = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      title: "Step-by-Step Guidance",
      description: "Our easy-to-follow checklist and video tutorials provide you with clear, detailed instructions at every stage. These resources have been designed to simplify even the most complex parts of the application process, increasing your chances of success.",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Affordable and Flexible",
      description: "Enjoy all the benefits of our expert advice without breaking the bank. The self-service option is designed to be budget-friendly, allowing you to access essential resources and guides at a fraction of the cost of full service options.",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Exclusive Tools and Resources",
      description: "Gain access to our robust tools and resources, including templates for personal statements, application trackers, and more. These tools are designed to help you stay organized and complete your applications with ease.",
      icon: Target,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Self-Paced Learning",
      description: "Whether you're balancing a full-time job or other commitments, our self-service option lets you work at your own pace, so you can manage your time effectively and still meet application deadlines.",
      icon: Clock,
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Immediate Access",
      description: "Start right away! As soon as you sign up, you'll have instant access to all of our guides, checklists, and tutorials, giving you a head start on your application.",
      icon: Zap,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Learn as You Go",
      description: "By using the self-service option, you'll not only complete your application, but you'll also learn valuable skills in academic writing, document preparation, and application submission – skills you can apply in future academic or professional pursuits.",
      icon: Trophy,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
              <Sparkles className="h-5 w-5 mr-2" />
              <span className="font-bold">Self-Directed Journey</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Take Control of Your
              <br />
              <span className="relative">
                Academic Future
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-yellow-400/30 rounded-full transform -rotate-1"></div>
              </span>
            </h1>
            
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Empower yourself with comprehensive tools, step-by-step guidance, and expert resources. 
              Perfect for independent learners who want to master their application journey! 🚀
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Star className="h-4 w-4 mr-1" />
                98% Success Rate
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Users className="h-4 w-4 mr-1" />
                5000+ Students
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Clock className="h-4 w-4 mr-1" />
                24/7 Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Self-Directed Learning?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful features that make our self-service option the perfect choice for motivated students
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = selectedFeature === index;
            
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isActive ? "ring-2 ring-blue-500 shadow-xl" : ""
                }`}
                onClick={() => setSelectedFeature(index)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl flex-shrink-0 shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                        {feature.title}
                        {isActive && <CheckCircle2 className="h-5 w-5 ml-2 text-green-500" />}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of successful students who chose the self-directed path to achieve their academic dreams in Sweden!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg font-bold"
              >
                <PlayCircle className="h-6 w-6 mr-2" />
                Continue Your Application
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                onClick={() => navigate("/premium-service")}
              >
                Find An Adviser Instead
              </Button>
            </div>

            <div className="mt-8 text-sm text-gray-400">
              <p>⚡ Instant access • 📚 Comprehensive guides • 🎯 Personalized tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Your Success is Our Mission
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We believe in empowering students with the right tools and knowledge. 
              Our self-directed platform is designed to guide you every step of the way to Swedish universities.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                Expert-designed content
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                Regular updates
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                Student support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfDirectedPath;