// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// function generateInvoicePDF(invoiceData, outputPath) {
//   const doc = new PDFDocument({
//     size: 'A4',
//     margin: 50,
//     bufferPages: true,
//     info: {
//       Title: `Invoice ${invoiceData.invoiceNumber}`,
//       Author: invoiceData.seller.name,
//       Creator: 'Invoice Generator'
//     }
//   });

//   doc.pipe(fs.createWriteStream(outputPath));
//   doc.font('Helvetica');

//   // === 1. Header with Logo and Company Info ===
//   const topY = 50;
//   const logoSize = 60;

//   // Logo
//   if (invoiceData.seller.logoPath && fs.existsSync(invoiceData.seller.logoPath)) {
//     doc.image(invoiceData.seller.logoPath, 50, topY, { width: logoSize });
//   }

//   // Seller company info on the right
//   doc
//     .fillColor('#3498db')
//     .fontSize(16)
//     .font('Helvetica-Bold')
//     .text(invoiceData.seller.name, 400, topY, { align: 'right' })
//     .fillColor('#333333')
//     .fontSize(10)
//     .font('Helvetica')
//     .text(invoiceData.seller.address, { align: 'right' })
//     .text(`Phone: ${invoiceData.seller.phone}`, { align: 'right' })
//     .text(`Email: ${invoiceData.seller.email}`, { align: 'right' });

//   // Line separator
//   doc
//     .moveTo(50, topY + 80)
//     .lineTo(550, topY + 80)
//     .strokeColor('#e0e0e0')
//     .stroke();

//   // === 2. Customer Info & Invoice Info ===
//   const infoY = topY + 100;

//   // Customer Info
//   doc
//     .fillColor('#3498db')
//     .fontSize(12)
//     .font('Helvetica-Bold')
//     .text('Bill To:', 50, infoY)
//     .fillColor('#333333')
//     .font('Helvetica')
//     .text(invoiceData.customer.name, 50, infoY + 15)
//     .text(invoiceData.customer.company, 50, infoY + 30)
//     .text(`Phone: ${invoiceData.customer.phone}`, 50, infoY + 45)
//     .text(`Email: ${invoiceData.customer.email}`, 50, infoY + 60);

//   // Invoice Info
//   doc
//     .fillColor('#3498db')
//     .fontSize(12)
//     .font('Helvetica-Bold')
//     .text('Invoice Details:', 350, infoY)
//     .fillColor('#333333')
//     .font('Helvetica')
//     .fontSize(10)
//     .text(`Invoice #: ${invoiceData.invoiceNumber}`, 350, infoY + 15)
//     .text(`Date: ${invoiceData.invoiceDate}`, 350, infoY + 30)
//     .text(`Due Date: ${invoiceData.dueDate}`, 350, infoY + 45);

//   // === 3. Items Table ===
//   const tableTop = infoY + 100;

//   // Table Header
//   doc
//     .fillColor('#3498db')
//     .roundedRect(50, tableTop, 500, 20, 3)
//     .fill();

//   doc
//     .fillColor('#ffffff')
//     .fontSize(11)
//     .font('Helvetica-Bold')
//     .text('Description', 55, tableTop + 5)
//     .text('Qty', 350, tableTop + 5, { width: 50, align: 'right' })
//     .text('Rate', 410, tableTop + 5, { width: 80, align: 'right' })
//     .text('Amount', 500, tableTop + 5, { width: 50, align: 'right' });

//   // Table Rows
//   let y = tableTop + 25;
//   doc.font('Helvetica').fontSize(10);

//   invoiceData.items.forEach((item, i) => {
//     if (i % 2 === 0) {
//       doc.fillColor('#f8f9fa').rect(50, y - 5, 500, 20).fill();
//     }

//     doc
//       .fillColor('#333333')
//       .text(item.description, 55, y, { width: 290 })
//       .text(item.quantity.toString(), 350, y, { width: 50, align: 'right' })
//       .text(`₹${item.rate.toFixed(2)}`, 410, y, { width: 80, align: 'right' })
//       .text(`₹${item.amount.toFixed(2)}`, 500, y, { width: 50, align: 'right' });

//     y += 20;
//   });

//   // === 4. Summary Section ===
//   const summaryY = y + 20;
//   doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(350, summaryY).lineTo(550, summaryY).stroke();

