export interface Project {
  id: string;
  name: string;
  teamName: string;
  problematic: string;
  teamMembers: string[];
  teamLeader?: string | null;
  themeId: string;
  themeName?: string;
  presentationOrder?: number;
  isActive?: boolean;

  status?: "pending" | "completed";
  scores?: {
    relevance: number;
    innovation: number;
    feasibility: number;
    impact: number;
    presentation: number;
    bmc: number;
    bonusData: number;
    bonusPrototype: number;
    bonusQa: number;
    penaltyTime: number;
    penaltyQuality: number;
  };
  comments?: {
    relevance?: string;
    innovation?: string;
    feasibility?: string;
    impact?: string;
    presentation?: string;
    bmc?: string;
    bonusData?: string;
    bonusPrototype?: string;
    bonusQa?: string;
    penalty?: string;
  };
}

export type JuryType = "AI" | "MOBILE" | "DESIGN" | "PRESENTATION";

export interface Criteria {
  id: string;
  name: string;
  type: JuryType;
  description?: string | null;
  weight?: number | null;
  maxScore?: number | null;
  sortOrder?: number | null;
}

export interface CriteriaScore {
  id: string;
  createdAt?: string;
  judgeId: string;
  projectId: string;
  criteriaId: string;
  score: number;
  comment?: string | null;
}

export interface JudgeProfile {
  id: string;         // auth.users.id
  name: string;
  email: string;
  isAdmin: boolean;
  type?: JuryType | null;
}