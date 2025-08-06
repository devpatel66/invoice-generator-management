// app/api/generate-invoice/route.ts
import  {generateInvoicePDF}  from '@/lib/invoice-pdf-generate';
import { NextResponse } from 'next/server';
import prisma from '@/app/api/lib/prismaClient';



export async function GET(request: NextRequest, { params }: { params: { invoice_id: string } }) {
  try {
    const {invoice_id} = params 
    const invoiceData = await prisma.invoice.findUnique({
      where: {
        invoice_id: invoice_id,
      },
      include:{
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
    })
    console.log(invoiceData.user);
    
    const pdfBuffer = await generateInvoicePDF(invoiceData);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoice_number}.pdf"`
      }
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}