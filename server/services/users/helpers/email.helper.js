import transporter from "../config/email.config.js";
import dotenv from "dotenv";
import crypto from "crypto";
import forgotPasswordEmail from "../templates/forgotPassword.template.js";
dotenv.config({ quiet: true });

const sendMail = async (email, subject, html) => {
  const options = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: subject,
    html: html,
  };

  const info = await transporter.sendMail(options);
  console.log("Email sent: " + info.response);
};

const sendForgotPasswordEmail = async (name, email, minutes) => {
  const token = crypto.randomBytes(32).toString("hex");
  const resetLink = `${process.env.CLIENT_URL}/auth/reset-password/${token}`;

  const { subject, html } = forgotPasswordEmail(name, resetLink, minutes);
  await sendMail(email, subject, html);

  return token;
};

export { sendMail, sendForgotPasswordEmail };
