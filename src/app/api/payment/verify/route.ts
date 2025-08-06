import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/app/api/lib/prismaClient';
import { sendPaymentEmail } from '../../lib/nodemailer';
import { generateInvoicePDF } from '@/lib/invoice-pdf-generate';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    invoice_id,
  } = body;

  
  const invoice = await prisma.invoice.findUnique({
    where: { invoice_id },
    include: {
      customer: {
        include: {
          company: true,
        },
      },
      user: {
        include: {
          company: true,
        },
      },
    },
  })

  if (!invoice) {
    return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 });
  }

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZOR_PAY_SECRET!)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

    
  // 1. Verify signature
  if (generated_signature !== razorpay_signature) {
    return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
  }

  // 2. Update invoice status
  try {
   

    await prisma.invoice.update({
      where: { invoice_id },
      data: { payment_status: 'paid' },
    });

    const pdfBuffer = await generateInvoicePDF(invoice);
    const downloadUrl = `http://localhost:3000/api/pdf/${invoice.invoice_id}`;
    await sendPaymentEmail(invoice.customer.company.email,pdfBuffer,downloadUrl);
    
    await prisma.payment.create({
      data: {
        invoice_id: invoice_id,
        user_id: invoice.user_id,
        customer_id: invoice.customer_id,
        amount: invoice.final_amount,
        method: 'razorpay',
        status: 'paid',
        razorpay_payment_id,
      },
    })
    return NextResponse.json({ success: true, message: 'Payment verified and invoice updated' });
  } catch (err) {
    console.error('Error updating invoice:', err);
    return NextResponse.json({ success: false, message: 'Failed to update invoice' }, { status: 500 });
  }
}
