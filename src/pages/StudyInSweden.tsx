import { Calendar, Clock, MapPin, Star, Users, Globe, Award, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const StudyInSweden = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Globe,
      title: "Sustainability Hub", 
      description: "Link Sweden is a global leader in sustainability living. Immerse yourself in a culture that values eco-consciousness and empowers you to champion environmental causes within your community."
    },
    {
      icon: Users,
      title: "Career Opportunities",
      description: "A liberal education opens doors to numerous opportunities - leverage your knowledge and network to excel in your career and make a real impact! Each home country brings its own unique value."
    },
    {
      icon: Award,
      title: "Fully Funded Scholarships",
      description: "Take advantage of the Swedish Institute (SI) scholarship to fund your education. Apply before 15 January 2025 and be one of the master's program."
    }
  ];

  const courses = [
    { category: "Engineering" },
    { category: "Biomedical" },
    { category: "Visual Arts" },
    { category: "Business Administration" },
    { category: "Liberal Arts & Science" },
    { category: "Social Science" },
    { category: "Health Care" },
    { category: "Interactive English" },
    { category: "Mathematics" }
  ];

  const intakes = [
    { semester: "Autumn semester", months: "15 October", deadline: "15 January" },
    { semester: "Spring semester", months: "2 June", deadline: "2 September" }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-64 md:h-80 bg-cover bg-center rounded-xl overflow-hidden"
          style={{
            backgroundImage: `url('/lovable-uploads/373fe693-bfcb-4e08-b156-c14a775066e9.png')`
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Study in Sweden for International Students
              </h1>
              <p className="text-lg md:text-xl max-w-4xl mx-auto mb-8">
                Take business easy in your career by choosing Swedish conventional courses from world-class education, a culture of sustainability, and real career opportunities. Discover why Sweden is the perfect place to further your academic journey.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                onClick={() => navigate('/student/pathway-selection')}
              >
                Start Application
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-700 leading-relaxed">
          Swedish universities are globally renowned for their excellence, providing cutting-edge knowledge and skills to lead beneficial change in your community.
        </p>
      </div>

      {/* Why Study in Sweden */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Study in Sweden?</h2>
        <p className="text-gray-700 mb-6">
          Discover a progressive and innovative education that connects individuals from around the world. Build lasting relationships with global professionals who share your passion for sustainability and positive environmental impact.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Courses To Study in Sweden</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {courses.map((course, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="justify-center py-2 px-3 text-sm"
            >
              {course.category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Intakes & Deadlines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Intakes & Deadlines</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-semibold text-gray-900">Intake</th>
                <th className="text-left py-3 font-semibold text-gray-900">Months</th>
                <th className="text-left py-3 font-semibold text-gray-900">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {intakes.map((intake, index) => (
                <tr key={index} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 text-gray-900">{intake.semester}</td>
                  <td className="py-3 text-gray-700">{intake.months}</td>
                  <td className="py-3 text-gray-700">{intake.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Not Sure Where to Start?</h2>
        <p className="mb-6 opacity-90">
          Our team of expert advisors is ready to guide you exploring opportunities and find the right programs. Discover what's possible as you chart the right preparations within today.
        </p>
        <Button 
          className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8"
          onClick={() => navigate('/student/application-journey')}
        >
          Start Here
        </Button>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-600">
          Unlock an educational consultancy firm dedicated to helping students find the best programs and guidance through application process.
        </p>
      </div>
    </div>
  );
};

export default StudyInSweden;
