export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  phone?: string;
  image?: string;
  profilePicture?: string; // Add profilePicture field from backend
  healthProfile?: any;
}