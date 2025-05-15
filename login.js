// login.js - Updated version
document.addEventListener('DOMContentLoaded', function () {
    console.log('Login page loaded'); // Log when the page is loaded

    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');

    if (!loginForm) {
        console.error('Login form not found'); // Log if the form is missing
        return;
    }

    // Form submission handler
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log('Login form submitted'); // Log when the form is submitted

        // Get input values
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        console.log('Username:', username); // Log the entered username
        console.log('Password:', password ? '***' : ''); // Log the password (masked)

        // Basic validation
        if (!username || !password) {
            console.warn('Username or password is missing'); // Log a warning if inputs are empty
            errorMessage.textContent = 'Please enter both username and password.';
            return;
        }

        try {
            // Send login request to the backend
            console.log('Sending login request to the backend...');
            const response = await fetch('http://localhost:5001/api/login', { // Replace with backend URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password }),
            });

            console.log('Login response status:', response.status); // Log the response status

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful:', data); // Log the successful response

                // Save user data to localStorage
                localStorage.setItem('auth', JSON.stringify({ isLoggedIn: true, userId: data.id }));
                localStorage.setItem('userDetails', JSON.stringify(data));

                // Redirect to the dashboard
                console.log('Redirecting to the dashboard...');
                window.location.href = 'index.html';
            } else {
                const error = await response.json();
                console.error('Login failed:', error); // Log the error response
                errorMessage.textContent = error.error || 'Login failed. Please try again.';
            }
        } catch (err) {
            console.error('Error during login:', err); // Log any unexpected errors
            errorMessage.textContent = 'An error occurred. Please try again later.';
        }
    });

    // Toggle password visibility
    const togglePasswordBtn = document.querySelector('.toggle-password');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle SVG icon
            this.innerHTML = type === 'password' ?
                `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>` :
                `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94L14.12 14.12M6.06 6.06L3 3M20 12C20 12 18.18 18.18 12 18.18C10.09 18.18 8.33 17.58 6.88 16.56L4.59 19.35M4 12C4 12 5.82 5.82 12 5.82C13.91 5.82 15.67 6.42 17.12 7.44L19.41 4.65" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;

            this.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
        });
    }

    // Add keydown event for Enter key on password field
    passwordInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});