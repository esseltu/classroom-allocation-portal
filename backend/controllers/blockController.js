const db = require('../config/sqlite');

// Get all blocks
const getBlocks = (req, res) => {
    console.log('[BLOCK] Get Blocks Endpoint Hit'); // Log when the endpoint is hit

    try {
        const query = `SELECT * FROM Block`;
        const blocks = db.prepare(query).all();

        console.log('[BLOCK] Blocks Retrieved:', blocks.length); // Log the retrieved blocks
        res.status(200).json(blocks);
    } catch (err) {
        console.error('[BLOCK] Error Fetching Blocks:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Add a new block
const addBlock = (req, res) => {
    try {
        const { name } = req.body;

        const query = `INSERT INTO Block (name) VALUES (?)`;
        const result = db.prepare(query).run(name);

        res.status(201).json({ id: result.lastInsertRowid, name });
    } catch (err) {
        console.error('Error adding block:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getBlocks, addBlock };