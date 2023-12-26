const pool = require('../db');

async function saveContactMessage(fullName, email, message) {
  const result = await pool.query('INSERT INTO public.contacts (full_name, email, message) VALUES ($1, $2, $3) RETURNING *', [fullName, email, message]);
  return result.rows[0];
}

async function getContactMessages() {
  const messagesResult = await pool.query('SELECT * FROM public.contacts');
  return messagesResult.rows;
}

async function updateContactMessage(email, reply) {
  const updateResult = await pool.query('UPDATE public.contacts SET admin_reply = $1 WHERE email = $2 RETURNING *', [reply, email]);

  if (updateResult.rows.length === 0) {
    return null;
  }

  const selectResult = await pool.query('SELECT * FROM public.contacts WHERE email = $1', [email]);
  return selectResult.rows[0];
}

module.exports = {
  saveContactMessage,
  getContactMessages,
  updateContactMessage,
};
