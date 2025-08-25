const nodemailer = require("nodemailer");
require("dotenv").config();
const { EMAIL_USER, EMAIL_PASS } = process.env;

const transporter = nodemailer.createTransport({
  host: "mail.a2groups.org",
  port: 465,
  secure: true,
  auth: {
    user: "mail@a2groups.org",
    pass: "QV!H[Ltc_]td",
  },
});

 
const sendMail = async (to, subject, body, pdfPath) => {
  try {
    const mailOptions = {
      from: "mail@a2groups.org",
      to,
      subject,
      html: body,
      attachments: [
        {
          filename: "salary-slip.pdf",
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};
module.exports = sendMail;
