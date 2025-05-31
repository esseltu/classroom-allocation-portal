import { getEnhancedBookings } from './booking-display-enhancement.js';

document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.manage-bookings')) return;
    
    // Initial load
    displayUserBookings();
    
    // Refresh every minute
    const interval = setInterval(displayUserBookings, 60000);
    window.addEventListener('beforeunload', () => clearInterval(interval));
    
    // Event listeners for updates
    document.addEventListener('bookingUpdated', displayUserBookings);
    window.addEventListener('storage', (e) => {
        if (e.key === 'bookings') displayUserBookings();
    });
});

async function displayUserBookings() {
    try {
        const auth = JSON.parse(localStorage.getItem('auth'));
        if (!auth?.username) return;

        // Use the enhanced booking retrieval logic
        const bookings = await getEnhancedBookings(auth.username);

        const now = new Date();
        const userBookings = bookings.sort((a, b) => 
            new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`)
        );

        updateBookingDisplay(userBookings, now);
    } catch (error) {
        console.error("Booking load error:", error);
        document.getElementById('userBookings').innerHTML = `
            <div class="error">
                Failed to load bookings. <button onclick="location.reload()">Retry</button>
            </div>`;
    }
}

function updateBookingDisplay(bookings, now) {
    const container = document.getElementById('userBookings');
    const nextBookingEl = document.getElementById('nextBooking');

    container.innerHTML = bookings.length ? '' : 
        '<div class="no-bookings">No active bookings found</div>';

    nextBookingEl.textContent = bookings.length ? 
        `${bookings[0].roomId} - ${bookings[0].date} (${bookings[0].startTime}-${bookings[0].endTime})` : 
        'No upcoming bookings';

    bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-icon">🏫</div>
            <h3>${booking.roomId}</h3>
            <p class="booking-date">${booking.date}</p>
            <p class="booking-time">${booking.startTime} - ${booking.endTime}</p>
            <p>Purpose: ${booking.purpose || 'Not specified'}</p>
            <button class="btn btn-cancel" onclick="cancelBooking(${booking.timestamp})">
                Cancel Booking
            </button>
        `;
        container.appendChild(card);
    });
}

function cancelBooking(bookingId) {
    try {
        const bookings = JSON.parse(localStorage.getItem('bookings'));
        
        ['upcoming', 'current'].forEach(type => {
            bookings[type] = bookings[type].filter(b => b.timestamp !== bookingId);
        });
        
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Trigger updates
        const event = new Event('bookingUpdated');
        document.dispatchEvent(event);
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'bookings'
        }));
    } catch (error) {
        alert("Failed to cancel booking");
        console.error(error);
    }
}

// Make cancelBooking available globally
window.cancelBooking = cancelBooking;
