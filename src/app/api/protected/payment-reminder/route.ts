import prisma from "../../lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendPaymentReminder } from "../../lib/nodemailer";
import { stat } from "fs";

export async function POST(request: NextRequest) {
    try {
        const { invoice_id } = await request.json();

        const invoice = await prisma.invoice.findUnique({
            where: {
                invoice_id
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
            }
        });

        
        const payment_link = `http://localhost:3000/invoice-pay/${invoice.invoice_id}`;
        await sendPaymentReminder(invoice, payment_link);
        return NextResponse.json({ message: "Payment reminder sent successfully" ,status:200}, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to send payment reminder" ,status:500}, { status: 500 });
    }
}