//   const summaryItems = [
//     { label: 'Subtotal:', value: invoiceData.subTotal },
//     { label: `Tax (${invoiceData.taxRate}%):`, value: invoiceData.taxAmount },
//     { label: 'Total:', value: invoiceData.finalAmount, isTotal: true }
//   ];

//   let currentY = summaryY + 10;
//   summaryItems.forEach(item => {
//     doc
//       .fontSize(10)
//       .fillColor(item.isTotal ? '#3498db' : '#333333')
//       .font(item.isTotal ? 'Helvetica-Bold' : 'Helvetica')
//       .text(item.label, 400, currentY)
//       .text(`₹${item.value.toFixed(2)}`, 500, currentY, { align: 'right' });

//     if (item.isTotal) {
//       doc
//         .strokeColor('#e0e0e0')
//         .moveTo(350, currentY - 5)
//         .lineTo(550, currentY - 5)
//         .stroke();
//     }

//     currentY += 20;
//   });

//   // === 5. Additional Info ===
//   const footerY = currentY + 30;

//   if (invoiceData.terms || invoiceData.notes || invoiceData.customDetails) {
//     doc
//       .fillColor('#3498db')
//       .fontSize(10)
//       .font('Helvetica-Bold')
//       .text('Additional Information', 50, footerY)
//       .strokeColor('#3498db')
//       .lineWidth(1)
//       .moveTo(50, footerY + 5)
//       .lineTo(200, footerY + 5)
//       .stroke();
//   }

//   let nextY = footerY + 15;

//   if (invoiceData.terms) {
//     doc
//       .fillColor('#333333')
//       .fontSize(9)
//       .font('Helvetica-Bold')
//       .text('Terms & Conditions:', 50, nextY)
//       .font('Helvetica')
//       .text(invoiceData.terms, 50, nextY + 15, { width: 500 });
//     nextY += 60;
//   }

//   if (invoiceData.notes) {
//     doc
//       .fillColor('#333333')
//       .fontSize(9)
//       .font('Helvetica-Bold')
//       .text('Notes:', 50, nextY)
//       .font('Helvetica')
//       .text(invoiceData.notes, 50, nextY + 15, { width: 500 });
//     nextY += 60;
//   }

//   if (invoiceData.customDetails) {
//     doc
//       .fillColor('#333333')
//       .fontSize(9)
//       .font('Helvetica-Bold')
//       .text('Other Info:', 50, nextY)
//       .font('Helvetica')
//       .text(invoiceData.customDetails, 50, nextY + 15, { width: 500 });
//   }

//   // === 6. Footer Message (Same Page) ===
//   const pageHeight = doc.page.height;

//   doc
//     .fillColor('#999999')
//     .fontSize(8)
//     .text('Thank you for your business!', 50, pageHeight - 50, { align: 'center', width: 500 })
//     .text(`Generated on ${new Date().toLocaleDateString()}`, 50, pageHeight - 35, { align: 'center', width: 500 });

//   doc.end();
// }

// // === Example Usage ===
// const invoiceData = {
//   seller: {
//     logoPath: "join(__dirname, 'logo.png')",
//     name: 'Dev Solutions Pvt. Ltd.',
//     email: 'contact@devsolutions.com',
//     phone: '+91 9876543210',
//     address: 'Mumbai, Maharashtra, India',
//   },
//   customer: {
//     name: 'John Doe',
//     company: 'Acme Corp',
//     email: 'john@acme.com',
//     phone: '+91 1234567890',
//   },
//   invoiceNumber: 'INV-2025-001',
//   invoiceDate: '2025-04-17',
//   dueDate: '2025-04-25',
//   taxRate: 18,
//   subTotal: 2300,
//   taxAmount: 414,
//   finalAmount: 2714,
//   items: [
//     { description: 'Web Development Service', quantity: 1, rate: 1000, amount: 1000 },
//     { description: 'UI/UX Design', quantity: 1, rate: 800, amount: 800 },
//     { description: 'Consultation Hours', quantity: 5, rate: 100, amount: 500 },
//   ],
//   terms: 'Payment is due within 7 days. Late payments are subject to fees of 5% per month.',
//   notes: 'Please include the invoice number in your payment reference.',
//   customDetails: 'Project: Website Revamp for Q2 2025'
// };

// generateInvoicePDF(invoiceData, `invoice-${invoiceData.invoiceNumber}.pdf`);
