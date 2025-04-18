// filepath: /Users/kevinafenyo/Documents/GitHub/classroom-allocation-portal/backend/server.js
const express = require('express');
const classroomRoutes = require('./routes/classroom');
require('./models'); // Import models to initialize them

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.use('/api', classroomRoutes);

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