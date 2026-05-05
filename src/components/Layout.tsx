import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Code, 
  ClipboardCheck, 
  CreditCard, 
  Search, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, activeRole, logout, setActiveRole } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const getNavItems = () => {
    const common = [
      { label: 'Overview', icon: LayoutDashboard, path: '/' },
    ];

    if (activeRole === 'admin') {
      return [
        ...common,
        { label: 'Manage Users', icon: Users, path: '/users' },
        { label: 'Attendance Monitor', icon: ClipboardCheck, path: '/attendance' },
        { label: 'Payroll', icon: CreditCard, path: '/payroll' },
        { label: 'Talent Search', icon: Search, path: '/search' },
      ];
    }

    if (activeRole === 'faculty') {
      return [
        ...common,
        { label: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
        { label: 'Classes', icon: BookOpen, path: '/classes' },
        { label: 'Salary', icon: CreditCard, path: '/salary' },
      ];
    }

    if (activeRole === 'student') {
      return [
        ...common,
        { label: 'Coding Stats', icon: Code, path: '/coding' },
        { label: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
      ];
    }

    if (activeRole === 'recruiter') {
      return [
        ...common,
        { label: 'Talent Search', icon: Search, path: '/search' },
      ];
    }

    return common;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-black hidden md:flex flex-col">
        <div className="p-6 border-b border-black">
          <h1 className="text-xl font-black uppercase tracking-tighter">IntelliPrep</h1>
          <p className="text-[10px] font-mono uppercase opacity-50">IntelliPrep Analytics</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <p className="text-[10px] font-mono uppercase px-4 mb-4 opacity-40">Main Navigation</p>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-medium transition-all group",
                location.pathname === item.path 
                  ? "bg-black text-white" 
                  : "hover:bg-black/5"
              )}
            >
              <item.icon size={18} />
              <span className="text-sm uppercase tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-black">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-xs">
              {profile?.displayName[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{profile?.displayName}</p>
              <p className="text-[10px] font-mono uppercase opacity-50">{activeRole}</p>
            </div>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveRole(null as any)} // null triggers role selection in Login
              className="w-full flex items-center gap-3 px-4 py-2 text-zinc-600 hover:bg-zinc-100 transition-colors border border-black/5"
            >
              <Users size={16} />
              <span className="text-[10px] uppercase font-bold tracking-tight">Switch Persona</span>
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span className="text-[10px] uppercase font-bold tracking-tight">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-black flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="font-mono text-xs uppercase tracking-widest opacity-60">System // {location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1)}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] px-2 py-1 bg-green-100 text-green-700 uppercase font-bold border border-green-200">Live</span>
          </div>
        </header>

        <div className="p-6 lg:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
