import prisma from "@/app/api/lib/prismaClient"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {getServerSession} from "next-auth"
import { sendPaymentLinkEmail } from "../../lib/nodemailer";
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const invoice_id = searchParams.get("invoice");
        if (!invoice_id) {
            return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
        }
        const invoices = await prisma.invoice.findUnique({
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
            }
        });
        console.log(invoices);
        if (!invoices) {
            return NextResponse.json({ error: "Invoice not found", 'status': 404 }, { status: 404 });
        }
        return NextResponse.json({'status':200, 'message':'Invoice fetched successfully', invoices},{status:200});
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return NextResponse.json({ error: "Failed to fetch invoices", 'status': 500 }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session : { user: { id: number,email : string,name:string } } | null = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }
        
        // Get user ID from session
        const userId = session.user.id;

        const existsBank = await prisma.bank.findFirst({
            where: {
                user_id: userId,
            }
        });
        if(!existsBank) {
            return NextResponse.json({ error: "Please add bank details first", status: 404 }, { status: 404 });
        }

        // Extract data from request
        const { invoiceNumber, invoiceDate, invoiceDueDate, customDetails, customerId, taxRate, termsAndConditions, note, items, subTotal, taxAmount, finalAmount } = await request.json();
        // console.log(invoiceNumber, invoiceDate, invoiceDueDate, customeDetails, customerId, taxRate, termsAndConditions, note, items, subTotal, taxAmount, finalAmount, paymentLink, paymentStatus);
        // return;        
        if(!invoiceNumber || !invoiceDate || !invoiceDueDate  || !customerId  || !taxRate || !items) {
            return NextResponse.json({ error: "All fields are required",status:400 }, { status: 400 });
        }


        if(new Date(invoiceDate) >= new Date(invoiceDueDate)){
            return NextResponse.json({ error: "Invoice due date must be greater than invoice date",status:400,'title':'Invoice Due Date' }, { status: 400 });
        }

        if(invoiceNumber <= 0){
            return NextResponse.json({ error: "Invoice number must be greater than 0",status:400,'title':'Invoice Number' }, { status: 400 });
        }
        
        // Check if invoice number already exists
        const checkInvoiceNumber = await prisma.invoice.findUnique({
            where: {
                invoice_id : `INV-${userId}-${invoiceNumber}`
            },
        });
        
        // Check if invoice number already exists
        if (checkInvoiceNumber) {
            return NextResponse.json({ error: "Invoice number already exists",status:400,'title':'invoiceNumber' }, { status: 400 });
        }

        // Calculate sub total, tax amount, and final amount
        const sub_total = items.reduce((acc: number, item: { unitPrice: number; quantity: number; description: string }) => acc + item.unitPrice * item.quantity, 0);
        const tax_amount = sub_total * (taxRate / 100);
        const final_amount = sub_total + tax_amount;

        // Generate invoice ID
        const invoice_id = `INV-${userId}-${invoiceNumber}`;

        console.log("Sub Total : "+ sub_total + " - Tax Amount : " + tax_amount + " - Final Amount : " + final_amount + " - Invoice ID : " + invoice_id);
        console.log(items)
        const invoice = await prisma.invoice.create({
            data: {
                invoice_id: invoice_id,
                invoice_number: invoiceNumber,
                invoice_date: new Date(invoiceDate),
                invoice_due_date: new Date(invoiceDueDate),
                customer_id: customerId,
                user_id: userId,
                tax_rate: taxRate,
                terms_condition: termsAndConditions,
                customer_note: note,
                items: items,
                custome_details: customDetails,
                sub_total: sub_total,
                tax_amount: tax_amount,
                final_amount: final_amount,
                payment_link: null,
                payment_status: 'unpaid',
            },
        });

        if (!invoice) {
            return NextResponse.json({ error: "Failed to create invoice", 'status': 500 }, { status: 500 });
        }

        // send email payment link with invoice details...
        const payment_link = `http://localhost:3000/invoice-pay/${invoice.invoice_id}`;
        const customer = await prisma.customer.findUnique({
            where: {
                customer_id: invoice.customer_id,
            },
            include: {
                company: true
            }
        })
        console.log(customer);
        
        sendPaymentLinkEmail(invoice,customer,payment_link);

        return NextResponse.json({ message: "Invoice created successfully",'status':200 }, { status: 200 });
    } catch (error) {
        console.error("Error creating invoice:", error);
        return NextResponse.json({ error: "Failed to create invoice",'status':500 }, { status: 500 });
    }
}



export async function DELETE(request: NextRequest) {
    try {
        const { invoice_id } = await request.json();
        const invoice = await prisma.invoice.delete({
            where: { invoice_id },
        });
        return NextResponse.json({ message: "Invoice deleted successfully",'status':200 }, { status: 200 });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return NextResponse.json({ error: "Failed to delete invoice",'status':500 }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { invoice_id, dueDate, items, tax_rate, customer_note, terms_condition,customer_id } = await request.json();
        console.log(invoice_id, dueDate, items, tax_rate, customer_note, terms_condition,customer_id);
        
        const alreadyInvoice = await prisma.invoice.findUnique({
            where: { invoice_id },
        });

        if (!alreadyInvoice) {  
            return NextResponse.json({ error: "Invoice not found",'status':404 }, { status: 404 });
        }

        const sub_total = items.reduce((acc: number, item: { unitPrice: number; quantity: number; description: string }) => acc + item.unitPrice * item.quantity, 0);
        const tax_amount = sub_total * (tax_rate / 100);
        const final_amount = sub_total + tax_amount;

        const invoice = await prisma.invoice.update({
            where: { invoice_id },
            data: {
                invoice_due_date: dueDate || alreadyInvoice.invoice_due_date,
                sub_total,
                tax_amount,
                final_amount,
                customer_note: customer_note || alreadyInvoice.customer_note,
                terms_condition: terms_condition || alreadyInvoice.terms_condition,
                items: items || alreadyInvoice.items,
                tax_rate: tax_rate || alreadyInvoice.tax_rate,
                customer_id: customer_id || alreadyInvoice.customer_id
            },
        });
        return NextResponse.json({ message: "Invoice updated successfully",'status':200 }, { status: 200 });
    } catch (error) {
        console.error("Error updating invoice:", error);
        return NextResponse.json({ error: "Failed to update invoice",'status':500 }, { status: 500 });
    }
}
