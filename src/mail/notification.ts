import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

export const sendUpdate = () => {
  const mailOptions = {
    from: '"Your Name" <your-email@outlook.com>',
    to: "saumaygoel123@Gmail.com",
    subject: "Automated Email from Node.js using Outlook SMTP",
    text: "This is an automated message sent from Outlook via Node.js.",
    html: "<p>This is an <b>automated</b> message sent using Outlook's SMTP service.</p>",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("Error sending email:", error);
    }
    console.log("Email sent:", info.response);
  });
};
