import prisma from "@/app/api/lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
    try {
        const session : { user: { id: number,email : string,name:string } } | null = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }
        
        // Get user ID from session
        const userId = session.user.id;

        // Fetch all customers for the user
        const customers = await prisma.customer.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                name: "asc",
            },
            include: {
                company: true,
                invoices: {
                    orderBy: {
                        invoice_date: "desc",
                    }
                }
            }
        });

        const customersWithBillingData = customers.map(customer => {
            const totalBillCount = customer.invoices.length;
            const totalBilledAmount = customer.invoices.reduce((sum, invoice) => sum + invoice.final_amount, 0);
            const latestInvoice = customer.invoices[0] || null;
        
            return {
                ...customer,
                totalBillCount,
                totalBilledAmount,
                latestInvoice
            };
        });

        return NextResponse.json({ 'message':'Customers fetched successfully`',data:customersWithBillingData, status: 200 },{status:200});
    } catch (error) {
        console.error("Error fetching Customers:", error);
        return NextResponse.json({ error: "Failed to fetch Customers", status: 500 }, { status: 500 });
    }
}