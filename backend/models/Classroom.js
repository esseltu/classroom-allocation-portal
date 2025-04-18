const db = require('../config/sqlite');

// Create the Classroom table if it doesn't exist
const createClassroomTableQuery = `
    CREATE TABLE IF NOT EXISTS Classroom (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        block INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        available BOOLEAN NOT NULL DEFAULT 1,
        FOREIGN KEY (block) REFERENCES Block (id) ON DELETE CASCADE
    )
`;
db.prepare(createClassroomTableQuery).run(); // Use db.prepare().run() for executing the query
console.log('Classroom table is ready.');