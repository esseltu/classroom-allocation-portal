const db = require('../config/sqlite');
const bcrypt = require('bcrypt');

// Create the User table if it doesn't exist
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
`, (err) => {
    if (err) {
        console.error('Error creating User table:', err.message);
    } else {
        console.log('User table is ready.');
    }
});

async function populateUsers() {
  try {
    const username = 'admin';
    const fullName = 'Admin User';
    const email = 'admin@example.com';
    const password = 'password123'; // Default password
    const role = 'Admin';
    const department = 'Information Technology';
    const level = 0;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const query = `
      INSERT INTO User (username, fullName, email, password, role, department, level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.prepare(query).run(username, fullName, email, hashedPassword, role, department, level);

    console.log('Default user created successfully:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error('Error populating users:', error.message);
  }
}

populateUsers();

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