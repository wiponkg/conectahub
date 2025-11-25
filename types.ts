
export type ViewState = 
  | 'LANDING' 
  | 'LOGIN' 
  | 'REGISTER' 
  | 'DASHBOARD_HOME' 
  | 'DASHBOARD_CALENDAR' 
  | 'DASHBOARD_RANKING' 
  | 'DASHBOARD_CHAT' 
  | 'DASHBOARD_POINTS'
  | 'DASHBOARD_PROFILE';

export interface User {
  uid?: string; 
  name: string;
  email?: string;
  avatar: string;
  role?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  points?: number; 
  completedMissions?: string[]; 
  hasSeenTour?: boolean; // Novo campo para controle do Tour
}

export const DEFAULT_USER: User = {
  name: "Ana",
  email: "ana@empresa.com",
  avatar: "", 
  role: "Colaboradora",
  points: 0,
  completedMissions: [],
  hasSeenTour: false
};
