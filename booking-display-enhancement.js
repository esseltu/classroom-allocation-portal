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

// Fetch and populate blocks in the dropdown
async function loadBlocks() {
  console.log('Fetching blocks from backend...'); // Log block fetch
  try {
    const blockFilter = document.getElementById("blockFilter");
    if (!blockFilter) {
      console.warn('Block filter dropdown not found'); // Log if dropdown is missing
      return;
    }

    const response = await fetch('http://localhost:5001/api/block');
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
      fetch('http://localhost:5001/api/classroom'),
      fetch('http://localhost:5001/api/booking'),
    ]);

    const classrooms = await classroomsResponse.json();
    const bookings = await bookingsResponse.json();
    console.log('Classrooms fetched:', classrooms); // Log the fetched classrooms
    console.log('Bookings fetched:', bookings); // Log the fetched bookings

    const now = new Date();

    // Map bookings by classroom ID
    const bookedRooms = {};
    bookings.forEach((booking) => {
      const endTime = new Date(`${booking.date}T${booking.endTime}`);
      if (now < endTime) {
        bookedRooms[booking.classroomId] = {
          endTime: booking.endTime,
          bookedBy: booking.fullName,
          purpose: booking.purpose,
        };
      }
    });

    // Render classrooms
    roomGrid.innerHTML = '';
    classrooms.forEach((room) => {
      const isBooked = bookedRooms[room.id];
      const roomCard = document.createElement('div');
      roomCard.className = 'room-card';
      roomCard.innerHTML = `
        <div class="room-icon">🏫</div>
        <h3>${room.name}</h3>
        <p>${room.block} • Capacity: ${room.capacity}</p>
        <span class="room-status ${isBooked ? 'booked' : 'available'}">
          ${isBooked ? `Booked until ${isBooked.endTime}` : 'Available'}
        </span>
        ${
          isBooked
            ? `<div class="booked-by-info">Booked by: ${isBooked.bookedBy}</div>`
            : ''
        }
        <button class="btn ${isBooked ? 'btn-disabled' : 'btn-book'}" 
                ${isBooked ? 'disabled' : ''} 
                data-room="${room.name}">
          ${isBooked ? 'Booked' : 'Book Now'}
        </button>
      `;

      // Add event listener for booking
      const button = roomCard.querySelector('button');
      if (!isBooked) {
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

    try {
      const auth = JSON.parse(localStorage.getItem('auth'));
      const userId = auth.userId;
      console.log(userId);

      // Proceed with booking
      const response = await fetch('http://localhost:5001/api/booking', {
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
        const updateResponse = await fetch(`http://localhost:5001/api/classroom/${roomID}`, {
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
}