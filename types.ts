export interface Project {
  id: string;
  name: string;
  teamName: string;
  problematic: string;
  teamMembers: string[];
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

export interface ClientEvaluationData {
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
  relevanceComment: string;
  innovationComment: string;
  feasibilityComment: string;
  impactComment: string;
  presentationComment: string;
  bmcComment: string;
  bonusDataComment: string;
  bonusPrototypeComment: string;
  bonusQaComment: string;
  penaltyComment: string;
}

export interface DbEvaluation {
  id: string;
  created_at: string;
  judge_id: string;
  project_id: string;

  relevance_score: number | null;
  innovation_score: number | null;
  feasibility_score: number | null;
  impact_score: number | null;
  presentation_score: number | null;

  bmc_score: number | null;

  bonus_data: number | null;
  bonus_prototype: number | null;
  bonus_qa: number | null;

  penalty_time: number | null;
  penalty_quality: number | null;

  relevance_comment: string | null;
  innovation_comment: string | null;
  feasibility_comment: string | null;
  impact_comment: string | null;
  presentation_comment: string | null;
  bmc_comment: string | null;
  bonus_data_comment: string | null;
  bonus_proto_comment: string | null;
  bonus_qa_comment: string | null;
  penalty_comment: string | null;
}

export interface JudgeProfile {
  id: string;         // auth.users.id
  name: string;
  email: string;
  isAdmin: boolean;
  themeIds?: string[];
}