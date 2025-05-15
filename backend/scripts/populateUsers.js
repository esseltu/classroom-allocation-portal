const db = require('../config/sqlite');
const bcrypt = require('bcrypt');

async function populateUsers() {
  try {
    const username = 'admin';
    const fullName = 'Admin User';
    const email = 'admin@example.com';
    const password = 'password123'; // Default password
    const role = 'Admin';
    const department = 'IT';
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