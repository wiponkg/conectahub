
export type ViewState = 
  | 'LANDING' 
  | 'LOGIN' 
  | 'REGISTER' 
  | 'DASHBOARD_HOME' 
  | 'DASHBOARD_CALENDAR' 
  | 'DASHBOARD_RANKING' 
  | 'DASHBOARD_CHAT' 
  | 'DASHBOARD_POINTS';

export interface User {
  name: string;
  avatar: string;
  role?: string;
}

export const DEFAULT_USER: User = {
  name: "Ana",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200", 
  role: "Colaboradora"
};
