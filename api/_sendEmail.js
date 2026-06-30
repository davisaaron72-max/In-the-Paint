// api/_sendEmail.js — shared helper, not a route itself.
// Called by other /api functions. Never import this on the client side.

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html, from }) {
  const msg = {
    to,
    from: from || process.env.SENDGRID_FROM_EMAIL, // must be a verified sender in SendGrid
    subject,
    html,
  };
  return sgMail.send(msg);
}

module.exports = { sendEmail };
