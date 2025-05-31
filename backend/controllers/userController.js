const db = require('../config/sqlite');
const bcrypt = require('bcrypt');

// Register a new user
const registerUser = async (req, res) => {
    console.log('[USER] Register User Endpoint Hit'); // Log when the endpoint is hit
    console.log('[USER] Request Body:', req.body); // Log the request body

    try {
        const { username, fullName, email, password, role, department, level } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO User (username, fullName, email, password, role, department, level)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = db.prepare(query).run(username, fullName, email, hashedPassword, role, department, level);

        console.log('[USER] User Registered Successfully:', { id: result.lastInsertRowid, username, fullName, email }); // Log success
        res.status(201).json({ id: result.lastInsertRowid, username, fullName, email });
    } catch (err) {
        console.error('[USER] Error Registering User:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Login a user
const loginUser = (req, res) => {
    console.log('[USER] Login User Endpoint Hit'); // Log when the endpoint is hit
    console.log('[USER] Request Body:', req.body); // Log the request body

    try {
        const { email, password } = req.body;

        const query = `SELECT * FROM User WHERE email = ?`;
        const user = db.prepare(query).get(email);

        console.log('[USER] User Retrieved from Database:', user); // Log the retrieved user

        if (!user || !bcrypt.compareSync(password, user.password)) {
            console.warn('[USER] Invalid Credentials'); // Log invalid credentials
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('[USER] Login Successful:', { id: user.id, username: user.username, role: user.role }); // Log success
        res.status(200).json({ id: user.id, username: user.username, fullName: user.fullName, role: user.role, department: user.department });
    } catch (err) {
        console.error('[USER] Error Logging in User:', err.message, err.stack); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Get user details
const getUserDetails = (req, res) => {
    console.log('[USER] Get User Details Endpoint Hit'); // Log when the endpoint is hit
    console.log('[USER] Request Params:', { id: req.params.id }); // Log the request parameters

    try {
        const { id } = req.params;

        const query = `SELECT id, username, fullName, email, role, department, level FROM User WHERE id = ?`;
        const user = db.prepare(query).get(id);

        if (!user) {
            console.warn('[USER] User Not Found'); // Log if the user is not found
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('[USER] User Details Retrieved Successfully:', { userId: user.id, fullName: user.fullName }); // Log success
        res.status(200).json(user);
    } catch (err) {
        console.error('[USER] Error Fetching User Details:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Update user details
const updateUserDetails = (req, res) => {
    console.log('[USER] Update User Details Endpoint Hit'); // Log when the endpoint is hit
    console.log('[USER] Request Params:', { id: req.params.id }); // Log the request parameters
    console.log('[USER] Request Body:', req.body); // Log the request body

    try {
        const { id } = req.params;
        const { fullName, email, department, level } = req.body;

        const query = `
            UPDATE User
            SET fullName = ?, email = ?, department = ?, level = ?
            WHERE id = ?
        `;
        db.prepare(query).run(fullName, email, department, level, id);

        console.log('[USER] User Details Updated Successfully:', { userId: id }); // Log success
        res.status(200).json({ message: 'User details updated successfully' });
    } catch (err) {
        console.error('[USER] Error Updating User Details:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

// Update user password
const updateUserPassword = (req, res) => {
    console.log('[USER] Update User Password Endpoint Hit'); // Log when the endpoint is hit
    console.log('[USER] Request Params:', { id: req.params.id }); // Log the request parameters
    console.log('[USER] Request Body:', req.body); // Log the request body

    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        const query = `SELECT * FROM User WHERE id = ?`;
        const user = db.prepare(query).get(id);

        if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
            console.warn('[USER] Invalid Current Password'); // Log invalid current password
            return res.status(401).json({ error: 'Invalid current password' });
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        const updateQuery = `UPDATE User SET password = ? WHERE id = ?`;
        db.prepare(updateQuery).run(hashedNewPassword, id);

        console.log('[USER] User Password Updated Successfully:', { userId: id }); // Log success
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('[USER] Error Updating User Password:', err.message); // Log error
        res.status(500).json({ error: err.message });
    }
};

module.exports = { registerUser, loginUser, getUserDetails, updateUserDetails, updateUserPassword };