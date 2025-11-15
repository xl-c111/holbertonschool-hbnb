/**
 * Cookie utility functions
 */

/**
 * Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null
 */
export function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}

/**
 * Set cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiration in days (optional)
 */
export function setCookie(name, value, days = 7) {
    const expires = days
        ? `; expires=${new Date(Date.now() + days * 864e5).toUTCString()}`
        : '';
    document.cookie = `${name}=${value}${expires}; path=/`;
}

/**
 * Delete cookie
 * @param {string} name - Cookie name
 */
export function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
