const db = require('../config/sqlite');

// Create the Block table if it doesn't exist
const createBlockTableQuery = `
    CREATE TABLE IF NOT EXISTS Block (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
`;
db.prepare(createBlockTableQuery).run(); // Use db.prepare().run() for executing the query
console.log('Block table is ready.');

// Insert block details into the Block table
const blocks = ['Block A', 'Block B', 'Block C', 'Block E', 'Block F'];
const insertBlockQuery = `INSERT OR IGNORE INTO Block (name) VALUES (?)`;

const insertBlockStmt = db.prepare(insertBlockQuery); // Prepare the statement once
blocks.forEach((block) => {
    try {
        insertBlockStmt.run(block); // Execute the prepared statement
        console.log(`Block (${block}) inserted successfully.`);
    } catch (err) {
        console.error(`Error inserting block (${block}):`, err.message);
    }
});