/**
 * Application configuration
 */
export const config = {
    // API base URL - switches between dev and production
    API_URL: import.meta.env.VITE_API_URL || 'https://d145487492x221.cloudfront.net',

    // Local storage keys
    TOKEN_KEY: 'token'
};
