import twilio from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  console.log(
    "⚠️  TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing in .env — SMS sending will fail."
  );
}

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default twilioClient;