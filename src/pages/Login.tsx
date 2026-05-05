import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, GraduationCap, Building2, UserCog, Briefcase, ChevronRight, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export default function Login() {
  const { signIn, user, profile, createProfile, logout, setActiveRole, activeRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProfile = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await createProfile(selectedRole);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    if (user) {
      setActiveRole(role);
    } else {
      await signIn(role);
    }
  };

  const personas = [
    { id: 'student' as UserRole, label: 'Student', desc: 'Track coding stats & library progress', icon: GraduationCap },
    { id: 'faculty' as UserRole, label: 'Faculty', desc: 'Manage courses & view payouts', icon: Building2 },
    { id: 'recruiter' as UserRole, label: 'Recruiter', desc: 'Find top talent with verified scores', icon: Briefcase },
    { id: 'admin' as UserRole, label: 'Administrator', desc: 'Full system oversight & control', icon: UserCog },
  ];

  // If user is logged in but has no profile, show role selection for account creation
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Create Your Profile</h2>
            <p className="font-mono text-xs uppercase opacity-50 mb-10">Select your default position to initialize access.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {personas.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id as UserRole)}
                  className={`flex flex-col p-6 border text-left transition-all ${
                    selectedRole === role.id 
                      ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                      : 'border-black/10 hover:border-black'
                  }`}
                >
                  <role.icon size={24} className="mb-4" />
                  <h3 className="font-bold uppercase text-lg leading-tight">{role.label}</h3>
                  <p className={`text-[10px] mt-2 font-mono uppercase tracking-tight ${selectedRole === role.id ? 'opacity-70' : 'opacity-40'}`}>
                    {role.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCreateProfile}
                disabled={!selectedRole || isSubmitting}
                className="flex-1 bg-black text-white py-4 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Configuring Access...' : 'Enter Dashboard'}
                <ChevronRight size={18} />
              </button>
              <button 
                onClick={logout}
                className="px-8 border border-black font-bold uppercase text-xs"
              >
                Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-none mb-4">
            Intelli<br/><span className="text-zinc-500">Prep</span>
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-40">Single Identity // Multi-Persona Access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => handleRoleSelect(p.id)}
              className="group relative bg-white border-2 border-black p-8 text-left transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="mb-6 p-4 bg-black text-white inline-block group-hover:bg-zinc-800 transition-colors">
                <p.icon size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">As {p.label}</h3>
              <p className="text-xs font-mono opacity-60 leading-relaxed uppercase">{p.desc}</p>
              <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group-hover:underline">
                {user ? 'Switch Content' : 'Secure Entry'} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="font-mono text-[10px] uppercase opacity-30 tracking-[0.2em]">
            Identity managed by Google Secure SSO // All sessions encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

