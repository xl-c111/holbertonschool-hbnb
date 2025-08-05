/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission behavior

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        // Send POST request to the login API
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password }) // Send credentials as JSON
        });

        if (response.ok) {
          const data = await response.json();
          // Store JWT token in cookie
          document.cookie = `token=${data.access_token}; path=/`;

          // Redirect to main page
          window.location.href = 'index.html';
        } else {
          // Login failed - show error message from response
          const errorText = await response.text();
          alert('Login failed: ' + errorText);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }
});
