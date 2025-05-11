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
  // Create shared bookings storage if it doesn't exist
  if (!localStorage.getItem("sharedBookings")) {
    // Migrate existing bookings to shared storage
    const existingBookings = JSON.parse(localStorage.getItem("bookings") || '{"past":[],"current":[],"upcoming":[]}')
    localStorage.setItem("sharedBookings", JSON.stringify(existingBookings))
  } else {
    // Ensure bookings is synced with sharedBookings
    localStorage.setItem("bookings", localStorage.getItem("sharedBookings"))
  }

  // Create users registry if it doesn't exist
  if (!localStorage.getItem("registeredUsers")) {
    localStorage.setItem("registeredUsers", JSON.stringify([]))
  }

  // Store the current user's username to prevent unintended switching
  const auth = JSON.parse(localStorage.getItem("auth") || "{}")
  if (auth.isLoggedIn && auth.username) {
    sessionStorage.setItem("currentUser", auth.username)
  }
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

  // Get registered users
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

  // Add current user to registered users if not already there
  if (auth.isLoggedIn && auth.username) {
    const existingUser = registeredUsers.find((u) => u.username === auth.username)
    if (!existingUser) {
      registeredUsers.push({
        username: auth.username,
        fullName: userDetails.fullName || auth.username,
        role: userDetails.role || "User",
        department: userDetails.department || "",
        level: userDetails.level || "",
        timestamp: Date.now(),
      })
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
    }
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

  // Create user switcher modal
  const userSwitcherModal = document.createElement("div")
  userSwitcherModal.className = "user-switcher-modal"
  userSwitcherModal.innerHTML = `
        <div class="user-switcher-content">
            <div class="user-switcher-header">
                <h3>Switch User</h3>
                <button class="close-user-switcher">&times;</button>
            </div>
            <div class="user-list">
                ${registeredUsers
                  .map(
                    (user) => `
                    <div class="user-item ${auth.username === user.username ? "active-user" : ""}" data-username="${
                      user.username
                    }">
                        <div class="user-avatar-small">👤</div>
                        <div class="user-info">
                            <div class="user-name">${user.fullName || user.username}</div>
                            <div class="user-role">${user.role || "User"} ${
                              user.department ? "• " + user.department : ""
                            }</div>
                        </div>
                        <button class="btn btn-small ${auth.username === user.username ? "btn-disabled" : "btn-switch"}" 
                                ${auth.username === user.username ? "disabled" : ""}>
                            ${auth.username === user.username ? "Current" : "Switch"}
                        </button>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <div class="user-switcher-footer">
                <button class="btn btn-logout">Log Out</button>
                <button class="btn btn-close-modal">Close</button>
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
    // Save user data before logout
    saveUserData(auth.username)

    // Clear current session
    localStorage.removeItem("auth")
    localStorage.removeItem("userDetails")
    sessionStorage.removeItem("currentUser")

    // Redirect to login
    window.location.href = "Login.html"
  })

  // Switch user functionality
  userSwitcherModal.querySelectorAll(".btn-switch").forEach((btn) => {
    btn.addEventListener("click", () => {
      const userItem = btn.closest(".user-item")
      const username = userItem.dataset.username

      // Save current user data
      saveUserData(auth.username)

      // Load selected user data
      loadUserData(username)

      // Store the new current user
      sessionStorage.setItem("currentUser", username)

      // Reload page to apply changes
      window.location.reload()
    })
  })

  // Close when clicking outside
  userSwitcherModal.addEventListener("click", (e) => {
    if (e.target === userSwitcherModal) {
      userSwitcherModal.classList.remove("active")
    }
  })
}

/**
 * Save user data to localStorage
 * @param {string} username - Username to save data for
 */
function saveUserData(username) {
  if (!username) return

  const userKey = `user_${username}`
  localStorage.setItem(
    userKey,
    JSON.stringify({
      auth: JSON.parse(localStorage.getItem("auth") || "{}"),
      userDetails: JSON.parse(localStorage.getItem("userDetails") || "{}"),
    }),
  )
}

/**
 * Load user data from localStorage
 * @param {string} username - Username to load data for
 */
function loadUserData(username) {
  if (!username) return

  const userKey = `user_${username}`
  const userData = JSON.parse(localStorage.getItem(userKey) || "{}")

  if (userData.auth) {
    localStorage.setItem("auth", JSON.stringify(userData.auth))
  }

  if (userData.userDetails) {
    localStorage.setItem("userDetails", JSON.stringify(userData.userDetails))
  }
}

/**
 * Check if we need to restore the previous user's session
 * This prevents unintended user switching on page refresh
 */
function checkUserSession() {
  // Only check if we're not on the login page
  if (window.location.href.includes("Login.html")) return

  const auth = JSON.parse(localStorage.getItem("auth") || "{}")
  const currentUser = sessionStorage.getItem("currentUser")

  // If there's a mismatch between the current auth and the stored user,
  // and we have a stored user, restore that user's session
  if (auth.isLoggedIn && currentUser && auth.username !== currentUser) {
    console.log("Restoring session for user:", currentUser)
    loadUserData(currentUser)
    window.location.reload()
  }
}

// Check if we're on the login page and enhance it
if (window.location.href.includes("Login.html")) {
  document.addEventListener("DOMContentLoaded", enhanceLoginProcess)
} else {
  // Check user session to prevent unintended switching
  checkUserSession()
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

    // Check if user exists
    const userKey = `user_${username}`
    const userData = JSON.parse(localStorage.getItem(userKey) || "{}")

    // If user exists and password is correct (using 'password' for all users in this prototype)
    if (password === "password") {
      // Get registered users
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

      // Create auth data
      const loginData = {
        isLoggedIn: true,
        username: username,
        timestamp: new Date().getTime(),
      }

      // Create or update user details
      let userDetails

      if (userData.userDetails) {
        // Use existing user details
        userDetails = userData.userDetails
      } else {
        // Create new user details
        userDetails = {
          fullName: username,
          role: "Course Rep",
          department: "Computer Science",
          level: "300",
        }
      }

      // Save to localStorage
      localStorage.setItem("auth", JSON.stringify(loginData))
      localStorage.setItem("userDetails", JSON.stringify(userDetails))

      // Store the current user in sessionStorage to prevent unintended switching
      sessionStorage.setItem("currentUser", username)

      // Save user data
      saveUserData(username)

      // Add to registered users if not already there
      if (!registeredUsers.find((u) => u.username === username)) {
        registeredUsers.push({
          username: username,
          fullName: userDetails.fullName,
          role: userDetails.role,
          department: userDetails.department,
          level: userDetails.level,
          timestamp: Date.now(),
        })
        localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
      }

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

    // If we get here, either the user doesn't exist or the password is wrong
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

// Make these functions globally available
window.saveUserData = saveUserData
window.loadUserData = loadUserData
