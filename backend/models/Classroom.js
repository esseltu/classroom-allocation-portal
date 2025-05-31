const db = require('../config/sqlite');

// db.prepare('DROP TABLE IF EXISTS Classroom').run();
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

const classrooms = [
    { id: "1", name: "B01", block: 1, capacity: 60 },
    { id: "2", name: "C01", block: 2, capacity: 30 },
    { id: "3", name: "C02", block: 2, capacity: 30 },
    { id: "4", name: "E103", block: 3, capacity: 30 },
    { id: "5", name: "E201", block: 3, capacity: 40 },
    { id: "6", name: "E202", block: 3, capacity: 40 },
    { id: "7", name: "E203", block: 3, capacity: 40 },
    { id: "8", name: "E204", block: 3, capacity: 40 },
    { id: "9", name: "E301", block: 3, capacity: 50 },
    { id: "10", name: "E302", block: 3, capacity: 50 },
    { id: "11", name: "E303", block: 3, capacity: 50 },
    { id: "12", name: "E304", block: 3, capacity: 50 },
    { id: "13", name: "F102A", block: 4, capacity: 35 },
    { id: "14", name: "F102B", block: 4, capacity: 35 },
    { id: "15", name: "F103A", block: 4, capacity: 35 },
    { id: "16", name: "F103B", block: 4, capacity: 35 },
    { id: "17", name: "F104A", block: 4, capacity: 35 },
    { id: "18", name: "F104B", block: 4, capacity: 35 },
    { id: "19", name: "F201", block: 4, capacity: 45 },
    { id: "20", name: "F202", block: 4, capacity: 45 },
    { id: "21", name: "F301", block: 4, capacity: 55 },
    { id: "22", name: "F302", block: 4, capacity: 55 },
    { id: "23", name: "F303", block: 4, capacity: 55 },
    { id: "24", name: "F304", block: 4, capacity: 55 },
    { id: "25", name: "F403", block: 4, capacity: 60 },
    { id: "26", name: "F404", block: 4, capacity: 60 }
];

try {

    const insertClassroomQuery = `INSERT OR IGNORE INTO Classroom (id, name, block, capacity) VALUES (?, ?, ?, ?)`;
    const insertClassroomStmt = db.prepare(insertClassroomQuery);

    classrooms.forEach((classroom) => {
        try {
            insertClassroomStmt.run(classroom.id, classroom.name, classroom.block, classroom.capacity);
            console.log(`Classroom (${classroom.id}) inserted successfully.`);
        } catch (err) {
            console.error(`Error inserting classroom (${classroom.id}):`, err.message);
        }
    });

    console.log('Classroom population completed.');
} catch (err) {
    console.error('Error populating classrooms:', err.message);
}
console.log('Classroom table is ready.');