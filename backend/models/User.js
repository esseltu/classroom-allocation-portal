const db = require('../config/sqlite');
const bcrypt = require('bcrypt');

// Create the User table if it doesn't exist
db.exec('DROP TABLE IF EXISTS USER');
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
    const users = [
        { username: 'admin', fullName: 'Admin User', email: 'admin@central.edu.gh', password: 'password123', role: 'Admin', department: 'Computer Science', level: 0 },
        { username: 'michael', fullName: 'Michael Joseph', email: 'michaeljoseph@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Computer Science', level: 100 },
        { username: 'albertina', fullName: 'Albertina Agboli', email: 'albertinaagboli@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Computer Science', level: 200 },
        { username: 'essel', fullName: 'Essel Turkson', email: 'esselturkson@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Computer Science', level: 300 },
        { username: 'michelle', fullName: 'Michelle Arhin', email: 'michellearhin@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Computer Science', level: 400 },
        { username: 'elaine', fullName: 'Elaine Annan', email: 'elaineannan@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Information Technology', level: 100 },
        { username: 'ellis', fullName: 'Ellis Gbewordo', email: 'ellisgbewordo@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Information Technology', level: 200 },
        { username: 'selasi', fullName: 'Selasi Ahiaku', email: 'selasiahiaku@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Information Technology', level: 300 },
        { username: 'theophilus', fullName: 'Theophilus Martey', email: 'theophilusmartey@central.edu.gh', password: 'password123', role: 'Course Rep', department: 'Information Technology', level: 400 },
        { username: 'kevin', fullName: 'Kevin Afenyo', email: 'kevinafenyo@central.edu.gh', password: 'password123', role: 'Coures Rep', department: 'Business', level: 100 },
        { username: 'joy', fullName: 'Joy Chris-Odai', email: 'joychrisodai@central.edu.gh', password: 'password123', role: 'Coures Rep', department: 'Business', level: 200 },
    ]

    const insertUser = db.prepare(`
        INSERT INTO User (username, fullName, email, password, role, department, level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        insertUser.run(user.username, user.fullName, user.email, hashedPassword, user.role, user.department, user.level);
    }
    
    console.log('All users created successfully.');

  } catch (error) {
    console.error('Error populating users:', error.message);
  }
}

populateUsers();