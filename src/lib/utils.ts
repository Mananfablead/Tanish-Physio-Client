import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Guest user utilities
export const setGuestUserData = (userData: { name: string; email: string; phone: string }) => {
  try {
    sessionStorage.setItem('qw_guest_user', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save guest user data:', error);
  }
};

export const getGuestUserData = () => {
  try {
    const guestData = sessionStorage.getItem('qw_guest_user');
    return guestData ? JSON.parse(guestData) : null;
  } catch (error) {
    console.error('Failed to retrieve guest user data:', error);
    return null;
  }
};

export const clearGuestUserData = () => {
  try {
    sessionStorage.removeItem('qw_guest_user');
  } catch (error) {
    console.error('Failed to clear guest user data:', error);
  }
};

export const isGuestUser = () => {
  // Check if there's no logged-in user but there is guest data
  const isLoggedIn = localStorage.getItem('token') !== null;
  const hasGuestData = sessionStorage.getItem('qw_guest_user') !== null;
  
  return !isLoggedIn && hasGuestData;
};

// Utility to transition guest user to logged-in user after successful payment
export const transitionGuestToLoggedIn = (token: string, user: any) => {
  // Store auth token
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Clear guest data after successful transition
  clearGuestUserData();
  
  // Update auth context
  return { token, user };
};
