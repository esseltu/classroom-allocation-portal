// filepath: /Users/kevinafenyo/Documents/GitHub/classroom-allocation-portal/backend/scripts/createUserTable.js
const db = require('../config/sqlite');

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'User',
        department TEXT,
        level INTEGER
    )
  `);
  console.log('User table created successfully.');
} catch (err) {
  console.error('Error creating User table:', err.message);
}