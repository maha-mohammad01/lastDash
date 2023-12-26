// const stadiumBookingModel = require('../models/BookingModel');
const pool = require('../db');
const bookingModel = require('../models/bookingModel'); 

async function getStadiumBookingsController(req, res) {
  const { user_id } = req.user;

  try {
    const bookings = await bookingModel.getStadiumBookingsByOwner(user_id);
    res.json({ stadium_bookings: bookings });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


async function approveBookingController(req, res) {
  const { user_id } = req.user;
  const { booking_id } = req.params;

  try {
    // تحقق مما إذا كان المستخدم هو مالك الملعب
    const stadiumResult = await pool.query('SELECT owner_id FROM stadiums WHERE owner_id = $1', [user_id]);

    if (stadiumResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized. You are not the owner of this stadium.' });
    }

    const booking = await bookingModel.approveBooking(booking_id);

    res.json({ message: 'Booking approved successfully', booking });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function rejectBookingController(req, res) {
  const { user_id } = req.user;
  const { booking_id } = req.params;

  try {
    const stadiumResult = await pool.query('SELECT owner_id FROM stadiums WHERE owner_id = $1', [user_id]);

    if (stadiumResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized. You are not the owner of this stadium.' });
    }

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [booking_id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = await bookingModel.rejectBooking(booking_id);

    res.json({ message: 'Booking rejected successfully', booking });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


module.exports = {
  getStadiumBookingsController,
  approveBookingController,
  rejectBookingController,
};
