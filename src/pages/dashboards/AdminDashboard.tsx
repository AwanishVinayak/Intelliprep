import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from '../../components/StatsCard';
import { Users, GraduationCap, Building2, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

import { useNavigate } from 'react-router-dom';

export default function AdminDashboard({ section = 'overview' }: { section?: string }) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {section === 'users' ? 'User Directory' : section === 'attendance' ? 'Global Attendance' : section === 'payroll' ? 'Fiscal Treasury' : 'System Console'}
          </h1>
          <p className="font-mono text-sm opacity-60">Global override enabled. Monitoring system health and fiscal reports.</p>
        </div>
        <div className="bg-red-600 text-white p-4 uppercase font-bold tracking-widest text-xs flex items-center gap-2">
          <AlertTriangle size={16} /> Restricted Access Mode
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Active Students" 
          value="1,248" 
          icon={GraduationCap} 
          trend="+12%" 
          trendDirection="up"
          onClick={() => navigate('/users')}
        />
        <StatsCard 
          label="Faculty Members" 
          value="84" 
          icon={Building2}
          onClick={() => navigate('/users')}
        />
        <StatsCard 
          label="Avg. Attendance" 
          value="79.4%" 
          icon={Users} 
          trend="-4.2%" 
          trendDirection="down" 
          className="border-red-600"
          onClick={() => navigate('/attendance')}
        />
        <StatsCard 
          label="Monthly Payroll" 
          value={formatCurrency(4850000)} 
          icon={Wallet} 
          trend="Pending" 
          trendDirection="up"
          onClick={() => navigate('/payroll')}
        />
      </div>

      {(section === 'overview' || section === 'payroll') && (
        <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", section === 'payroll' && "lg:grid-cols-2")}>
          <div className={cn("bg-white border border-black p-8", section === 'payroll' ? "lg:col-span-1" : "lg:col-span-2")}>
            <h3 className="font-bold uppercase tracking-tight mb-8">Pending Payroll Approvals</h3>
            <div className="space-y-4">
              {[
                { name: 'Dr. Sarah Wilson', dept: 'CS', amount: 92400, lectures: 48 },
                { name: 'Prof. James Bond', dept: 'EE', amount: 84500, lectures: 42 },
                { name: 'Dr. Elena Fisher', dept: 'Bio', amount: 76000, lectures: 38 },
                { name: 'Prof. Robert Lang', dept: 'Math', amount: 88200, lectures: 44 },
              ].map((faculty, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-zinc-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold">
                      {faculty.name[4]}
                    </div>
                    <div>
                      <p className="font-bold uppercase text-sm">{faculty.name}</p>
                      <p className="text-[10px] font-mono uppercase opacity-50">{faculty.dept} Department // {faculty.lectures} Lectures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-bold">{formatCurrency(faculty.amount)}</p>
                    <button className="p-2 border border-black hover:bg-black hover:text-white transition-colors">
                      <CheckCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 bg-black text-white py-4 font-bold uppercase text-sm">
              Process All Approved Payments
            </button>
          </div>

          {(section === 'overview') && (
            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight mb-6">Attendance Alerts</h3>
              <p className="text-xs mb-6 opacity-60 leading-relaxed uppercase font-mono italic">The following students have fallen below the 75% threshold mandated by university policy.</p>
              <div className="space-y-4">
                {[
                  { name: 'Alex Rivera', pr: 'C-42', val: 68 },
                  { name: 'Mina Sato', pr: 'C-09', val: 72 },
                  { name: 'Kai Chen', pr: 'C-15', val: 54 },
                  { name: 'Leo Varma', pr: 'C-31', val: 71 },
                ].map(s => (
                  <div key={s.name} className="p-3 border-l-4 border-red-600 bg-red-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold uppercase text-xs">{s.name}</span>
                      <span className="font-mono text-xs text-red-600 font-black">{s.val}%</span>
                    </div>
                    <p className="text-[10px] font-mono uppercase opacity-50">Branch: {s.pr}</p>
                  </div>
                ))}
              </div>
              <button className="mt-8 w-full border border-black text-black py-3 font-bold uppercase text-xs hover:bg-black hover:text-white transition-all">
                Send Mass Notifications
              </button>
            </div>
          )}

          {section === 'payroll' && (
            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight mb-8 underline underline-offset-4 text-xl">Treasury Stats</h3>
              <div className="space-y-6">
                <div className="p-6 bg-zinc-900 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
                  <p className="text-xs font-mono uppercase opacity-50 mb-2">Total Monthly Outflow</p>
                  <p className="text-3xl font-black">{formatCurrency(4850000)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-black">
                    <p className="text-[10px] font-mono uppercase opacity-50">Base Salary</p>
                    <p className="text-lg font-bold">78%</p>
                  </div>
                  <div className="p-4 border border-black">
                    <p className="text-[10px] font-mono uppercase opacity-50">Incentives</p>
                    <p className="text-lg font-bold">22%</p>
                  </div>
                </div>
                <div className="border border-black p-6">
                  <h4 className="font-bold uppercase text-xs mb-4">Payout Distribution</h4>
                  <div className="h-4 bg-zinc-100 flex">
                    <div className="h-full bg-black" style={{ width: '45%' }}></div>
                    <div className="h-full bg-zinc-600" style={{ width: '30%' }}></div>
                    <div className="h-full bg-zinc-300" style={{ width: '25%' }}></div>
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] font-mono uppercase">
                    <span>CS (45%)</span>
                    <span>IT (30%)</span>
                    <span>ME (25%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(section === 'attendance') && (
        <div className="bg-white border border-black p-8">
          <h3 className="font-bold uppercase tracking-tight text-xl mb-8 flex items-center gap-2">
            <Users size={24} /> Global Attendance Logs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {['CS-1', 'CS-2', 'CS-3', 'CS-4'].map(sec => (
              <div key={sec} className="border border-black p-4 hover:bg-zinc-50 cursor-pointer group">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg group-hover:underline">{sec}</span>
                  <span className="font-mono text-sm">82%</span>
                </div>
                <p className="text-[10px] font-mono uppercase opacity-50">Overall Average</p>
              </div>
            ))}
          </div>
          <div className="border border-black overflow-hidden">
             <table className="w-full text-sm">
                <thead className="bg-[#E4E3E0] border-b border-black font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-4 text-left">Branch Name</th>
                    <th className="p-4 text-left">HOD</th>
                    <th className="p-4 text-center">Avg Attendance</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Computer Science', hod: 'Dr. Sarah W', val: 84 },
                    { name: 'Mechanical Eng.', hod: 'Prof. Robert L', val: 68 },
                    { name: 'Electronics Eng.', hod: 'Dr. Elena F', val: 76 },
                    { name: 'Civil Engineering', hod: 'Prof. James B', val: 72 },
                  ].map(b => (
                    <tr key={b.name} className="border-b border-black/5 hover:bg-zinc-50">
                      <td className="p-4 font-bold uppercase">{b.name}</td>
                      <td className="p-4 font-mono text-xs italic">{b.hod}</td>
                      <td className="p-4 text-center font-bold">{b.val}%</td>
                      <td className="p-4">
                        <div className="flex justify-center text-[10px] font-bold uppercase">
                          <span className={cn(
                            "px-2 py-0.5 border",
                            b.val < 75 ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"
                          )}>
                            {b.val < 75 ? 'Critical' : 'Healthy'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {section === 'users' && (
        <div className="bg-white border border-black p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold uppercase tracking-tight text-xl underline underline-offset-8">User Management</h3>
            <button className="bg-black text-white px-6 py-2 uppercase font-bold text-xs">+ Add New User</button>
          </div>
          <p className="text-sm opacity-50 mb-8 italic">Search for students, faculty, or system leads below.</p>
          
          <table className="w-full border-collapse">
            <thead className="bg-[#E4E3E0] border border-black">
              <tr>
                <th className="p-4 text-left font-mono uppercase text-[11px]">User Identity</th>
                <th className="p-4 text-left font-mono uppercase text-[11px]">Type/Role</th>
                <th className="p-4 text-left font-mono uppercase text-[11px]">Division</th>
                <th className="p-4 text-center font-mono uppercase text-[11px]">Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Prof. Alice', role: 'Faculty', div: 'Computing', status: 'Active' },
                { name: 'John Student', role: 'Student', div: 'B.Tech CS', status: 'Active' },
                { name: 'Recruiter Pro', role: 'Recruiter', div: 'HR Tech', status: 'Active' },
                { name: 'Admin Zero', role: 'Admin', div: 'Operations', status: 'Active' },
              ].map((u, i) => (
                <tr key={i} className="border border-black hover:bg-zinc-50 transition-colors">
                  <td className="p-4 font-bold uppercase text-xs">{u.name}</td>
                  <td className="p-4">
                    <span className="bg-black text-white px-2 py-1 text-[10px] uppercase font-mono">{u.role}</span>
                  </td>
                  <td className="p-4 font-mono text-[11px] opacity-60 uppercase">{u.div}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[10px] font-bold uppercase">{u.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
