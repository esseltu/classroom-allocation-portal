const Database = require('better-sqlite3');
const path = require('path');

// Define the database file path
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../database/sqlite.db');

// Create and connect to the SQLite database
const db = new Database(dbPath);

console.log(`Connected to the SQLite database at ${dbPath}.`);

module.exports = db;