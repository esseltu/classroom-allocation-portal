/**
 * Enhancement for booking display to show who booked each room
 * This script modifies the room display to show booking user information
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log('Booking display enhancement script loaded'); // Log when the script is loaded

  if (!document.getElementById("roomGrid") && !window.location.href.includes("booking.html")) {
    console.warn('Room grid not found or not on booking page'); // Log if not on the booking page
    return;
  }

  setTimeout(() => {
    console.log('Loading blocks and classrooms...');
    loadBlocks();
    enhanceBookingDisplay();
  }, 100);
});

// Declare bookedRooms at the top so it's accessible everywhere
let bookedRooms = {};

// Cancel booking function
function cancelBooking(bookingId, classroomId) {
  console.log('Canceling booking:', bookingId);
  
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  const bookings = JSON.parse(localStorage.getItem('bookings'));
  bookings.upcoming = bookings.upcoming.filter(b => b.bookingId !== bookingId);
  bookings.current = bookings.current.filter(b => b.bookingId !== bookingId);
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  // Also send DELETE request to backend to remove booking
  fetch(`https://classroom-allocation-portal.onrender.com/api/booking/${bookingId}`, {
      method: 'DELETE',
  })
  .then(response => {
      if (!response.ok) throw new Error('Failed to delete booking from server');
      console.log('Booking deleted from database');
  })
  .catch(error => {
      console.error('Error deleting booking from database:', error);
  });

  // Update the class availability to available
  fetch(`https://classroom-allocation-portal.onrender.com/api/classroom/${classroomId}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ available: 1 })
  })
  .then(response => {
      if (!response.ok) throw new Error('Failed to update classroom availability');
      console.log('Classroom availability updated');
      window.location.reload();
  })
  .catch(error => {
      console.error('Error updating classroom availability:', error);
  });
}

// Fetch and populate blocks in the dropdown
async function loadBlocks() {
  console.log('Fetching blocks from backend...'); // Log block fetch
  try {
    const blockFilter = document.getElementById("blockFilter");
    if (!blockFilter) {
      console.warn('Block filter dropdown not found'); // Log if dropdown is missing
      return;
    }

    const response = await fetch('https://classroom-allocation-portal.onrender.com/api/block');
    const blocks = await response.json();
    console.log('Blocks fetched:', blocks); // Log the fetched blocks

    blocks.forEach((block) => {
      const option = document.createElement("option");
      option.value = block.name;
      option.textContent = block.name;
      blockFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching blocks:", error); // Log any errors
  }
}

// Fetch and display classrooms
async function enhanceBookingDisplay() {
  console.log('Fetching classrooms and bookings from backend...'); // Log classroom and booking fetch
  try {
    const roomGrid = document.getElementById("roomGrid");
    if (!roomGrid) {
      console.warn('Room grid not found'); // Log if room grid is missing
      return;
    }

    roomGrid.innerHTML = "<div class='loading-message'>Loading classrooms...</div>";

    // Fetch classrooms and bookings from the API
    const [classroomsResponse, bookingsResponse] = await Promise.all([
      fetch('https://classroom-allocation-portal.onrender.com/api/classroom'),
      fetch('https://classroom-allocation-portal.onrender.com/api/booking'),
    ]);

    const classrooms = await classroomsResponse.json();
    const bookings = await bookingsResponse.json();
    console.log('Classrooms fetched:', classrooms); // Log the fetched classrooms
    console.log('Bookings fetched:', bookings); // Log the fetched bookings

    const now = new Date();

    // Add search and filter functionality after classrooms are rendered
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function() {
        const searchTerm = document.getElementById('roomSearch').value.toLowerCase();
        const blockFilterValue = document.getElementById('blockFilter').value;

        document.querySelectorAll('.room-card').forEach(card => {
          const roomName = card.querySelector('h3').textContent.toLowerCase();
          const blockText = card.querySelector('p').textContent;
          const matchesSearch = roomName.includes(searchTerm);
          const matchesBlock = blockFilterValue === '' || blockText.includes(blockFilterValue);

          card.style.display = (matchesSearch && matchesBlock) ? 'block' : 'none';
        });
      });
    }
      
    // Map bookings by classroom ID
    bookedRooms = {}; // <-- Remove 'const', just assign to the global variable
    bookings.forEach((booking) => {
      const endTime = new Date(`${booking.date}T${booking.endTime}`);
      if (now < endTime) {
        if (!bookedRooms[booking.classroomId]) bookedRooms[booking.classroomId] = [];
        bookedRooms[booking.classroomId].push({
          startTime: booking.startTime,
          endTime: booking.endTime,
          bookedBy: booking.fullName,
          bookedByID: booking.userId,
          purpose: booking.purpose,
          bookingId: booking.bookingId,
          date: booking.date,
        });
      }
    });

    // Render classrooms
    roomGrid.innerHTML = '';
    classrooms.forEach((room) => {
      const bookingsForRoom = bookedRooms[room.id] || [];
      const isBooked = bookingsForRoom.length > 0;
      const auth = JSON.parse(localStorage.getItem('auth')) || {};
      const isUserBooked = bookingsForRoom.some(b => b.bookedByID === auth.userId);

      const roomCard = document.createElement('div');
      roomCard.className = 'room-card';
      roomCard.innerHTML = `
        <div class="room-icon">🏫</div>
        <h3>${room.name}</h3>
        <p>${room.block} • Capacity: ${room.capacity}</p>
        <div class="room-status-list">
          ${
            isBooked
              ? bookingsForRoom.map(b => `
                  <span class="room-status booked">
                    Booked: ${b.startTime} - ${b.endTime} by ${b.bookedBy}
                  </span>
                `).join('')
              : `<span class="room-status available">Available</span>`
          }
        </div>
        ${
          isUserBooked
            ? `<div class="booked-by-info">Booked by: You</div>`
            : ''
        }
        <button class="btn ${
          isUserBooked ? 'btn-cancel' : 'btn-book'
        }"
          data-booking-id="${(bookingsForRoom.find(b => b.bookedByID === auth.userId) || {}).bookingId || ''}"
          data-classroom-id="${room.id}"
          data-room="${room.name}">
          ${
            isUserBooked
              ? 'Cancel Booking'
              : 'Book Now'
          }
        </button>
      `;

      // Add event listener for booking
      const button = roomCard.querySelector('button');
      if (isUserBooked) {
        // Cancel logic as before
        const cancelButton = roomCard.querySelector('.btn-cancel');
        if (cancelButton) {
          cancelButton.addEventListener('click', () => {
            cancelBooking(parseInt(cancelButton.dataset.bookingId), parseInt(cancelButton.dataset.classroomId));
          });
        }
      } else {
        // Always allow booking (modal will prevent overlaps)
        button.addEventListener('click', () => openBookingModal(room.name, room.id));
      }

      roomGrid.appendChild(roomCard);
    });
  } catch (error) {
    console.error('Error fetching data:', error); // Log any errors
    document.getElementById('roomGrid').innerHTML = '<div class="error">Failed to load data. Please try again later.</div>';
  }
}

async function openBookingModal(roomName, roomId) {
  const bookingModal = document.querySelector('.booking-modal');
  const modalRoomId = document.getElementById('modal-room-id');
  modalRoomId.textContent = roomName;

  const roomID = roomId;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('booking-date').value = today;
  document.getElementById('booking-date').min = today;

  bookingModal.classList.add('active');

  const bookingForm = document.getElementById('booking-form');
  bookingForm.onsubmit = async (e) => {
    e.preventDefault();

    const date = document.getElementById('booking-date').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const purpose = document.getElementById('purpose').value;

    // Get all bookings for this room and date
    const bookingsForRoom = (bookedRooms[roomID] || []).filter(b => {
      // Only check for the same date
      return b.date === date;
    });

    // Check for time overlap
    const overlap = bookingsForRoom.some(b => {
      // If newStart < existingEnd && newEnd > existingStart, there is overlap
      return (startTime < b.endTime && endTime > b.startTime);
    });

    if (overlap) {
      alert('This room is already booked for part or all of the selected time period. Please choose a different time.');
      return;
    }

    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const userId = auth.userId;
      console.log(userId);

      // Proceed with booking
      const response = await fetch('https://classroom-allocation-portal.onrender.com/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId: roomID,
          date,
          startTime,
          endTime,
          purpose,
          userId: auth.userId,
        }),
      });

      if (response.ok) {
        // Update the availability of the classroom
        const updateResponse = await fetch(`https://classroom-allocation-portal.onrender.com/api/classroom/${roomID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available: '0' }),
        });

        if (updateResponse.ok) {
          alert('Booking successful and classroom marked as unavailable!');
          bookingModal.classList.remove('active');
          enhanceBookingDisplay();
        } else {
          const updateError = await updateResponse.json();
          alert(`Error updating classroom availability: ${updateError.message}`);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const closeModalButton = bookingModal.querySelector('.close-modal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      bookingModal.classList.remove('active');
    });
  }
}