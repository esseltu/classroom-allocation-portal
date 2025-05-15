const db = require('../config/sqlite');

// Add a classroom
const addClassroom = (req, res) => {
    console.log('[CLASSROOM] Add Classroom Endpoint Hit'); // Log when the endpoint is hit
    console.log('[CLASSROOM] Request Body:', req.body); // Log the request body

    try {
        const { name, block, capacity } = req.body;

        const blockQuery = `SELECT id FROM Block WHERE name = ?`;
        const blockResult = db.prepare(blockQuery).get(block);

        if (!blockResult) {
            console.warn('[CLASSROOM] Block Not Found:', block); // Log if block is not found
            return res.status(400).json({ error: `Block '${block}' does not exist.` });
        }

        const query = `INSERT INTO Classroom (name, block, capacity) VALUES (?, ?, ?)`;
        const result = db.prepare(query).run(name, blockResult.id, capacity);

        console.log('[CLASSROOM] Classroom Added Successfully:', { id: result.lastInsertRowid, name, block, capacity }); // Log success
        res.status(201).json({ id: result.lastInsertRowid, name, block, capacity });
    } catch (err) {
        console.error('[CLASSROOM] Error Adding Classroom:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Fetch all classrooms
const getClassrooms = (req, res) => {
    console.log('[CLASSROOM] Get Classrooms Endpoint Hit'); // Log when the endpoint is hit

    try {
        const query = `
            SELECT Classroom.id, Classroom.name, Block.name AS block, Classroom.capacity, Classroom.available
            FROM Classroom
            JOIN Block ON Classroom.block = Block.id
        `;
        const rows = db.prepare(query).all();

        console.log('[CLASSROOM] Classrooms Retrieved:', rows.length); // Log the retrieved classrooms
        res.status(200).json(rows);
    } catch (err) {
        console.error('[CLASSROOM] Error Fetching Classrooms:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Function to update a classroom
const updateClassroom = (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;

        // Check if the block exists
        const blockQuery = `SELECT id FROM Classroom WHERE id = ?`;
        const blockResult = db.prepare(blockQuery).get(id);

        if (!blockResult) {
            return res.status(400).json({ error: `Classroom ID:'${id}' does not exist.` });
        }

        const query = `UPDATE Classroom SET available = ? WHERE id = ?`;
        const result = db.prepare(query).run(available, blockResult.id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        res.status(200).json({ id, available });
    } catch (err) {
        console.error('Error updating classroom:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Function to delete a classroom
const deleteClassroom = (req, res) => {
    try {
        const { id } = req.params;
        const query = `DELETE FROM Classroom WHERE id = ?`;
        const result = db.prepare(query).run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        res.status(200).json({ message: 'Classroom deleted successfully' });
    } catch (err) {
        console.error('Error deleting classroom:', err.message);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    addClassroom,
    getClassrooms,
    updateClassroom,
    deleteClassroom
};