import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Edit3,
  Sparkles,
  FileCheck,
  Brain,
  Rocket,
  Bell,
  CheckCircle2,
  Wand2
} from 'lucide-react';

const Documents = () => {
  const features = [
    {
      icon: <FileCheck className="h-12 w-12" />,
      title: "Document Library",
      description: "Organize and manage all your application documents in one secure place",
      benefits: [
        "Track document versions",
        "Quick search and filters",
        "AI enhancement history",
        "Download anytime"
      ]
    },
    {
      icon: <Edit3 className="h-12 w-12" />,
      title: "AI Document Writer",
      description: "Create compelling SOPs, cover letters, and motivation letters with AI",
      benefits: [
        "Multiple professional templates",
        "Personalized content generation",
        "Real-time AI editing",
        "Tailored to your program"
      ]
    },
    {
      icon: <FileText className="h-12 w-12" />,
      title: "Resume Builder",
      description: "Build ATS-friendly resumes that stand out to admissions officers",
      benefits: [
        "Beautiful professional templates",
        "Smart formatting",
        "Export to PDF instantly",
        "Optimized for universities"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <Brain className="h-16 w-16 text-primary animate-pulse" />
              <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-4">
            <Badge variant="secondary" className="px-6 py-2 text-lg font-medium">
              <Rocket className="h-4 w-4 mr-2 inline" />
              Coming Soon
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Document Studio
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your AI-powered workspace for creating outstanding application documents
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" className="gap-2 group">
              <Bell className="h-5 w-5 group-hover:animate-bounce" />
              Notify Me When Ready
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:scale-105 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-2 pt-4 border-t">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What to Expect Section */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Wand2 className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Powered by Advanced AI</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our Document Studio will use cutting-edge AI to help you create compelling, personalized documents that capture your unique story and maximize your chances of admission.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Smart Features
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Context-aware content generation based on your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Real-time suggestions and improvements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Grammar and style optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Multiple export formats (PDF, Word, etc.)</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Tailored to You
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Program-specific customization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>University requirement compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Word count and formatting guidelines</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Highlight your strengths effectively</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-6 py-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <h2 className="text-3xl md:text-4xl font-bold">
            Get Ready for Launch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're putting the finishing touches on Document Studio. Be the first to know when it's ready to help you create outstanding application documents.
          </p>
          <Button size="lg" className="gap-2 text-lg px-8 py-6">
            <Bell className="h-5 w-5" />
            Join the Waitlist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Documents;
