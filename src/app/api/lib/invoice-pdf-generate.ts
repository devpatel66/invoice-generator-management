import PDFDocument from 'pdfkit';
import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
import { join } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

function generateInvoicePDF(invoiceData, outputPath) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
  });

  doc.registerFont('Inter-Regular', join(process.cwd(), 'public', 'fonts', 'Inter.ttc'));
doc.registerFont('Inter-Bold', join(process.cwd(), 'public', 'fonts', 'Inter.ttc'));
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Design Constants
  const colors = {
    primary: '#2c3e50',
    accent: '#3498db',
    light: '#f8f9fa',
    dark: '#333333',
    border: '#e0e0e0'
  };
// Register fonts at the top

const fonts = {
  regular: 'Inter-Regular',
  bold: 'Inter-Bold'
};

  // === 1. Invoice Title Section ===
  let y = 40;

  // Invoice title with accent bar
  doc.fillColor(colors.accent)
     .rect(50, y, 5, 20)
     .fill();

  doc.font(fonts.bold)
     .fontSize(20)
     .fillColor(colors.primary)
     .text('INVOICE', 60, y)
     .fontSize(12)
     .text(invoiceData.invoiceNumber, 60, y + 25);

  // Invoice dates on right
  doc.font(fonts.regular)
     .fontSize(10)
     .fillColor(colors.dark)
     .text(`Issued: ${invoiceData.invoiceDate}`, 400, y, { align: 'right' })
     .text(`Due: ${invoiceData.dueDate}`, 400, y + 15, { align: 'right' });

  y += 60;

  // === 2. Company and Client Information ===
  // Company info box
  doc.fillColor(colors.light)
     .roundedRect(50, y, 250, 90, 5)
     .fill();

  doc.font(fonts.bold)
     .fontSize(12)
     .fillColor(colors.primary)
     .text('From:', 60, y + 10);
