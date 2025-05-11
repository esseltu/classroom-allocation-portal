/**
 * Enhancement for booking display to show who booked each room
 * This script modifies the room display to show booking user information
 */

document.addEventListener("DOMContentLoaded", () => {
  // Only run on pages with room display
  if (!document.getElementById("roomGrid") && !window.location.href.includes("booking.html")) return

  // Wait for the page to fully initialize
  setTimeout(() => {
    enhanceBookingDisplay()
  }, 100)
})

/**
 * Enhance the booking display to show user information
 */
function enhanceBookingDisplay() {
  // Define all rooms data
  window.allRooms = [
    { id: "E101", block: "Block E", capacity: 30 },
    { id: "E102", block: "Block E", capacity: 30 },
    { id: "E103", block: "Block E", capacity: 30 },
    { id: "E104", block: "Block E", capacity: 30 },
    { id: "E201", block: "Block E", capacity: 40 },
    { id: "E202", block: "Block E", capacity: 40 },
    { id: "E203", block: "Block E", capacity: 40 },
    { id: "E204", block: "Block E", capacity: 40 },
    { id: "E301", block: "Block E", capacity: 50 },
    { id: "E302", block: "Block E", capacity: 50 },
    { id: "E303", block: "Block E", capacity: 50 },
    { id: "E304", block: "Block E", capacity: 50 },
    { id: "F102", block: "Block F", capacity: 35 },
    { id: "F103", block: "Block F", capacity: 35 },
    { id: "F104", block: "Block F", capacity: 35 },
    { id: "F201", block: "Block F", capacity: 45 },
    { id: "F202", block: "Block F", capacity: 45 },
    { id: "F301", block: "Block F", capacity: 55 },
    { id: "F302", block: "Block F", capacity: 55 },
    { id: "F303", block: "Block F", capacity: 55 },
    { id: "F304", block: "Block F", capacity: 55 },
    { id: "F403", block: "Block F", capacity: 60 },
    { id: "F404", block: "Block F", capacity: 60 },
  ]

  // Define our enhanced version of displayRooms
  window.displayRooms = () => {
    const roomGrid = document.getElementById("roomGrid")
    if (!roomGrid) return

    roomGrid.innerHTML = ""
    const bookings = JSON.parse(localStorage.getItem("sharedBookings") || '{"past":[],"current":[],"upcoming":[]}')
    const now = new Date()

    // Create map of booked rooms
    const bookedRooms = {}
    ;[...bookings.upcoming, ...bookings.current].forEach((booking) => {
      const endTime = new Date(`${booking.date}T${booking.endTime}`)
      if (now < endTime) {
        bookedRooms[booking.roomId] = {
          endTime: booking.endTime,
          bookedBy: booking.bookedBy,
          bookedByFullName: booking.bookedByFullName || booking.bookedBy,
          bookedByDepartment: booking.bookedByDepartment || "",
          timestamp: booking.timestamp,
        }
      }
    })

    // Get current user
    const auth = JSON.parse(localStorage.getItem("auth") || "{}")

    // Render each room
    window.allRooms.forEach((room) => {
      const isBooked = bookedRooms[room.id]
      const isMyBooking = isBooked && bookedRooms[room.id].bookedBy === auth.username

      const roomCard = document.createElement("div")
      roomCard.className = "room-card"
      roomCard.innerHTML = `
                <div class="room-icon">🏫</div>
                <h3>${room.id}</h3>
                <p>${room.block} • Capacity: ${room.capacity}</p>
                <span class="room-status ${isBooked ? "booked" : "available"}">
                    ${isBooked ? `Booked until ${bookedRooms[room.id].endTime}` : "Available"}
                </span>
                ${
                  isBooked
                    ? `
                    <div class="booked-by-info">
                        Booked by: ${bookedRooms[room.id].bookedByFullName}
                        ${bookedRooms[room.id].bookedByDepartment ? `(${bookedRooms[room.id].bookedByDepartment})` : ""}
                    </div>
                `
                    : ""
                }
                <button class="btn ${isBooked ? (isMyBooking ? "btn-cancel" : "btn-disabled") : "btn-book"}" 
                        ${isBooked && !isMyBooking ? "disabled" : ""}
                        data-room="${room.id}"
                        data-booking-id="${isBooked ? bookedRooms[room.id].timestamp : ""}">
                    ${isBooked ? (isMyBooking ? "Cancel Booking" : "Booked") : "Book Now"}
                </button>
            `

      // Add event listeners
      const button = roomCard.querySelector("button")
      if (isBooked && isMyBooking) {
        button.addEventListener("click", () => {
          window.cancelBooking(button.dataset.bookingId, room.id)
        })
      } else if (!isBooked) {
        button.addEventListener("click", () => {
          window.openBookingModal(room.id)
        })
      }

      roomGrid.appendChild(roomCard)
    })
  }

  // Define booking modal functions
  window.openBookingModal = (roomId) => {
    const bookingModal = document.querySelector(".booking-modal")
    if (!bookingModal) return

    const modalRoomId = document.getElementById("modal-room-id")
    if (modalRoomId) modalRoomId.textContent = roomId

    const today = new Date().toISOString().split("T")[0]
    const bookingDate = document.getElementById("booking-date")
    if (bookingDate) {
      bookingDate.value = today
      bookingDate.min = today
    }

    // Set default times (current hour to next hour)
    const now = new Date()
    const startTime = document.getElementById("start-time")
    const endTime = document.getElementById("end-time")

    if (startTime) {
      startTime.value = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    }

    if (endTime) {
      endTime.value = `${(now.getHours() + 1).toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    }

    bookingModal.classList.add("active")
  }

  // Define cancel booking function
  window.cancelBooking = (bookingId, roomId) => {
    if (!confirm(`Cancel booking for ${roomId}?`)) return

    const bookings = JSON.parse(localStorage.getItem("sharedBookings") || '{"past":[],"current":[],"upcoming":[]}')

    bookings.upcoming = bookings.upcoming.filter((b) => b.timestamp !== Number.parseInt(bookingId))
    bookings.current = bookings.current.filter((b) => b.timestamp !== Number.parseInt(bookingId))

    localStorage.setItem("sharedBookings", JSON.stringify(bookings))
    localStorage.setItem("bookings", JSON.stringify(bookings))

    // Trigger sync
    window.dispatchEvent(new StorageEvent("storage", { key: "bookings" }))

    if (typeof window.displayRooms === "function") {
      window.displayRooms()
    }
  }

  // Enhance the booking form submission
  const bookingForm = document.getElementById("booking-form")
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const auth = JSON.parse(localStorage.getItem("auth") || "{}")
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}")

      const roomId = document.getElementById("modal-room-id").textContent
      const date = document.getElementById("booking-date").value
      const startTime = document.getElementById("start-time").value
      const endTime = document.getElementById("end-time").value
      const purpose = document.getElementById("purpose").value

      if (startTime >= endTime) {
        alert("End time must be after start time")
        return
      }

      // Create booking with enhanced user information
      const booking = {
        roomId,
        date,
        startTime,
        endTime,
        purpose,
        bookedBy: auth.username,
        bookedByFullName: userDetails.fullName || auth.username,
        bookedByDepartment: userDetails.department || "",
        timestamp: Date.now(),
        status: "upcoming",
      }

      const bookings = JSON.parse(localStorage.getItem("sharedBookings") || '{"past":[],"current":[],"upcoming":[]}')
      bookings.upcoming.push(booking)

      // Update both shared and local bookings
      localStorage.setItem("sharedBookings", JSON.stringify(bookings))
      localStorage.setItem("bookings", JSON.stringify(bookings))

      // Close modal
      document.querySelector(".booking-modal").classList.remove("active")

      // Trigger sync
      window.dispatchEvent(new StorageEvent("storage", { key: "bookings" }))

      // If there's a displayRooms function, call it
      if (typeof window.displayRooms === "function") {
        window.displayRooms()
      }

      alert(`Successfully booked ${roomId} from ${startTime}-${endTime} on ${date}`)
    })

    // Close modal handlers
    const closeModalBtn = document.querySelector(".close-modal")
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        document.querySelector(".booking-modal").classList.remove("active")
      })
    }

    const bookingModal = document.querySelector(".booking-modal")
    if (bookingModal) {
      bookingModal.addEventListener("click", (e) => {
        if (e.target === bookingModal) {
          bookingModal.classList.remove("active")
        }
      })
    }
  }

  // Add search functionality
  const searchBtn = document.getElementById("searchBtn")
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const searchTerm = document.getElementById("roomSearch").value.toLowerCase()
      const blockFilter = document.getElementById("blockFilter").value

      document.querySelectorAll(".room-card").forEach((card) => {
        const roomId = card.querySelector("h3").textContent.toLowerCase()
        const block = card.querySelector("p").textContent
        const matchesSearch = roomId.includes(searchTerm)
        const matchesBlock = blockFilter === "" || block.includes(blockFilter)

        card.style.display = matchesSearch && matchesBlock ? "block" : "none"
      })
    })
  }

  // Call displayRooms if it exists
  if (typeof window.displayRooms === "function") {
    window.displayRooms()
  }

  // Set up auto-update every minute
  setInterval(() => {
    const now = new Date()
    const bookings = JSON.parse(localStorage.getItem("bookings") || '{"past":[],"current":[],"upcoming":[]}')
    let needsUpdate = false

    // Check upcoming -> current
    bookings.upcoming = bookings.upcoming.filter((booking) => {
      const start = new Date(`${booking.date}T${booking.startTime}`)
      if (now >= start) {
        booking.status = "current"
        bookings.current.push(booking)
        needsUpdate = true
        return false
      }
      return true
    })

    // Check current -> past
    bookings.current = bookings.current.filter((booking) => {
      const end = new Date(`${booking.date}T${booking.endTime}`)
      if (now >= end) {
        booking.status = "past"
        bookings.past.push(booking)
        needsUpdate = true
        return false
      }
      return true
    })

    if (needsUpdate) {
      localStorage.setItem("bookings", JSON.stringify(bookings))
      localStorage.setItem("sharedBookings", JSON.stringify(bookings))
      if (typeof window.displayRooms === "function") {
        window.displayRooms()
      }
    }
  }, 60000)
}

// Make the function globally available
window.enhanceBookingDisplay = enhanceBookingDisplay
