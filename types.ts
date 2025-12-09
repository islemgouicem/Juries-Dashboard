// The base project structure matching the 'projects' table (with minor camelCase adjustments for client-side JS use)
export interface Project {
  id: string;
  name: string;
  teamName: string; // Stored as 'team_name' in DB, but client-side it's easier to use camelCase
  problematic: string;
  teamMembers: string[]; // Stored as 'team_members' TEXT[] in DB

  // UI-specific properties (Derived or Merged)
  status?: 'pending' | 'completed'; // Used in Dashboard logic
  
  // Evaluation data for pre-filling/display on the UI
  scores?: {
    innovation: number;
    feasibility: number;
    technical: number;
  };
  comments?: {
    innovation: string;
    feasibility: string;
    technical: string;
  }
}

// Client data structure for scores/comments - for use within Evaluation.tsx state
export interface ClientEvaluationData {
    innovation: number;
    feasibility: number;
    technical: number;
    innovationComment: string; // Maps to 'innovation_comment' in DB access
    feasibilityComment: string; // Maps to 'feasibility_comment' in DB access
    technicalComment: string; // Maps to 'technical_comment' in DB access
}

// Interface for fetching evaluation data from Supabase
// Use snake_case to match the database table structure when reading/writing
export interface DbEvaluation {
    id: string;
    created_at: string;
    judge_id: string;
    project_id: string;
    
    innovation_score: number;
    feasibility_score: number;
    technical_score: number;
    
    innovation_comment: string;
    feasibility_comment: string;
    technical_comment: string;
}

// Judge interface to be stored in the AuthContext/Local storage
export interface JudgeProfile {
  id: string; // This is the judge_id (auth.users.id in schema)
  name: string;
  email: string;
  isAdmin: boolean; 
}
