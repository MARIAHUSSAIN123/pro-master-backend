import transporter from "../config/email.js";

// attachments: optional array of { filename, content (Buffer), contentType }
// — existing calls with only (to, subject, html) are unaffected.
const sendEmail = async (to, subject, html, attachments = []) => {
  await transporter.sendMail({
    from: `"Pro Master Cleaning" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};

export default sendEmail;