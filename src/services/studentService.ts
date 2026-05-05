import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StudentStats, LearningVideo } from '../types';

export async function getStudentStats(studentId: string): Promise<StudentStats | null> {
  const docRef = doc(db, 'student_stats', studentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as StudentStats;
  }
  return null;
}

export async function updateCodingProfiles(studentId: string, github: string, leetcode: string) {
  const docRef = doc(db, 'student_stats', studentId);
  const docSnap = await getDoc(docRef);

  let githubData = { commits: 0, repos: 0, stars: 0 };
  let leetcodeData: StudentStats['leetcodeData'] = { solved: 0, easy: 0, medium: 0, hard: 0, streak: 0, ranking: 0 };

  try {
    // Fetch GitHub Data
    const ghUserRes = await fetch(`https://api.github.com/users/${github}`);
    if (ghUserRes.ok) {
      const ghUser = await ghUserRes.json();
      githubData.repos = ghUser.public_repos;
      
      // Attempt to get stars (limited to first page of repos for performance/rate limits)
      const ghReposRes = await fetch(`https://api.github.com/users/${github}/repos?per_page=100`);
      if (ghReposRes.ok) {
        const repos = await ghReposRes.json();
        githubData.stars = repos.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);
      }
      
      // Best estimate for commits without a token is using the search API (ratelimited)
      const ghCommitsRes = await fetch(`https://api.github.com/search/commits?q=author:${github}`, {
        headers: { 'Accept': 'application/vnd.github.cloak-preview' }
      });
      if (ghCommitsRes.ok) {
        const commits = await ghCommitsRes.json();
        githubData.commits = commits.total_count || 0;
      } else {
        githubData.commits = 0; // No estimation, avoid 'fake' data
      }
    }

    // Fetch LeetCode Data (using a popular open-source proxy)
    const lcRes = await fetch(`https://leetcode-stats-api.herokuapp.com/${leetcode}`);
    if (lcRes.ok) {
      const lc = await lcRes.json();
      if (lc.status === "success") {
        leetcodeData = {
          solved: lc.totalSolved,
          easy: lc.easySolved,
          medium: lc.mediumSolved,
          hard: lc.hardSolved,
          streak: 0,
          ranking: lc.ranking
        };
      }
    }
  } catch (error) {
    console.error("Error fetching coding stats:", error);
    // Use existing data as fallback if available
    const existing = docSnap.data() as StudentStats;
    if (existing) {
      githubData = existing.githubData || githubData;
      leetcodeData = existing.leetcodeData || leetcodeData;
    }
  }

  const score = calculateSDEScore(githubData, leetcodeData);

  const stats: StudentStats = {
    studentId,
    githubUsername: github,
    leetcodeUsername: leetcode,
    githubData,
    leetcodeData,
    sdeReadinessScore: score,
    learningTime: (docSnap.data() as StudentStats)?.learningTime || 0,
    learningLibrary: (docSnap.data() as StudentStats)?.learningLibrary || [],
    lastUpdated: serverTimestamp(),
  };

  await setDoc(docRef, stats, { merge: true });
  return stats;
}

function calculateSDEScore(github: any, leetcode: any) {
  // Logic: 
  // Leetcode solved (max 40 pts) - weighted by difficulty
  // Github commits & stars (max 40 pts)
  // Consistency/Streak (max 20 pts)
  
  const lcScore = (leetcode.easy * 0.5 + leetcode.medium * 3 + leetcode.hard * 6) / 10;
  const ghScore = (github.commits * 0.05) + (github.stars * 3);
  
  let rankingBonus = 0;
  if (leetcode.ranking && leetcode.ranking > 0) {
    if (leetcode.ranking < 10000) rankingBonus = 20;
    else if (leetcode.ranking < 100000) rankingBonus = 15;
    else if (leetcode.ranking < 500000) rankingBonus = 10;
    else rankingBonus = 5;
  }

  return Math.min(100, Math.round(lcScore + ghScore + rankingBonus));
}

export async function updateLearningLibrary(studentId: string, video: Omit<LearningVideo, 'progress' | 'watchTimeSeconds' | 'lastPlayed'>) {
  const docRef = doc(db, 'student_stats', studentId);
  const docSnap = await getDoc(docRef);
  let library = (docSnap.data() as StudentStats)?.learningLibrary || [];
  
  // Check if video already exists
  const exists = library.find(v => v.id === video.id || v.url === video.url);
  if (!exists) {
    const newVideo: LearningVideo = { 
      ...video, 
      progress: 0, 
      watchTimeSeconds: 0, 
      lastPlayed: new Date().toISOString() 
    };
    library = [...library, newVideo];
    await updateDoc(docRef, { learningLibrary: library });
    return newVideo;
  }
  return exists;
}

export async function saveVideoProgress(
  studentId: string, 
  videoId: string, 
  progress: number, 
  duration?: number,
  additionalWatchTime: number = 0
) {
  const docRef = doc(db, 'student_stats', studentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const stats = docSnap.data() as StudentStats;
    const library = stats.learningLibrary?.map(v => {
      if (v.id === videoId) {
        return { 
          ...v, 
          progress, 
          duration: duration || v.duration,
          watchTimeSeconds: (v.watchTimeSeconds || 0) + additionalWatchTime,
          lastPlayed: new Date().toISOString() 
        };
      }
      return v;
    }) || [];
    await updateDoc(docRef, { learningLibrary: library });
  }
}

export async function addLearningTime(studentId: string, seconds: number) {
  const docRef = doc(db, 'student_stats', studentId);
  const docSnap = await getDoc(docRef);
  const currentTime = (docSnap.data() as StudentStats)?.learningTime || 0;
  await updateDoc(docRef, { learningTime: currentTime + seconds });
}
