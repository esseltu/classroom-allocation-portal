const db = require('../config/sqlite');

// Create the Booking table if it doesn't exist
const createBookingTableQuery = `
    CREATE TABLE IF NOT EXISTS Booking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        classroomId INTEGER NOT NULL,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        purpose TEXT,
        FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE,
        FOREIGN KEY (classroomId) REFERENCES Classroom (id) ON DELETE CASCADE
    )
`;
db.prepare(createBookingTableQuery).run();
console.log('Booking table is ready.');