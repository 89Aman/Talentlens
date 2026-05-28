export interface Candidate {
  id: string;
  rank: string;
  name: string;
  initials: string;
  role: string;
  experience: number; // in years
  semanticScore: number; // e.g., 98
  behavioralScore: number; // e.g., 92
  eloRating: number; // e.g., 2140
  confidence: "High" | "Medium" | "Low";
  avatarColor: string;
  
  // Detail page specifics
  bio?: string;
  location?: string;
  githubStats?: {
    repositories: number;
    totalStars: string;
    lastActive: string;
    topLanguage: string;
    commitVelocity: number[]; // Array of 7 values (Jan to Jul)
  };
  behavioralBreakdown?: {
    quantifiedImpact: {
      score: number;
      quote: string;
      evidence: string;
    };
    ownership: {
      score: number;
      quote: string;
      evidence: string;
    };
    technicalDepth: {
      score: number;
      quote: string;
      evidence: string;
    };
    mentorship: {
      score: number;
      quote: string;
      evidence: string;
    };
  };
  hiringBrief?: {
    fitSummary: string[];
    gaps: string[];
    interviewStrategy: {
      goal: string;
      question: string;
    };
  };
  rawResumeData?: string;
}

export interface RejectedCandidate {
  id: string;
  name: string;
  initials: string;
  currentRole: string;
  experience: string;
  missingSkill: string;
  reason: string;
}

export interface RubricDimension {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage
  precisionSignalName: string;
  precisionValue: string;
  colorClass: string;
  
  keySignals?: string[];
  redFlags?: string[];
  evidenceText?: string;
  tags?: string[];
}

export type ViewType = "home" | "rubric" | "rankings" | "detail" | "rejected" | "export" | "help";
