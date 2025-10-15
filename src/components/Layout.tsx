
import { Home, Calendar, BarChart3, Settings, Menu, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  
  const navigationItems = [
    {
      title: "Dashboard",
      url: "/student/dashboard",
      icon: Home,
    },
    {
      title: "Applications",
      url: "/student/application",
      icon: Calendar,
    },
    {
      title: "Documents", 
      url: "/student/documents",
      icon: FileText,
    },
    
    {
      title: "My Profile", 
      url: "/student/my-profile",
      icon: Settings,
    },
  ]; 

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-center border-b bg-white/80 backdrop-blur-sm px-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UniPlanr
            </h1>
            <p className="text-sm text-muted-foreground">University Admission Application Management Portal</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 pb-32 sm:pb-28">
        {children}
      </main>

      {/* Floating Navigation - Left Side */}
      <div className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/60 transition-all duration-300 px-2 py-1">
          <div className="flex items-center">
            {/* Nav Toggle Button */}
            <Button
              onClick={() => setIsNavExpanded(!isNavExpanded)}
              className="h-10 w-10 rounded-xl transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl"
              variant="ghost"
              size="icon"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Navigation Items - Only visible when expanded */}
            <div className={`flex items-center gap-4 transition-all duration-300 ease-in-out ${
              isNavExpanded 
                ? 'opacity-100 max-w-none translate-x-0 ml-2 sm:ml-5' 
                : 'opacity-0 max-w-0 translate-x-[-10px] overflow-hidden'
            }`}>
              {navigationItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center transition-all duration-200 h-10 w-20 rounded-lg sm:h-12 sm:w-20 sm:rounded-xl mx-0.5 sm:mx-1 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105"
                        : "text-gray-600 hover:bg-gray-100 hover:scale-105"
                    }`
                  }
                >
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4 mb-0.5" />
                  <span className="text-[8px] sm:text-[10px] font-medium">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
