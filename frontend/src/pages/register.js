/**
 * Registration Page
 */
import { auth } from '../auth/index.js';
import { validatePassword } from '../utils/validation.js';

export async function initRegisterPage() {
    const registerForm = document.getElementById('register-page');
    if (!registerForm) return;

    console.log('Registration form found, attaching event listener');
    registerForm.addEventListener('submit', handleRegisterSubmit);
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    console.log('Registration form submitted');

    const firstName = document.getElementById('first_name').value.trim();
    const lastName = document.getElementById('last_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const registerBtn = document.getElementById('registerBtn');
    const registerText = document.getElementById('registerText');
    const registerLoading = document.getElementById('registerLoading');
    const messageDiv = document.getElementById('message');

    // Client-side validation
    if (password !== confirmPassword) {
        showError(messageDiv, 'Passwords do not match!');
        return;
    }

    // Validate password complexity
    const passwordError = validatePassword(password);
    if (passwordError) {
        showError(messageDiv, passwordError);
        return;
    }

    // Disable button and show loading state
    registerBtn.disabled = true;
    registerText.classList.add('hidden');
    registerLoading.classList.remove('hidden');

    try {
        console.log('Attempting registration with:', { firstName, lastName, email });
        await auth.register({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password
        });

        // Show success message
        showSuccess(messageDiv, 'Registration successful! Redirecting to login...');

        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        console.error('Registration error:', error);
        showError(messageDiv, error.message || 'Registration failed. Please try again.');
    } finally {
        // Reset button state
        registerBtn.disabled = false;
        registerText.classList.remove('hidden');
        registerLoading.classList.add('hidden');
    }
}

function showError(messageDiv, text) {
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = 'message error';
        messageDiv.classList.remove('hidden');
    }
}

function showSuccess(messageDiv, text) {
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = 'message success';
        messageDiv.classList.remove('hidden');
    }
}
