export interface Project {
  id: string;
  teamName: string;
  projectName: string;
  problematic: string;
  members: string[];
  status: 'pending' | 'completed';
  scores?: {
    innovation: number;
    feasibility: number;
    technical: number;
  };
  comments?: {
    innovation: string;
    feasibility: string;
    technical: string;
  };
}

export interface User {
  name: string;
  email: string;
}

export type ViewState = 'login' | 'dashboard' | 'evaluation';

export const CRITERIA_MAX_SCORE = 20;
export const TOTAL_MAX_SCORE = 60;