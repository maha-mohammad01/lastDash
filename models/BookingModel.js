const pool = require('../db');
const { format } = require('date-fns');

function formatBookingDate(bookingDate) {
  return format(new Date(bookingDate), 'yyyy-MM-dd');
}

async function getStadiumBookingsByOwner(ownerId) {
  try {
    const bookingsResult = await pool.query(`
      SELECT 
        bookings.booking_id,
        to_char(bookings.booking_date, 'YYYY-MM-DD') AS booking_date,
        bookings.start_time,
        bookings.end_time,
        bookings.note,
        stadiums.name AS stadium_name,
        users.full_name AS user_name,
        EXTRACT(EPOCH FROM (bookings.end_time - bookings.start_time))/3600 AS hours_booked
      FROM 
        bookings
      JOIN 
        stadiums ON bookings.stadium_id = stadiums.stadium_id
      JOIN 
        users ON bookings.user_id = users.user_id
      WHERE 
        stadiums.owner_id = $1
    `, [ownerId]);

    return bookingsResult.rows;
  } catch (error) {
    console.error('Error executing query', error);
    throw new Error('Internal server error');
  }

}




async function approveBooking(bookingId) {
  try {
    const updateResult = await pool.query('UPDATE bookings SET status = $1 WHERE booking_id = $2 RETURNING *', ['approved', bookingId]);

    return updateResult.rows[0];
  } catch (error) {
    console.error('Error executing query', error);
    throw new Error('Internal server error');
  }
}

async function rejectBooking(bookingId) {
  try {
    const updateResult = await pool.query('UPDATE bookings SET status = $1 WHERE booking_id = $2 RETURNING *', ['rejected', bookingId]);

    return updateResult.rows[0];
  } catch (error) {
    console.error('Error executing query', error);
    throw new Error('Internal server error');
  }
}


module.exports = {
  getStadiumBookingsByOwner,
  approveBooking,
  rejectBooking,
};
