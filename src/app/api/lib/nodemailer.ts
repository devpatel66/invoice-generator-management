import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendPaymentEmail(
  customerMail: string,
  invoicePdfBuffer: any, // PDF content as Buffer
  invoiceDownloadUrl: string // hosted URL where the invoice can be downloaded
) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to: customerMail,
      subject: "✅ Payment Confirmation - Invoice Attached",
      text: `Your payment was successful.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #28a745;">🎉 Payment Successful</h2>

          <p style="font-size: 16px; color: #333;">Dear Customer,</p>

          <p style="font-size: 16px; color: #333;">
            Thank you for your payment. Below are Invoice copy attached.:
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${invoiceDownloadUrl}" style="
              background-color: #007bff;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              font-size: 16px;
            ">
              📥 Download Invoice
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 13px; color: #888; text-align: center;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'invoice.pdf',
          content: invoicePdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    console.log("Payment email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending payment email:", error);
    return false;
  }
}


async function sendPaymentLinkEmail(invoice: any,customer:any,payment_link:string) {
  try {
    const info = await transporter.sendMail({
        from: `${process.env.SMTP_USER}`,
        to: customer.company.email,
        subject: `New Invoice #${invoice.invoice_number} Generated`,
        text: `A new invoice has been generated for you. View and pay at: ${payment_link}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="text-align: center; color: #333;">🧾 New Invoice Generated</h2>
      
            <p style="font-size: 16px; color: #555;">
              Dear ${customer.name || "Customer"},
            </p>
      
            <p style="font-size: 16px; color: #555;">
              A new invoice has been generated for you. Please find the invoice details below and proceed to payment at your earliest convenience.
            </p>
      
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Invoice Number:</td>
                <td style="padding: 8px;">${invoice.invoice_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Invoice Date:</td>
                <td style="padding: 8px;">${invoice.invoice_date.toDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Due Date:</td>
                <td style="padding: 8px;">${invoice.invoice_due_date.toDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Amount Due:</td>
                <td style="padding: 8px;">₹${invoice.final_amount.toFixed(2)}</td>
              </tr>
            </table>
      
            <div style="text-align: center; margin: 30px 0;">
              <a href="${payment_link}" style="
                background-color: #007bff;
                color: white;
                padding: 14px 26px;
                text-decoration: none;
                font-size: 16px;
                border-radius: 5px;
                font-weight: bold;
              ">
                View & Pay Invoice
              </a>
            </div>
      
            ${
              invoice.customer_note
                ? `<p style="font-size: 14px; color: #555;"><strong>Note:</strong> ${invoice.customer_note}</p>`
                : ''
            }
      
            <p style="margin-top: 30px; font-size: 13px; color: #999; text-align: center;">
              Thank you for your business!
            </p>
          </div>
        `,
      });
      

    console.log("Payment link email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending payment email:", error);
    return false;
  }
}
async function sendPaymentReminder(invoice: any,payment_link:string) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to: invoice.customer.company.email,
      subject: `Reminder: Invoice #${invoice.invoice_number} Payment Due`,
      text: `Reminder: Your payment for Invoice #${invoice.invoice_number} is due. Pay at: ${payment_link}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #d9534f;">⏰ Payment Reminder</h2>
    
          <p style="font-size: 16px; color: #333;">
            Hello ${invoice.customer.name || "Customer"},
          </p>
    
          <p style="font-size: 16px; color: #333;">
            This is a gentle reminder that your payment for the following invoice is still pending.
          </p>
    
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">Invoice Number:</td>
              <td style="padding: 8px;">${invoice.invoice_number}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Invoice Date:</td>
              <td style="padding: 8px;">${invoice.invoice_date.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Due Date:</td>
              <td style="padding: 8px;">${invoice.invoice_due_date.toDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Total Amount:</td>
              <td style="padding: 8px;">₹${invoice.final_amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Payment Status:</td>
              <td style="padding: 8px;">${invoice.payment_status}</td>
            </tr>
          </table>
    
          <div style="text-align: center; margin-top: 30px;">
            <a href="${payment_link}" style="
              background-color: #28a745;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              font-size: 16px;
            ">Pay Now</a>
          </div>
    
          ${
            invoice.customer_note
              ? `<p style="margin-top: 20px; font-size: 14px; color: #666;"><strong>Note:</strong> ${invoice.customer_note}</p>`
              : ''
          }
    
          <p style="margin-top: 30px; font-size: 14px; color: #888; text-align: center;">
            If you have already made the payment, please ignore this email.<br />
            Thank you!
          </p>
        </div>
      `,
    });
    
      

    console.log("Payment link email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending payment email:", error);
    throw error;
  }
}





export { 
    sendPaymentLinkEmail,
    sendPaymentEmail,
    sendPaymentReminder
};

