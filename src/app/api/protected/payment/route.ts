import prisma from "@/app/api/lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
    try {
        const session: { user: { id: number, email: string, name: string } } | null = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }

        // Get user ID from session
        const userId = session.user.id;

        // Fetch all payments for the user
        const payments = await prisma.payment.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                created_at: "desc",
            },
            include: {
                invoice: true,
                customer: {
                    include: {
                        company: true,
                    }
                }
            }
        });

        let paymentStats = await prisma.$queryRaw`
SELECT
    -- Amounts
    COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN final_amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date >= NOW() THEN final_amount ELSE 0 END), 0) AS pending_amount,
    COALESCE(SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date < NOW() THEN final_amount ELSE 0 END), 0) AS overdue_amount,

    -- Counts
    COUNT(*) AS total_invoices,
    SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
    SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date >= NOW() THEN 1 ELSE 0 END) AS pending_count,
    SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date < NOW() THEN 1 ELSE 0 END) AS overdue_count,

    -- Success Rate
    CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2)
    END AS success_rate
FROM "Invoice"
WHERE user_id = ${userId};
`;

        
    for(let keys of Object.keys(paymentStats[0])){
        paymentStats[0][keys] = Number(paymentStats[0][keys]);
    }
    //    console.log(paymentStats);

        return NextResponse.json({ 'message': 'Payments fetched successfully`', payments, paymentStats, status: 200 }, { status: 200 });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json({ error: "Failed to fetch payments", status: 500 }, { status: 500 });
    }
}