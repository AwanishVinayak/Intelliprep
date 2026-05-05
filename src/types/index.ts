export type UserRole = 'admin' | 'student' | 'faculty' | 'recruiter';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  branch?: string;
  year?: string;
  avatar?: string;
  createdAt: any;
}

export interface LearningVideo {
  id: string;
  url: string;
  title: string;
  progress: number; // percentage 0-100
  duration?: number; // total duration in seconds
  watchTimeSeconds?: number; // accumulated watch time in seconds
  lastPlayed?: string;
}

export interface StudentStats {
  studentId: string;
  githubUsername?: string;
  leetcodeUsername?: string;
  githubData?: {
    commits: number;
    repos: number;
    stars: number;
  };
  leetcodeData?: {
    solved: number;
    easy: number;
    medium: number;
    hard: number;
    streak: number;
    ranking?: number;
  };
  learningTime: number; // in seconds
  sdeReadinessScore: number;
  learningLibrary?: LearningVideo[];
  lastUpdated: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  role: UserRole;
  targetBranch?: string;
  createdAt: any;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  studentId: string;
  facultyId?: string;
  githubUrl?: string;
  status: 'ideation' | 'in-progress' | 'completed' | 'verified';
  tags: string[];
  createdAt: any;
}

export interface Subject {
  id: string;
  name: string;
  facultyId: string;
  branch: string;
  year: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  facultyId: string;
  date: any;
  presentStudents: string[];
}

export interface FacultyAttendance {
  id: string;
  facultyId: string;
  date: string;
  checkIn: any;
  checkOut?: any;
  lecturesTaken: number;
}

export interface SalaryRecord {
  id: string;
  facultyId: string;
  month: string;
  baseSalary: number;
  lectureBonus: number;
  deductions: number;
  totalSalary: number;
  status: 'draft' | 'approved' | 'paid';
  approvedBy?: string;
}
