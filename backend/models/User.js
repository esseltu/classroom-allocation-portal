const db = require('../config/sqlite');

// Create the User table if it doesn't exist
db.run(`
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
`, (err) => {
    if (err) {
        console.error('Error creating User table:', err.message);
    } else {
        console.log('User table is ready.');
    }
});

// Function to add a user
const addUser = (username, fullName, email, password, role, department, level, callback) => {
    const query = `
        INSERT INTO User (username, fullName, email, password, role, department, level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [username, fullName, email, password, role, department, level], function (err) {
        callback(err, this.lastID);
    });
};

// Function to fetch a user by email
const getUserByEmail = (email, callback) => {
    const query = `SELECT * FROM User WHERE email = ?`;
    db.get(query, [email], (err, row) => {
        callback(err, row);
    });
};

module.exports = {
    addUser,
    getUserByEmail
};