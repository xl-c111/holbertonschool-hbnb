/**
 * Form validation utilities
 */

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string|null} - Error message if invalid, null if valid
 */
export function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!regex.test(password)) {
        return 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character.';
    }
    return null;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Get password strength error message
 * @returns {string} - Error message
 */
export function getPasswordRequirements() {
    return 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character.';
}
