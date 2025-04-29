// user-display.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = JSON.parse(localStorage.getItem('auth')) || {};
    
    if (!auth.isLoggedIn) {
        window.location.href = 'Login.html';
        return;
    }

    const userDetails = JSON.parse(localStorage.getItem('userDetails')) || {};
    updateUserDisplay(userDetails);
});

function updateUserDisplay(details) {
    const nameEl = document.getElementById('userFullName');
    const roleEl = document.getElementById('userRoleInfo');
    
    if (nameEl) nameEl.textContent = details.fullName || 'User';
    if (roleEl) {
        roleEl.textContent = [
            details.role,
            details.department,
            details.level && `Level ${details.level}`
        ].filter(Boolean).join(' • ');
    }
}