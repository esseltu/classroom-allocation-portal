// filepath: /Users/kevinafenyo/Documents/GitHub/classroom-allocation-portal/backend/server.js
const express = require('express');
const cors = require('cors'); // Import cors
const classroomRoutes = require('./routes/classroom');
const userRoutes = require('./routes/user');
const bookingRoutes = require('./routes/booking');
const blockRoutes = require('./routes/block'); // Import block routes
require('./models'); // Import models to initialize them

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors({
    origin: '*', // Allow requests from the frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // Allow cookies if needed
}));

app.use(express.json());

// Add routes
app.use('/api', classroomRoutes, userRoutes, bookingRoutes, blockRoutes); // Add block routes here

// Global error handler
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1); // Exit the process
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1); // Exit the process
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));