const db = require('../config/sqlite');

// Function to add a classroom
const addClassroom = (req, res) => {
    try {
        const { name, block, capacity } = req.body;

        // Check if the block exists
        const blockQuery = `SELECT id FROM Block WHERE name = ?`;
        const blockResult = db.prepare(blockQuery).get(block);

        if (!blockResult) {
            return res.status(400).json({ error: `Block '${block}' does not exist.` });
        }

        const query = `INSERT INTO Classroom (name, block, capacity) VALUES (?, ?, ?)`;
        const result = db.prepare(query).run(name, blockResult.id, capacity);
        res.status(201).json({ id: result.lastInsertRowid, name, block, capacity });
    } catch (err) {
        console.error('Error adding classroom:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Function to fetch all classrooms
const getClassrooms = (req, res) => {
    try {
        const query = `
            SELECT Classroom.id, Classroom.name, Block.name AS block, Classroom.capacity, Classroom.available
            FROM Classroom
            JOIN Block ON Classroom.block = Block.id
        `;
        const rows = db.prepare(query).all();
        res.status(200).json(rows);
    } catch (err) {
        console.error('Error fetching classrooms:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// Function to update a classroom
const updateClassroom = (req, res) => {
    try {
        const { id } = req.params;
        const { name, block, capacity } = req.body;

        // Check if the block exists
        const blockQuery = `SELECT id FROM Block WHERE name = ?`;
        const blockResult = db.prepare(blockQuery).get(block);

        if (!blockResult) {
            return res.status(400).json({ error: `Block '${block}' does not exist.` });
        }

        const query = `UPDATE Classroom SET name = ?, block = ?, capacity = ? WHERE id = ?`;
        const result = db.prepare(query).run(name, blockResult.id, capacity, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        res.status(200).json({ id, name, block, capacity });
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