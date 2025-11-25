
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
  uid?: string; // Adicionado UID para facilitar updates
  name: string;
  email?: string;
  avatar: string;
  role?: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  points?: number; // Pontuação gamificada
  completedMissions?: string[]; // IDs das missões já resgatadas
}

export const DEFAULT_USER: User = {
  name: "Ana",
  email: "ana@empresa.com",
  avatar: "", 
  role: "Colaboradora",
  points: 0,
  completedMissions: []
};
