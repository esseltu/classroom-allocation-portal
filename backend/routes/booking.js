const express = require('express');
const { createBooking, getBookings, deleteBooking } = require('../controllers/bookingController');

const router = express.Router();

router.post('/booking', createBooking);
router.get('/booking', getBookings);
router.delete('/booking/:id', deleteBooking);

module.exports = router;