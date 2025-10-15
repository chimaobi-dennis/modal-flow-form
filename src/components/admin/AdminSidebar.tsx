// src/components/admin/AdminSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  MessageSquare,
  BarChart2,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  GraduationCap,
  Briefcase,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, group: 'Main' },
  { name: 'Applications', href: '/admin/applications', icon: FileText, group: 'Main' },
  { name: 'Users', href: '/admin/users', icon: Users, group: 'Main' },
  { name: 'Study Destinations', href: '/admin/study-destination', icon: BookOpen, group: 'Content' },
  { name: 'Universities', href: '/admin/universities', icon: GraduationCap, group: 'Content' },
  { name: 'Programs', href: '/admin/programs', icon: Briefcase, group: 'Content' },
  { name: 'Scholarships', href: '/admin/scholarships', icon: DollarSign, group: 'Content' },
  { name: 'Events', href: '/admin/events', icon: Calendar, group: 'Content' },
  { name: 'Steps', href: '/admin/steps', icon: BarChart2, group: 'Settings' },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare, group: 'Settings' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, group: 'Settings' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ isOpen, toggleSidebar, collapsed, setCollapsed }: AdminSidebarProps) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed]);

  const toggleCollapse = () => {
    if (isMobile) {
      toggleSidebar();
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const navGroups = navigation.reduce((groups: Record<string, NavItem[]>, item) => {
    const group = item.group || 'Other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});

  return (
    <>
      <div 
        className={`fixed inset-y-0 left-0 ${collapsed && !isMobile ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out transform ${
          isMobile 
            ? `z-40 ${isOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'}` 
            : 'z-40 translate-x-0 shadow-sm'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0 relative">
          <Link 
            to="/admin" 
            className={`flex items-center text-lg font-semibold text-gray-900 ${collapsed && !isMobile ? 'justify-center w-full' : ''} transition-all duration-200`}
            onClick={handleNavClick}
          >
            {collapsed && !isMobile ? (
              <span className="text-indigo-600 text-2xl font-bold">U</span>
            ) : (
              <span className="text-indigo-600">UniPlanner</span>
            )}
          </Link>
          
          {/* Collapse button - always visible on desktop, hidden on mobile */}
          <button
            onClick={toggleCollapse}
            className={`hidden lg:flex items-center justify-center w-6 h-6 absolute -right-3 top-1/2 -translate-y-1/2 bg-white rounded-full border border-gray-200 shadow-md hover:bg-indigo-50 hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 z-10 ${
              collapsed ? 'rotate-180' : ''
            }`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {Object.entries(navGroups).map(([group, items]) => (
            <div key={group} className="mb-6">
              {!collapsed && !isMobile && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={handleNavClick}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${collapsed && !isMobile ? 'justify-center' : ''}`}
                      title={collapsed && !isMobile ? item.name : ''}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-500' : 'text-gray-400'} ${collapsed && !isMobile ? '' : 'mr-3'}`} />
                      {(!collapsed || isMobile) && <span>{item.name}</span>}
                      
                      {/* Tooltip for collapsed state */}
                      {collapsed && !isMobile && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-gray-900">
                        {item.name}
                      </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleNavClick}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group relative ${collapsed && !isMobile ? 'justify-center' : ''}`}
            title={collapsed && !isMobile ? 'Help & Support' : ''}
          >
            <HelpCircle className={`h-5 w-5 text-gray-400 ${collapsed && !isMobile ? '' : 'mr-3'}`} />
            {(!collapsed || isMobile) && <span>Help & Support</span>}
            
            {/* Tooltip for collapsed state */}
            {collapsed && !isMobile && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-gray-900">
              Help & Support
            </div>
            )}
          </button>
          <button
            onClick={() => {
              // Handle sign out
              handleNavClick();
            }}
            className={`mt-1 flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 group relative ${collapsed && !isMobile ? 'justify-center' : ''}`}
            title={collapsed && !isMobile ? 'Sign out' : ''}
          >
            <LogOut className={`h-5 w-5 ${collapsed && !isMobile ? '' : 'mr-3'}`} />
            {(!collapsed || isMobile) && <span>Sign out</span>}
            
            {/* Tooltip for collapsed state */}
            {collapsed && !isMobile && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-gray-900">
              Sign out
            </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}