doc.font(fonts.regular)
   .fontSize(10)
   .fillColor(colors.dark)
   .text(invoiceData.seller.name, 60, y + 30)
   .text(invoiceData.seller.address, 60, y + 45, { width: 200 })  // Wrap within 200px
   .text(`Phone: ${invoiceData.seller.phone}`, 60, y + 75)
   .text(`Email: ${invoiceData.seller.email}`, 60, y + 90);

  // Client info box
  doc.fillColor(colors.light)
     .roundedRect(310, y, 250, 90, 5)
     .fill();

  doc.font(fonts.bold)
     .fontSize(12)
     .fillColor(colors.primary)
     .text('Bill To:', 320, y + 10);

  doc.font(fonts.regular)
     .fontSize(10)
     .fillColor(colors.dark)
     .text(invoiceData.customer.name, 320, y + 30)
     .text(invoiceData.customer.company, 320, y + 45)
     .text(`Phone: ${invoiceData.customer.phone}`, 320, y + 60)
     .text(`Email: ${invoiceData.customer.email}`, 320, y + 75);

  y += 110;

  // === 3. Items Table ===
  // Table Header
  doc.fillColor(colors.primary)
     .roundedRect(50, y, 510, 25, 3)
     .fill();

  const columns = {
    description: { x: 55, width: 300 },
    quantity: { x: 370, width: 50 },
    rate: { x: 430, width: 60 },
    amount: { x: 500, width: 60 }
  };

  doc.font(fonts.bold)
     .fontSize(11)
     .fillColor('#ffffff')
     .text('DESCRIPTION', columns.description.x, y + 7)
     .text('QTY', columns.quantity.x, y + 7, { width: columns.quantity.width, align: 'right' })
     .text('RATE', columns.rate.x, y + 7, { width: columns.rate.width, align: 'right' })
     .text('AMOUNT', columns.amount.x, y + 7, { width: columns.amount.width, align: 'right' });

  // Table Rows
  y += 25;
  doc.font(fonts.regular).fontSize(10);

  invoiceData.items.forEach((item, i) => {
    // Alternate row background
    if (i % 2 === 0) {
      doc.fillColor(colors.light)
         .rect(50, y - 5, 510, 20)
         .fill();
    }

    // Left-aligned description with proper formatting
    doc.fillColor(colors.dark)
       .text(item.description, columns.description.x, y, {
         width: columns.description.width,
         align: 'left',
         lineBreak: false,
         ellipsis: false
       });

    // Right-aligned numeric values
    doc.text(item.quantity.toString(), columns.quantity.x, y, { 
      width: columns.quantity.width, 
      align: 'right' 
    })
    .text(`₹${item.rate.toFixed(2)}`, columns.rate.x, y, { 
      width: columns.rate.width, 
      align: 'right' 
    })
    .text(`₹${item.amount.toFixed(2)}`, columns.amount.x, y, { 
      width: columns.amount.width, 
      align: 'right' 
    });

    y += 20;
});

  // === 4. Totals Section ===
  y += 20;

  // Horizontal divider
  doc.strokeColor(colors.border)
     .lineWidth(1)
     .moveTo(350, y)
     .lineTo(550, y)
     .stroke();

  const totals = [
    { label: 'Subtotal:', value: invoiceData.subTotal },
    { label: `Tax (${invoiceData.taxRate}%):`, value: invoiceData.taxAmount },
    { label: 'Total:', value: invoiceData.finalAmount, isTotal: true }
  ];

  totals.forEach(item => {
    doc.fontSize(10)
       .fillColor(item.isTotal ? colors.primary : colors.dark)
       .font(item.isTotal ? fonts.bold : fonts.regular)
       .text(item.label, 400, y + 10)
       .text(`₹${item.value.toFixed(2)}`, columns.amount.x, y + 10, { 
         width: columns.amount.width, 
         align: 'right' 
       });
    y += 20;
  });

  // === 5. Payment Information ===
  y += 30;

  doc.font(fonts.bold)
     .fontSize(12)
     .fillColor(colors.primary)
     .text('Payment Information', 50, y);

  doc.font(fonts.regular)
     .fontSize(10)
     .fillColor(colors.dark)
     .text(`Bank Name: ${invoiceData.paymentInfo.bankName}`, 50, y + 20)
     .text(`Account Number: ${invoiceData.paymentInfo.accountNumber}`, 50, y + 35)
     .text(`IFSC Code: ${invoiceData.paymentInfo.ifscCode}`, 50, y + 50)
     .text(`UPI ID: ${invoiceData.paymentInfo.upiId}`, 50, y + 65);

  // === 6. Notes & Terms ===
  y += 90;

  if (invoiceData.notes) {
    doc.font(fonts.bold)
       .text('Notes:', 50, y)
       .font(fonts.regular)
       .text(invoiceData.notes, 70, y + 15, { width: 480 });
    y += 40;
  }

  if (invoiceData.terms) {
    doc.font(fonts.bold)
       .text('Terms:', 50, y)
       .font(fonts.regular)
       .text(invoiceData.terms, 70, y + 15, { width: 480 });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// Example Usage
const invoiceData = {
  seller: {
    name: 'Dev Solutions Pvt. Ltd.',
    email: 'contact@devsolutions.com',
    phone: '+91 9876543210',
    address: '123 Business Park, Mumbai, Maharashtra, India - 400001',
  },
  customer: {
    name: 'John Doe',
    company: 'Acme Corporation',
    email: 'john.doe@acme.com',
    phone: '+91 1234567890',
  },
  invoiceNumber: 'INV-2025-001',
  invoiceDate: '17 April, 2025',
  dueDate: '25 April, 2025',
  taxRate: 18,
  subTotal: 2300,
  taxAmount: 414,
  finalAmount: 2714,
  paymentInfo: {
    bankName: 'Global Bank',
    accountNumber: '9876543210',
    ifscCode: 'GBIN0123456',
    upiId: 'devsolutions@upi'
  },
  items: [
    { 
      description: 'Web Development Service (Frontend with React, Backend with Node.js)', 
      quantity: 1, 
      rate: 1000, 
      amount: 1000 
    },
    { 
      description: 'UI/UX Design Package including wireframes and prototypes', 
      quantity: 1, 
      rate: 800, 
      amount: 800 
    },
    { 
      description: 'Consultation Hours for technical architecture review', 
      quantity: 5, 
      rate: 100, 
      amount: 500 
    },
  ],
  notes: 'Please include the invoice number in your payment reference. For any questions, contact accounting@devsolutions.com',
  terms: '1. Payment is due within 15 days of invoice date.\n2. Late payments are subject to 2% monthly interest.\n3. All checks should be made payable to Dev Solutions Pvt. Ltd.'
};

// generateInvoicePDF(invoiceData, `invoice-${invoiceData.invoiceNumber}.pdf`)
//   .then(() => console.log('Invoice generated successfully'))
//   .catch(err => console.error('Error:', err));


  export default generateInvoicePDF