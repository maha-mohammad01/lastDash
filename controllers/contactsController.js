const nodemailer = require('nodemailer');
const ContactModel = require('../models/contactModel');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hma91109@gmail.com',
    pass: 'kjnhebktzoqaqhgs'
  }
});

async function sendContactEmail(fullName, email, message) {
  try {
    const mailOptions = {
      from: `"${fullName}" <hma91109@gmail.com>`,
      to: email,
      subject: 'Replay for footbulia',
      text: 'Thank you',
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending email', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    return { message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error processing contact form', error);
    throw new Error('Failed to send email');
  }
}

module.exports = {
  sendContactEmail,
};
