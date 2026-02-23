// JWT Token Expiration Utility
// Handles automatic logout when JWT tokens expire

import jwt from "jsonwebtoken";

/**
 * Checks if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Gets remaining time until token expiration in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - milliseconds until expiration, or 0 if expired
 */
export const getTokenTimeRemaining = (token: string): number => {
  if (!token) return 0;

  try {
    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Date.now() / 1000;
    const timeRemaining = (decoded.exp - currentTime) * 1000;
    return Math.max(0, timeRemaining);
  } catch (error) {
    console.error("Error decoding token:", error);
    return 0;
  }
};

/**
 * Creates a token expiration watcher that automatically logs out when token expires
 * @param {string} token - JWT token
 * @param {Function} logoutCallback - Function to call when token expires
 * @returns {Function} - Function to stop the watcher
 */
export const createTokenExpirationWatcher = (
  token: string,
  logoutCallback: () => void
): (() => void) => {
  if (!token) {
    logoutCallback();
    return () => {};
  }

  const timeRemaining = getTokenTimeRemaining(token);

  if (timeRemaining <= 0) {
    // Token already expired
    logoutCallback();
    return () => {};
  }

  // Set timeout to logout when token expires
  const timeoutId = setTimeout(() => {
    console.log("Token expired, logging out automatically");
    logoutCallback();
  }, timeRemaining);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
};

/**
 * Interceptor for API calls to check token expiration
 * @param {Function} logoutCallback - Function to call when token is expired
 * @returns {Function} - Interceptor function
 */
// export const createTokenExpirationInterceptor = (
//   logoutCallback: () => void
// ) => {
//   return (error: any) => {
//     // Check if error is 401 Unauthorized
//     if (error.response?.status === 401) {
//       const token = localStorage.getItem("token");

//       // If we have a token but got 401, it's likely expired
//       if (token) {
//         console.log("401 Unauthorized - checking if token is expired");

//         if (isTokenExpired(token)) {
//           console.log("Token is expired, logging out automatically");
//           logoutCallback();
//           return Promise.reject(new Error("Token expired"));
//         }
//       }
//     }

//     // For other errors, just reject normally
//     return Promise.reject(error);
//   };
// };
