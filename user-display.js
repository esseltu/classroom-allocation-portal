/**
 * User Display Script
 * Handles user authentication and profile display
 */

document.addEventListener("DOMContentLoaded", () => {
    // Check authentication
    const auth = JSON.parse(localStorage.getItem("auth") || "{}")
  
    // Redirect to login if not authenticated (except on login page)
    if (!auth.isLoggedIn && !window.location.href.includes("Login.html")) {
      window.location.href = "Login.html"
      return
    }
  
    // Update user display if authenticated
    if (auth.isLoggedIn) {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}")
      updateUserDisplay(userDetails)
    }
  })
  
  /**
   * Update user information display on the page
   * @param {Object} details - User details object
   */
  function updateUserDisplay(details) {
    const nameEl = document.getElementById("userFullName")
    const roleEl = document.getElementById("userRoleInfo")
  
    if (nameEl) nameEl.textContent = details.fullName || "User"
    if (roleEl) {
      roleEl.textContent = [details.role, details.department, details.level && `Level ${details.level}`]
        .filter(Boolean)
        .join(" • ")
    }
  }
  
  // Make function globally available
  window.updateUserDisplay = updateUserDisplay
  