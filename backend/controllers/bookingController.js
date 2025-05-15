const db = require('../config/sqlite');

// Create a booking
const createBooking = (req, res) => {
    console.log('[BOOKING] Create Booking Endpoint Hit'); // Log when the endpoint is hit
    console.log('[BOOKING] Request Body:', req.body); // Log the request body

    try {
        const { userId, classroomId, date, startTime, endTime, purpose } = req.body;

        const query = `
            INSERT INTO Booking (userId, classroomId, date, startTime, endTime, purpose)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = db.prepare(query).run(userId, classroomId, date, startTime, endTime, purpose);

        console.log('[BOOKING] Booking Created Successfully:', { id: result.lastInsertRowid }); // Log success
        res.status(201).json({ id: result.lastInsertRowid });
    } catch (err) {
        console.error('[BOOKING] Error Creating Booking:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Get all bookings
const getBookings = (req, res) => {
    console.log('[BOOKING] Get Bookings Endpoint Hit'); // Log when the endpoint is hit

    try {
        const query = `
            SELECT 
                Booking.id AS bookingId,
                Booking.classroomId,
                Classroom.name AS name,
                Booking.date,
                Booking.startTime,
                Booking.endTime,
                Booking.purpose,
                User.id AS userId,
                User.username,
                User.fullName,
                User.email,
                User.role,
                User.department,
                User.level
            FROM Booking
            JOIN User ON Booking.userId = User.id
            JOIN Classroom ON Booking.classroomId = Classroom.id;
        `;
        const rows = db.prepare(query).all();

        console.log('[BOOKING] Bookings Retrieved:', rows); // Log the retrieved bookings
        res.status(200).json(rows);
    } catch (err) {
        console.error('[BOOKING] Error Fetching Bookings:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Delete a booking
const deleteBooking = (req, res) => {
    try {
        const { id } = req.params;

        const query = `DELETE FROM Booking WHERE id = ?`;
        const result = db.prepare(query).run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (err) {
        console.error('Error deleting booking:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createBooking, getBookings, deleteBooking };