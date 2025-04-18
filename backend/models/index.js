const db = require('../config/sqlite');

// Import all models
require('./Block');
require('./Classroom');

// Log a message to confirm that models are initialized
console.log('All models have been initialized.');

module.exports = db;