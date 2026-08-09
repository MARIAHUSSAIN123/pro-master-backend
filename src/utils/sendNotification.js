import Notification from "../models/Notification.js";
import User from "../models/User.js";
import sendEmail from "./sendEmail.js";

// ======================================
// Spec 3.8 — creates an in-app Notification record and, if the
// "Email" channel is requested, also dispatches it by email using the
// existing sendEmail/nodemailer setup (config/email.js).
//
// SMS and Push are recorded with status "Pending" only — wiring them
// up to a real provider (Twilio / FCM / OneSignal) is a drop-in
// extension point once those credentials exist in .env.
//
// Usage from any other controller, e.g. after creating a Booking:
//
//   import { sendNotification } from "../utils/sendNotification.js";
//   await sendNotification({
//     recipient: booking.customer.user,
//     type: "BookingConfirmation",
//     title: "Booking Confirmed",
//     body: `Your booking ${booking.bookingNumber} is confirmed.`,
//     channels: ["InApp", "Email"],
//     relatedModel: "Booking",
//     relatedId: booking._id,
//     createdBy: req.user._id,
//   });
// ======================================
export const sendNotification = async ({
  recipient,
  type = "General",
  title,
  body,
  channels = ["InApp"],
  relatedModel = null,
  relatedId = null,
  createdBy = null,
}) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    body,
    channels,
    relatedModel,
    relatedId,
    createdBy,
    status: channels.includes("Email") ? "Pending" : "Sent",
  });

  if (channels.includes("Email")) {
    try {
      const user = await User.findById(recipient).select("email fullName");

      if (user?.email) {
        await sendEmail(
          user.email,
          title,
          `<p>Hi ${user.fullName || ""},</p><p>${body}</p>`
        );
      }

      notification.status = "Sent";
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = "Failed";
      notification.errorMessage = error.message;
    }

    await notification.save();
  }

  return notification;
};

// Send the same notification to many recipients at once (e.g. every
// agent assigned to a booking, or every customer on a recurring
// contract whose schedule changed).
export const sendBulkNotification = async ({
  recipients = [],
  type = "General",
  title,
  body,
  channels = ["InApp"],
  relatedModel = null,
  relatedId = null,
  createdBy = null,
}) => {
  return Promise.all(
    recipients.map((recipient) =>
      sendNotification({
        recipient,
        type,
        title,
        body,
        channels,
        relatedModel,
        relatedId,
        createdBy,
      })
    )
  );
};

export default sendNotification;