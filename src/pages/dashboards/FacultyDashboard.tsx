import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from '../../components/StatsCard';
import { Users, BookOpen, Clock, CreditCard, ChevronRight, Check, Megaphone, FolderGit2, Send, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { postAnnouncement, getStudentProjects, verifyProject } from '../../services/facultyService';
import { Announcement, Project } from '../../types';

export default function FacultyDashboard({ section = 'overview' }: { section?: string }) {
  const { profile } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    getStudentProjects().then(setProjects);
  }, []);

  const handlePostAnnouncement = async () => {
    if (!announcementText) return;
    setIsPosting(true);
    try {
      await postAnnouncement({
        title: 'New Update',
        content: announcementText,
        authorId: profile!.uid,
        authorName: profile!.displayName,
        role: 'faculty',
      });
      setAnnouncementText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {section === 'attendance' ? 'Attendance Control' : section === 'salary' ? 'Earnings & Payouts' : section === 'classes' ? 'Class Management' : 'Faculty Panel'}
          </h1>
          <p className="font-mono text-sm opacity-60">Manage your students and track your monthly performance.</p>
        </div>
        <div className="bg-black text-white p-4">
          <p className="text-[10px] font-mono uppercase opacity-50">Faculty ID</p>
          <p className="text-xl font-bold uppercase tracking-widest">{profile?.uid.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Students" value="184" icon={Users} />
        <StatsCard label="Lectures Taken" value="42" icon={BookOpen} trend="+4 this week" trendDirection="up" />
        <StatsCard label="Attendance Avg" value="88.2%" icon={Clock} />
        <StatsCard label="Est. Salary" value={formatCurrency(78500)} icon={CreditCard} trend="Calculated" trendDirection="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {(section === 'overview') && (
            <>
              <div className="bg-white border border-black p-8">
                <h3 className="font-bold uppercase tracking-tight flex items-center gap-2 mb-8">
                  <Megaphone size={18} />
                  Broadcast Announcements
                </h3>
                <div className="space-y-4">
                  <textarea 
                    placeholder="Type your announcement to all students your branches..."
                    className="w-full min-h-[120px] border border-black p-4 font-mono text-xs focus:bg-zinc-50 outline-none"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-mono opacity-50 uppercase">Character count: {announcementText.length}/280</p>
                    <button 
                      onClick={handlePostAnnouncement}
                      disabled={isPosting || !announcementText}
                      className="bg-black text-white px-8 py-3 font-bold uppercase text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send size={14} /> {isPosting ? 'Posting...' : 'Send Broadcast'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-black p-8">
                <h3 className="font-bold uppercase tracking-tight flex items-center gap-2 mb-8">
                  <FolderGit2 size={18} />
                  Review Student Projects
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'IntelliPrep AI Bot', student: 'Kai Chen', status: 'pending', tech: 'Python, GPT-4' },
                    { title: 'NoteSync Web', student: 'Alex Rivera', status: 'pending', tech: 'Next.js, Firebase' },
                  ].map((proj, i) => (
                    <div key={i} className="border border-black p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold uppercase text-sm leading-tight">{proj.title}</h4>
                          <span className="text-[8px] font-mono uppercase bg-yellow-100 px-1 border border-yellow-200">Pending Review</span>
                        </div>
                        <p className="text-[10px] font-mono uppercase opacity-50 mb-1">Student: {proj.student}</p>
                        <p className="text-[10px] font-mono uppercase opacity-50 underline mb-4">{proj.tech}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 border border-black py-2 font-bold uppercase text-[10px] hover:bg-black hover:text-white flex items-center justify-center gap-1">
                          <ExternalLink size={10} /> View Repo
                        </button>
                        <button className="flex-1 bg-green-600 text-white py-2 font-bold uppercase text-[10px] flex items-center justify-center gap-1">
                          <Check size={10} /> Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {(section === 'attendance' || section === 'classes') && (
            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight mb-8">Mark Attendance</h3>
              <div className="space-y-4">
                {[
                  { id: '1', name: 'CS 4-A', subject: 'Advanced Algorithms', time: '10:00 AM' },
                  { id: '2', name: 'CS 4-B', subject: 'Advanced Algorithms', time: '12:00 PM' },
                  { id: '3', name: 'CS 3-A', subject: 'System Architecture', time: '02:00 PM' },
                ].map(cls => (
                  <div 
                    key={cls.id}
                    className={cls.id === selectedClass ? "border-2 border-black p-4 bg-zinc-50" : "border border-black p-4 hover:bg-zinc-50 cursor-pointer"}
                    onClick={() => setSelectedClass(cls.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold uppercase text-sm">{cls.name}</p>
                        <p className="text-xs opacity-60 underline">{cls.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs">{cls.time}</p>
                        <button className="text-[10px] uppercase font-bold text-black mt-1 flex items-center gap-1 group">
                          Open Log <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'salary' && (
            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight mb-8">Detailed Payout History</h3>
              <div className="space-y-4">
                {[
                  { month: 'April 2026', base: 50000, variable: 21000, total: 71000, status: 'Paid' },
                  { month: 'March 2026', base: 50000, variable: 18500, total: 68500, status: 'Paid' },
                  { month: 'February 2026', base: 50000, variable: 22000, total: 72000, status: 'Paid' },
                ].map((pay) => (
                  <div key={pay.month} className="border border-black p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold uppercase text-sm">{pay.month}</p>
                      <p className="text-[10px] font-mono uppercase opacity-50">Base: {formatCurrency(pay.base)} // Var: {formatCurrency(pay.variable)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg">{formatCurrency(pay.total)}</p>
                      <span className="text-[8px] uppercase px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 font-bold">{pay.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {(section === 'overview' || section === 'attendance' || section === 'classes') && (
            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight mb-6">Course Performance</h3>
              <div className="h-[200px] flex items-end gap-2 px-2">
                {[45, 78, 62, 89, 53, 91, 58].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full bg-zinc-100 border border-black relative overflow-hidden h-full">
                      <div 
                        className="absolute bottom-0 w-full bg-black group-hover:bg-zinc-800 transition-all" 
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                    <span className="font-mono text-[8px] uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(section === 'overview' || section === 'salary') && (
            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight mb-6 underline underline-offset-4">Faculty Salary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-black/5 text-sm uppercase">
                  <span className="opacity-60">Base</span>
                  <span className="font-bold">{formatCurrency(50000)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-black/5 text-sm uppercase">
                  <span className="opacity-60">Lectures</span>
                  <span className="font-bold text-green-600">+{formatCurrency(21000)}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold uppercase">Net Payout</span>
                  <span className="text-xl font-black">{formatCurrency(71000)}</span>
                </div>
              </div>
              <button className="mt-8 text-[10px] font-mono uppercase bg-black text-white w-full py-2">Download Payslip</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

