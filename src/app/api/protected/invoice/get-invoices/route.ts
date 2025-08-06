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
        console.log(userId);
        // Fetch all invoices for the user
        const invoices = await prisma.invoice.findMany({
            where: {
              user_id: userId,
            },
            orderBy: {
              invoice_date: "desc",
            },
            include: {
              customer: {
                include: {
                  company: true,  // fetch company inside customer
                }
              }
            }
          });
          

        return NextResponse.json({ 'message':'Invoices fetched successfully`',invoices, status: 200 },{status:200});
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return NextResponse.json({ error: "Failed to fetch invoices", status: 500 }, { status: 500 });
    }
}