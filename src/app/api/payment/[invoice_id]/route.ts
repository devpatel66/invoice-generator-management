import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/api/lib/prismaClient';
import { razorpayInstance } from '@/app/api/lib/razorpay';
import { log } from 'console';
export async function GET(request: NextRequest, context: { params: { invoice_id: string } }) {
  const { invoice_id } = await context.params;

  const invoice = await prisma.invoice.findUnique({
    where: {
      invoice_id: invoice_id,
    },
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
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found", 'status': 404 }, { status: 404 });
  }

  if (invoice.payment_status === 'paid') {
    return NextResponse.json({ success: true, order: null, invoice });
  }



  try {

    const existOrder = await prisma.order.findFirst({
      where: {
        invoice_id: invoice_id,
      }
    })
    if (existOrder) {
      return NextResponse.json({
        success: true,
        order:existOrder,
        invoice,
      });
    }

    const options = {
      amount: invoice.final_amount * 100, // Razorpay expects paise (INR * 100)
      currency: "INR",
      receipt: invoice.invoice_id,
      payment_capture: 1,
    };

    const order = await razorpayInstance.orders.create(options);
    await prisma.order.create({
      data: {
        razorpay_order_id: order.id,
        invoice_id: invoice.invoice_id,
        receipt: options.receipt,
        amount: options.amount,
      },
    })
    return NextResponse.json({
      success: true,
      order,
      invoice,
    });

  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: "Failed to create Razorpay order", status: 500 }, { status: 500 });
  }
}


