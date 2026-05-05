import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatsCard from '../../components/StatsCard';
import { Code, GitBranch, Zap, ClipboardCheck, Trophy, Youtube, Play, CheckCircle2, Github, ExternalLink, RefreshCw, Megaphone, AlertTriangle, Plus, History, Clock, Edit2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { getStudentStats, updateCodingProfiles, addLearningTime, updateLearningLibrary, saveVideoProgress } from '../../services/studentService';
import { getAnnouncements } from '../../services/facultyService';
import { StudentStats, Announcement, LearningVideo } from '../../types';

const DAILY_TASKS = [
  { id: 1, type: 'LeetCode', title: 'Two Sum', difficulty: 'Easy', points: 10 },
  { id: 2, type: 'GitHub', title: 'Push a new feature branch', difficulty: 'Medium', points: 20 },
  { id: 3, type: 'Learning', title: 'Watch 15 mins of Architecture', difficulty: 'Hard', points: 30 },
];

export default function StudentDashboard({ section = 'overview' }: { section?: string }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [githubUser, setGithubUser] = useState('');
  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [isWatching, setIsWatching] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [ytUrl, setYtUrl] = useState('');
  const [activeVideo, setActiveVideo] = useState<LearningVideo | null>(null);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const playerRef = useRef<any>(null);
  const [lastSeekedTime, setLastSeekedTime] = useState<number | null>(null);
  const [lastTickTime, setLastTickTime] = useState(0);

  useEffect(() => {
    if (profile?.uid) {
      getStudentStats(profile.uid).then(s => {
        setStats(s);
        if (s) {
          setGithubUser(s.githubUsername || '');
          setLeetcodeUser(s.leetcodeUsername || '');
          
          // If we have an active video that matched one in the new stats, update it
          if (activeVideo) {
            const updatedVideo = s.learningLibrary?.find(v => v.id === activeVideo.id);
            if (updatedVideo) setActiveVideo(updatedVideo);
          }
        }
      });
      getAnnouncements().then(setAnnouncements);
    }
  }, [profile]);

  // Handle seeking to saved position when active video changes
  useEffect(() => {
    if (activeVideo && playerRef.current && lastSeekedTime !== activeVideo.id as any) {
      const savedSeconds = (activeVideo.progress / 100) * (activeVideo.duration || 0);
      if (savedSeconds > 0) {
        playerRef.current.seekTo(savedSeconds, 'seconds');
      }
      setLastSeekedTime(activeVideo.id as any);
    }
  }, [activeVideo]);

  useEffect(() => {
    let interval: any;
    if (isWatching) {
      interval = setInterval(() => {
        setWatchTime((prev) => prev + 1);
      }, 1000);
    } else if (watchTime > 0 && profile?.uid) {
      addLearningTime(profile.uid, watchTime);
      setWatchTime(0);
    }
    return () => clearInterval(interval);
  }, [isWatching, watchTime, profile]);

  const handleAddToLibrary = async () => {
    if (!ytUrl || !profile) return;
    const videoId = ytUrl.split('v=')[1]?.split('&')[0] || ytUrl.split('/').pop()?.split('?')[0];
    
    // Simple way to get a title from URL or placeholder
    const titleFromUrl = ytUrl.includes('youtube.com') || ytUrl.includes('youtu.be') 
      ? `Video Session ${new Date().toLocaleDateString()}` 
      : 'Learning Resource';

    const newVideoBase = {
      id: videoId || Math.random().toString(36).substr(2, 9),
      url: ytUrl,
      title: titleFromUrl,
    };
    
    const video = await updateLearningLibrary(profile.uid, newVideoBase);
    const updated = await getStudentStats(profile.uid);
    setStats(updated);
    if (video) handleSelectVideo(video);
    setYtUrl('');
  };

  const handleSelectVideo = (video: LearningVideo) => {
    setActiveVideo(video);
    setYtUrl(video.url);
    setPlayerProgress(video.progress);
    setIsWatching(false);
  };

  const handlePlayerProgress = (state: { played: number, playedSeconds: number }) => {
    setPlayerProgress(Math.round(state.played * 100));
    
    if (activeVideo && profile) {
      const duration = playerRef.current?.getDuration() || activeVideo.duration || 0;
      const additionalTime = lastTickTime ? state.playedSeconds - lastTickTime : 0;
      
      // Update local tick
      setLastTickTime(state.playedSeconds);

      // Periodic save or major changes
      const progressPercent = Math.round(state.played * 100);
      if (Math.abs(progressPercent - activeVideo.progress) >= 1 || additionalTime > 5) {
        saveVideoProgress(
          profile.uid, 
          activeVideo.id, 
          progressPercent, 
          duration,
          additionalTime > 0 ? additionalTime : 0
        );
      }
    }
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleSync = async () => {
    if (!githubUser || !leetcodeUser || !profile) return;
    setIsRefreshing(true);
    try {
      const newStats = await updateCodingProfiles(profile.uid, githubUser, leetcodeUser);
      setStats(newStats);
      setShowProfileEdit(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {section === 'coding' ? 'Coding Analytics' : section === 'attendance' ? 'Academic Records' : 'Student Hub'}
          </h1>
          <p className="font-mono text-sm opacity-60">Connected as // {profile?.displayName} // {profile?.branch}</p>
        </div>
        {(section === 'overview' || section === 'coding') && (
          <div className="flex gap-4">
            <div className="bg-black text-white p-4 flex gap-8">
              <div>
                <p className="text-[10px] font-mono uppercase opacity-50">SDE-1 Readiness</p>
                <p className="text-2xl font-bold">{stats?.sdeReadinessScore || 0}%</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div>
                <p className="text-[10px] font-mono uppercase opacity-50">Learning Hrs</p>
                <p className="text-2xl font-bold uppercase">{Math.round((stats?.learningTime || 0) / 3600)}h</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {(section === 'overview' || section === 'coding') && (!stats?.githubUsername || showProfileEdit) && (
        <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold uppercase flex items-center gap-2 text-xl italic">
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              Set Coding Identity
            </h3>
            {showProfileEdit && (
              <button 
                onClick={() => setShowProfileEdit(false)}
                className="text-[10px] font-mono uppercase opacity-50 hover:opacity-100"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase opacity-50">GitHub Username</label>
              <input 
                placeholder="e.g. torvalds" 
                className="w-full border border-black p-3 font-mono text-sm focus:bg-zinc-50 outline-none"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase opacity-50">LeetCode Username</label>
              <input 
                placeholder="e.g. competitive_coder" 
                className="w-full border border-black p-3 font-mono text-sm focus:bg-zinc-50 outline-none"
                value={leetcodeUser}
                onChange={(e) => setLeetcodeUser(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSync}
                disabled={isRefreshing}
                className="w-full h-[50px] bg-black text-white font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                {isRefreshing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {isRefreshing ? 'Syncing...' : 'Sync & Update Profiles'}
              </button>
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono opacity-40 uppercase italic">* We fetch real-time data from GitHub API and LeetCode Stats Service.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(section === 'overview' || section === 'coding') && (
          <>
            <StatsCard 
              label="LeetCode Solved" 
              value={stats?.leetcodeData?.solved || 0} 
              icon={Code} 
              trend={stats?.leetcodeData?.ranking ? `Rank #${stats.leetcodeData.ranking}` : 'Syncing...'} 
              trendDirection="up" 
            />
            <StatsCard 
              label="GitHub Commits" 
              value={stats?.githubData?.commits || 0} 
              icon={GitBranch} 
              trend={stats?.githubData?.stars !== undefined ? `${stats.githubData.stars} Repo Stars` : 'Syncing...'} 
              trendDirection="up" 
            />
            <StatsCard label="Learning Progress" value={`${Math.floor((stats?.learningTime || 0) / 60)}m`} icon={Zap} trend="Live Tracking" trendDirection="up" />
          </>
        )}
        {(section === 'overview' || section === 'attendance') && (
          <StatsCard label="Academic Att." value="92.4%" icon={ClipboardCheck} trend="-1.2%" trendDirection="down" className={section === 'attendance' ? 'col-span-1 md:col-span-2 lg:col-span-4' : ''} />
        )}
      </div>

      {section === 'attendance' && (
        <div className="bg-white border border-black p-8">
          <h3 className="font-bold uppercase tracking-tight mb-8">Subject-wise Attendance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Advanced Algorithms', attendance: 95, total: 40, present: 38 },
              { name: 'System Design', attendance: 88, total: 32, present: 28 },
              { name: 'Cloud Computing', attendance: 92, total: 36, present: 33 },
              { name: 'Database Systems', attendance: 74, total: 30, present: 22 },
            ].map((sub) => (
              <div key={sub.name} className="border border-black p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold uppercase text-lg">{sub.name}</h4>
                  <span className={cn(
                    "font-mono text-xl font-black",
                    sub.attendance < 75 ? "text-red-600" : "text-black"
                  )}>{sub.attendance}%</span>
                </div>
                <div className="h-2 bg-zinc-100 border border-black/10 mb-4">
                  <div className="h-full bg-black" style={{ width: `${sub.attendance}%` }}></div>
                </div>
                <p className="text-[10px] font-mono uppercase opacity-50">Lectures: {sub.present}/{sub.total}</p>
                {sub.attendance < 75 && (
                  <p className="mt-4 text-[10px] font-bold text-red-600 uppercase flex items-center gap-1">
                    <AlertTriangle size={12} /> Below 75% Threshold
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {section !== 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-black p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <h3 className="font-bold uppercase tracking-tight flex items-center gap-2">
                  <Youtube size={18} className="text-red-600" />
                  Technical Learning Hub
                </h3>
                <div className="flex bg-zinc-100 p-1 border border-black max-w-md w-full">
                  <input 
                    placeholder="Paste YT Link..."
                    className="flex-1 bg-transparent px-3 py-2 font-mono text-[10px] focus:outline-none"
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                  />
                  <button 
                    onClick={handleAddToLibrary}
                    className="bg-black text-white px-3 py-2 font-bold uppercase text-[10px] flex items-center gap-1"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
              
              <div className="aspect-video bg-black relative mb-6 border-2 border-black overflow-hidden bg-zinc-900">
                {ytUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractVideoId(ytUrl)}?rel=0&modestbranding=1&enablejsapi=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
                    <Youtube size={48} className="opacity-20" />
                    <p className="font-mono text-[10px] uppercase italic">Select a video to start session</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setIsWatching(!isWatching)}
                  className={cn(
                    "flex-1 py-4 font-bold uppercase text-xs flex items-center justify-center gap-2 border-2 border-black transition-all",
                    isWatching 
                      ? "bg-white text-black" 
                      : "bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:-translate-y-0 active:shadow-none"
                  )}
                >
                  {isWatching ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                  {isWatching ? 'Stop & Save Session' : 'Start Focus Session'}
                </button>
                <a 
                  href={ytUrl || "https://www.youtube.com/watch?v=vLZ7fI6gK3A"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 border-2 border-black flex items-center justify-center hover:bg-zinc-100 transition-colors"
                  title="Open in YouTube"
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              {activeVideo && (
                <div className="p-4 border border-black bg-zinc-50 flex justify-between items-center mb-10">
                  <div className="flex-1">
                    <h4 className="font-bold text-xs uppercase italic">{activeVideo.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex-1 h-1 bg-black/10 rounded-full max-w-[100px]">
                        <div className="h-full bg-black rounded-full" style={{ width: `${playerProgress}%` }}></div>
                      </div>
                      <p className="text-[10px] font-mono opacity-50 uppercase">{playerProgress}% Complete</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[8px] font-mono opacity-40 uppercase">Video Time</p>
                      <p className="font-mono text-[10px] font-bold">{Math.floor((activeVideo.watchTimeSeconds || 0) / 60)}m {Math.floor((activeVideo.watchTimeSeconds || 0) % 60)}s</p>
                    </div>
                    <div className="w-px h-6 bg-black/10 mx-2"></div>
                    <div>
                      <p className="text-[8px] font-mono opacity-40 uppercase">Global Session</p>
                      <p className="font-mono text-[10px] font-bold">{Math.floor(watchTime / 60)}m logged</p>
                    </div>
                  </div>
                </div>
              )}


            </div>

            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight flex items-center gap-2 mb-8 text-xl italic underline underline-offset-8">
                <History size={18} />
                Learning Library
              </h3>
              {stats?.learningLibrary && stats.learningLibrary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.learningLibrary.map((video) => (
                    <div 
                      key={video.id} 
                      onClick={() => handleSelectVideo(video)}
                      className={cn(
                        "border border-black p-4 cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden",
                        activeVideo?.id === video.id ? "bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-zinc-50"
                      )}
                    >
                      <div className="absolute bottom-0 left-0 h-1 bg-black/5 w-full">
                        <div className="h-full bg-black opacity-30" style={{ width: `${video.progress}%` }}></div>
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className={cn(
                            "text-[8px] font-mono uppercase px-1 tracking-widest",
                            activeVideo?.id === video.id ? "bg-black text-white" : "bg-zinc-100 text-black/40"
                          )}>
                            {video.id}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold",
                            video.progress === 100 ? "text-green-600" : "text-black"
                          )}>
                            {video.progress}%
                          </span>
                        </div>
                        <h4 className="font-black uppercase text-[11px] leading-tight mb-2 group-hover:underline">
                          {video.title || 'Technical Content'}
                        </h4>
                        <p className="text-[8px] font-mono opacity-50 uppercase truncate">{video.url}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-center text-[8px] font-mono uppercase">
                        <div>
                          <p className="opacity-40">Watched</p>
                          <p className="font-bold">{Math.floor((video.watchTimeSeconds || 0) / 60)}m {Math.floor((video.watchTimeSeconds || 0) % 60)}s</p>
                        </div>
                        <div className="text-right">
                          <p className="opacity-40">Last Play</p>
                          <p className="font-bold">{new Date(video.lastPlayed || '').toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-50 border border-black border-dashed p-12 text-center">
                  <p className="font-mono text-xs opacity-40 uppercase">No videos in your library. Add a link above to start tracking.</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-black p-8">
              <h3 className="font-bold uppercase tracking-tight flex items-center gap-2 mb-6 text-xl">
                <Trophy size={18} />
                Daily Technical Tasks
              </h3>
              <div className="space-y-4">
                {DAILY_TASKS.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-black/10 hover:border-black transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 border border-black group-hover:bg-black group-hover:text-white transition-colors">
                        <Code size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase font-bold opacity-50">{task.type}</span>
                          <span className={cn(
                            "text-[8px] uppercase px-1 border",
                            task.difficulty === 'Easy' ? 'text-green-600 border-green-200' : 
                            task.difficulty === 'Medium' ? 'text-yellow-600 border-yellow-200' : 'text-red-600 border-red-200'
                          )}>{task.difficulty}</span>
                        </div>
                        <h4 className="font-bold text-sm uppercase">{task.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-xs">+{task.points} PTS</span>
                      <button className="p-1 hover:text-green-600">
                        <CheckCircle2 size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-black p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold uppercase tracking-tight flex items-center gap-2 underline underline-offset-4 text-xl">Verified Profiles</h3>
                <button 
                  onClick={() => setShowProfileEdit(!showProfileEdit)}
                  className="p-2 hover:bg-zinc-100 border border-black/10 rounded-none transition-colors"
                  title="Update Usernames"
                >
                  <Edit2 size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {stats?.githubUsername ? (
                  <div className="p-4 border border-black bg-zinc-50 relative group">
                    <div className="flex items-center gap-3 mb-2">
                      <Github size={20} />
                      <span className="font-bold uppercase text-xs">{stats.githubUsername}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase opacity-60">
                      <span>Repos: {stats.githubData?.repos || 0}</span>
                      <span>Stars: {stats.githubData?.stars || 0}</span>
                      <span>Commits: {stats.githubData?.commits || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-black border-dashed opacity-50 text-[10px] font-mono uppercase text-center">
                    GitHub Not Connected
                  </div>
                )}
                {stats?.leetcodeUsername ? (
                  <div className="p-4 border border-black bg-zinc-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy size={20} className="text-yellow-600" />
                      <span className="font-bold uppercase text-xs">{stats.leetcodeUsername}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono uppercase opacity-60">
                      <span>Solved: {stats.leetcodeData?.solved || 0}</span>
                      <span>Ranking: #{stats.leetcodeData?.ranking || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-black border-dashed opacity-50 text-[10px] font-mono uppercase text-center">
                    LeetCode Not Connected
                  </div>
                )}
                
                <div className="pt-4 border-t border-black/5 mt-4">
                  <p className="text-[9px] font-mono opacity-50 uppercase leading-tight italic">
                    Syncing occurs automatically on login. Use the edit icon above to change handles.
                  </p>
                </div>
              </div>
            </div>

            {announcements.length > 0 && section === 'overview' && (
              <div className="bg-white border border-black p-8">
                <h3 className="font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Megaphone size={18} />
                  IntelliPrep Global Updates
                </h3>
                <div className="space-y-4">
                  {announcements.map((ann, i) => (
                    <div key={ann.id} className={cn("p-4 border border-black/5", i === 0 ? "bg-zinc-50 border-black/20 font-bold" : "bg-white")}>
                      <p className="text-xs leading-relaxed mb-4 italic opacity-80">"{ann.content}"</p>
                      <div className="flex justify-between items-center text-[8px] font-mono uppercase opacity-50">
                        <span>By {ann.authorName}</span>
                        <span>{new Date(ann.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-black text-white p-8">
              <h3 className="font-bold uppercase tracking-tight mb-4">SDE-1 Score Breakdown</h3>
              <p className="text-[10px] font-mono uppercase opacity-50 leading-relaxed mb-6">
                Your score is calculated based on Algorithmic Proficiency (45%), System Contribution (30%), and Consistency (25%).
              </p>
              <div className="space-y-6">
                {[
                  { label: 'Algo Proficiency', val: stats?.sdeReadinessScore ? Math.floor(stats.sdeReadinessScore * 0.8) : 0 },
                  { label: 'OSS Contribution', val: stats?.githubData?.repos ? Math.min(100, stats.githubData.repos * 5) : 0 },
                  { label: 'Study Consistency', val: stats?.learningTime ? Math.min(100, Math.floor(stats.learningTime / 360)) : 0 },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono uppercase">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-1 bg-white/10">
                      <div className="h-full bg-white" style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

