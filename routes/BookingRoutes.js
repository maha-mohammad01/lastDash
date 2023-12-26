const express = require('express');
const { authenticateToken } = require('../middleware/authenticateToken');
const { getStadiumBookingsController,approveBookingController, rejectBookingController } = require('../controllers/BookingController');

const router = express.Router();

router.get('/stadium-bookings', authenticateToken, getStadiumBookingsController);
router.post('/approve-booking/:booking_id', authenticateToken, approveBookingController);
router.post('/reject-booking/:booking_id', authenticateToken, rejectBookingController);

module.exports = router;
