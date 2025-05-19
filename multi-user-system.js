/**
 * Multi-User System for Classroom Allocation Prototype
 * This script enables multiple users to coexist in the system
 * and see each other's bookings without overwriting data.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the multi-user system
  initMultiUserSystem()

  // Add user switcher to header if on authenticated pages
  const auth = JSON.parse(localStorage.getItem("auth") || "{}")
  if (auth.isLoggedIn && !window.location.href.includes("Login.html")) {
    addUserSwitcherToHeader()
  }
})

/**
 * Initialize the multi-user system
 * Sets up the shared booking storage and migrates existing data
 */
function initMultiUserSystem() {
  // Initialization logic removed as per instructions
}

/**
 * Add user switcher to the header
 * This allows switching between users during a presentation
 */
function addUserSwitcherToHeader() {
  const header = document.querySelector(".header")
  if (!header) return

  const auth = JSON.parse(localStorage.getItem("auth") || "{}")
  const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}")

  // Fetch current user details from the API route if available
  if (auth.isLoggedIn && auth.username) {
    // Try to fetch user details from the backend route
    fetch('https://classroom-allocation-portal.onrender.com/api/user/current', {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(apiUser => {
        // No localStorage manipulation per instructions
      })
      .catch(() => {
        // Fallback logic removed as per instructions
      })
  }

  // Create user switcher button
  const userSwitcherBtn = document.createElement("div")
  userSwitcherBtn.className = "user-switcher-btn"
  userSwitcherBtn.innerHTML = `
        <div class="user-avatar-small">👤</div>
        <span class="user-name-small">${userDetails.fullName || auth.username}</span>
    `

  // Add to header
  header.appendChild(userSwitcherBtn)

  // Since registeredUsers from localStorage is removed, we can't list users
  // So render modal with only current user info

  const userSwitcherModal = document.createElement("div")
  userSwitcherModal.className = "user-switcher-modal"
  userSwitcherModal.innerHTML = `
        <div class="user-switcher-content">
            <div class="user-switcher-header">
                <h3>Switch User</h3>
                <button class="close-user-switcher">&times;</button>
            </div>
            <div class="user-list">
                <div class="user-item active-user" data-username="${auth.username}">
                    <div class="user-avatar-small">👤</div>
                    <div class="user-info">
                        <div class="user-name">${userDetails.fullName || auth.username}</div>
                        <div class="user-role">${userDetails.role || "User"} ${userDetails.department ? "• " + userDetails.department : ""}</div>
                    </div>
                    <button class="btn btn-small btn-disabled" disabled>Current</button>
                </div>
            </div>
            <div class="user-switcher-footer">
                <button class="btn btn-logout">Log Out</button>
            </div>
        </div>
    `

  document.body.appendChild(userSwitcherModal)

  // Event listeners
  userSwitcherBtn.addEventListener("click", () => {
    userSwitcherModal.classList.add("active")
  })

  userSwitcherModal.querySelector(".close-user-switcher").addEventListener("click", () => {
    userSwitcherModal.classList.remove("active")
  })

  userSwitcherModal.querySelector(".btn-close-modal").addEventListener("click", () => {
    userSwitcherModal.classList.remove("active")
  })

  userSwitcherModal.querySelector(".btn-logout").addEventListener("click", () => {
    // Clear current session
    localStorage.removeItem("auth")
    localStorage.removeItem("userDetails")

    // Redirect to login
    window.location.href = "Login.html"
  })

  // Switch user buttons removed as no other users to switch to

  // Close when clicking outside
  userSwitcherModal.addEventListener("click", (e) => {
    if (e.target === userSwitcherModal) {
      userSwitcherModal.classList.remove("active")
    }
  })
}

// Removed saveUserData and loadUserData functions and their usage

// Removed checkUserSession function and its call

// Check if we're on the login page and enhance it
if (window.location.href.includes("Login.html")) {
  document.addEventListener("DOMContentLoaded", enhanceLoginProcess)
}

/**
 * Modify the login process to support multiple users
 * This function is automatically called when the script loads on the login page
 */
function enhanceLoginProcess() {
  // Only run on login page
  if (!document.getElementById("loginForm")) return

  const loginForm = document.getElementById("loginForm")

  // Store the original onsubmit handler
  const originalOnsubmit = loginForm.onsubmit

  // Override the form submission
  loginForm.onsubmit = function (e) {
    e.preventDefault()

    const username = document.getElementById("username").value.trim()
    const password = document.getElementById("password").value.trim()

    // Basic validation
    if (!username || !password) {
      const errorMessage = document.getElementById("errorMessage")
      if (errorMessage) {
        errorMessage.textContent = "Please enter both username and password."
        errorMessage.style.display = "block"
      }
      return
    }

    // Only validate password (using 'password' for all users in this prototype)
    if (password === "password") {
      // Simulate loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]')
      submitBtn.textContent = "Signing in..."
      submitBtn.disabled = true

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "index.html"
      }, 800)

      return
    }

    // If we get here, the password is wrong
    // Fall back to the original login handler if it exists
    if (typeof originalOnsubmit === "function") {
      return originalOnsubmit.call(this, e)
    } else {
      // Default error handling
      const errorMessage = document.getElementById("errorMessage")
      if (errorMessage) {
        errorMessage.textContent = "Invalid credentials. Please try again."
        errorMessage.style.display = "block"
      }
    }
  }
}
