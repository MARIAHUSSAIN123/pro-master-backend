import twilioClient from "../config/twilio.js";

// Sends a single SMS via Twilio. `to` should include the country
// code (e.g. "+14165551234") — Twilio rejects numbers without one.
const sendSms = async (to, body) => {
  if (!process.env.TWILIO_PHONE_NUMBER) {
    throw new Error("TWILIO_PHONE_NUMBER is not set in .env.");
  }

  await twilioClient.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
};

export default sendSms;