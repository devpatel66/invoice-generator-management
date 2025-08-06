import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
// Function to format date
Handlebars.registerHelper('formatDate', function(date) {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
});

// Function to format currency
Handlebars.registerHelper('formatCurrency', function(number) {
  return number.toLocaleString('en-US', { style: 'currency', currency: 'INR' });
});
Handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});

// Helper to add numbers
Handlebars.registerHelper('add', function(a, b) {
  return a + b;
});


export async function generateInvoicePDF(invoiceData) {
  try {
    // Read the HTML template
    const htmlTemplate = fs.readFileSync('./src/lib/invoice.html', 'utf-8');
    
    // Compile the template
    const template = Handlebars.compile(htmlTemplate);
    
    // Render the HTML with the invoice data
    const html = template(invoiceData);
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
      }
    });
    
    await browser.close();
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}