/**
 * User Display Script
 * Handles user authentication and profile display
 */

document.addEventListener("DOMContentLoaded", async () => {
    console.log('User display script loaded'); // Log when the script is loaded

    const auth = JSON.parse(localStorage.getItem("auth") || "{}");
    console.log('Auth data:', auth); // Log the auth data

    if (!auth.isLoggedIn && !window.location.href.includes("Login.html")) {
        console.warn('User not logged in, redirecting to login page'); // Log redirection
        window.location.href = "Login.html";
        return;
    }

    if (auth.isLoggedIn) {
        try {
            console.log('Fetching user details from backend...');
            const response = await fetch(`https://classroom-allocation-portal.onrender.com/api/user/${auth.userId}`);
            const userDetails = await response.json();
            console.log('User details fetched:', userDetails); // Log the fetched user details
            updateUserDisplay(userDetails);
        } catch (error) {
            console.error('Error fetching user details:', error); // Log any errors
        }
    }
});

/**
 * Update user information display on the page
 * @param {Object} details - User details object
 */
function updateUserDisplay(details) {
    console.log('Updating user display'); // Log the details being displayed
    const nameEl = document.getElementById("userFullName");
    const roleEl = document.getElementById("userRoleInfo");

    if (nameEl) nameEl.textContent = details.fullName || "User";
    if (roleEl) {
        roleEl.textContent = [details.role, details.department, details.level && `Level ${details.level}`]
            .filter(Boolean)
            .join(" • ");
    }
}

// Make function globally available
window.updateUserDisplay = updateUserDisplay;
