const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const ContactModel = require('../models/contactModel');
const { authenticateAdminToken } = require('../middleware/authenticateAdminToken');

router.post('/contact', async (req, res) => {
  const { full_name, email, message } = req.body;

  try {
    await contactsController.sendContactEmail(full_name, email, message);
    await ContactModel.saveContactMessage(full_name, email, message);

    res.json({ message: 'Email sent and message saved successfully' });
  } catch (error) {
    console.error('Error processing contact form', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/admin-contact', authenticateAdminToken, async (req, res) => {
  try {
    const messages = await ContactModel.getContactMessages();
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching contact messages', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/admin-reply', authenticateAdminToken, async (req, res) => {
  const { email, reply } = req.body;

  try {
    const updatedMessage = await ContactModel.updateContactMessage(email, reply);

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({ message: 'Admin reply sent successfully', updatedMessage });
  } catch (error) {
    console.error('Error replying to contact message', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
