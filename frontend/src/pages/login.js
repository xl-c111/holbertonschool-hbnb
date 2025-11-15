/**
 * Login Page
 */
import { auth } from '../auth/index.js';
import { showMessage } from '../components/Message.js';

export async function initLoginPage() {
    const loginForm = document.getElementById('login-page');
    if (!loginForm) return;

    loginForm.addEventListener('submit', handleLoginSubmit);
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginLoading = document.getElementById('loginLoading');

    // Disable button and show loading state
    loginBtn.disabled = true;
    loginText.classList.add('hidden');
    loginLoading.classList.remove('hidden');

    try {
        console.log('Attempting login with:', { email });
        await auth.login(email, password);

        // Login successful - redirect to home
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.message || 'Please try again'));
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        loginText.classList.remove('hidden');
        loginLoading.classList.add('hidden');
    }
}
