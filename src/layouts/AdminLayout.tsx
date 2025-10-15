// src/layouts/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminFooter } from '@/components/admin/AdminFooter';
import { ReactNode } from 'react';
import { Bell, User, ChevronDown, Settings, LogOut, UserCircle } from 'lucide-react';

interface AdminLayoutProps {
  children?: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Calculate main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (isMobile) {
      return 'ml-0';
    }
    if (sidebarCollapsed) {
      return 'lg:ml-20';
    }
    return 'lg:ml-64';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          
          {/* Logo - Hidden on mobile */}
          <div className="hidden lg:flex items-center">
            
          </div>
          
          {/* Right side - User menu and notifications */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>
            
            {/* User menu */}
            <div className="relative user-menu-container">
              <button
                type="button"
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 hover:bg-gray-100 transition-colors"
                onClick={toggleUserMenu}
              >
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  AU
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">Admin User</span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User dropdown menu */}
              <div 
                className={`absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg overflow-hidden z-50 transform transition-all duration-200 ease-in-out ${
                  userMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@uniplanner.com</p>
                </div>
                <div className="py-1">
                  <a 
                    href="#" 
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                  >
                    <UserCircle className="h-4 w-4 mr-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <span>Your Profile</span>
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                  >
                    <Settings className="h-4 w-4 mr-3 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <span>Settings</span>
                  </a>
                </div>
                <div className="border-t border-gray-100">
                  <button 
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                    onClick={() => {
                      // Handle sign out
                      console.log('Sign out clicked');
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-3 group-hover:text-red-700 transition-colors" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        
        {/* Main Content */}
        <div 
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${getMainContentMargin()}`}
          onClick={() => isMobile && sidebarOpen && toggleSidebar()}
        >
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8">
            {children || <Outlet />}
          </main>
          
          {/* Footer */}
          <AdminFooter />
        </div>
      </div>
    </div>
  );
}