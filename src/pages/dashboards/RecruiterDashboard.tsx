import React, { useState } from 'react';
import { Search, Filter, Github, Code2, ExternalLink, GraduationCap, Trophy } from 'lucide-react';
import StatsCard from '../../components/StatsCard';

export default function RecruiterDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const mockStudents = [
    { name: 'Alex Rivera', year: '2024', branch: 'CS', sdeScore: 92, github: 'arivera', leetcode: 'alex_r', skills: ['React', 'Node.js', 'Go'] },
    { name: 'Mina Sato', year: '2024', branch: 'IT', sdeScore: 88, github: 'msato', leetcode: 'mina_s', skills: ['Python', 'Django', 'AWS'] },
    { name: 'Kai Chen', year: '2025', branch: 'CS', sdeScore: 95, github: 'kchen', leetcode: 'kai_dev', skills: ['C++', 'Rust', 'Web3'] },
    { name: 'Leo Varma', year: '2024', branch: 'SE', sdeScore: 84, github: 'lvarma', leetcode: 'leo_v', skills: ['Java', 'Spring', 'MySQL'] },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Talent Acquisition</h1>
          <p className="font-mono text-sm opacity-60">Verified candidate statistics powered by GitHub & LeetCode integrations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard label="Verified Candidates" value="452" icon={GraduationCap} />
        <StatsCard label="High-Ready (90+)" value="84" icon={Trophy} />
        <StatsCard label="Avg. SDE Score" value="76.2" icon={Code2} />
      </div>

      <div className="bg-white border border-black p-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, skill, or branch..." 
              className="w-full bg-zinc-50 border border-black p-4 pl-12 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 border border-black px-8 py-4 font-bold uppercase transition-all hover:bg-black hover:text-white">
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockStudents.map(student => (
            <div key={student.github} className="border border-black p-6 group hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-black text-white font-mono text-[10px] uppercase">
                Ready to Hire
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{student.name}</h3>
                  <p className="text-[10px] font-mono uppercase opacity-50">{student.branch} Class of {student.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono uppercase opacity-50">SDE ID Score</p>
                  <p className={student.sdeScore > 90 ? "text-2xl font-black text-green-600" : "text-2xl font-black"}>
                    {student.sdeScore}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mb-6">
                <a href="#" className="flex items-center gap-2 text-xs font-bold uppercase border-b-2 border-black hover:opacity-70">
                  <Github size={14} /> GitHub
                </a>
                <a href="#" className="flex items-center gap-2 text-xs font-bold uppercase border-b-2 border-black hover:opacity-70">
                  <Code2 size={14} /> LeetCode
                </a>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-mono uppercase opacity-50">Core Stack</p>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-zinc-100 border border-black/10 text-[10px] font-bold uppercase">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <button className="mt-8 w-full py-4 bg-black text-white font-bold uppercase text-xs flex items-center justify-center gap-2 group">
                Request Interview <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
