import nodemailer from "nodemailer";
import { env } from "process";   
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main(sellerMail: string, customerMail: string) {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `${sellerMail}`, // sender address
      to: customerMail, // list of receivers
      subject: "Invoice Payment Reminder", // Subject line
      text: "Please pay the invoice as soon as possible", // plain text body
      html: "<b>Please pay the invoice as soon as possible</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export default main;

