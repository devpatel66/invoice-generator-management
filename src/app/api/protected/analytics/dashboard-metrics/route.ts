import prisma from "@/app/api/lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
    try {
        const session: { user: { id: number, email: string, name: string } } | null = await getServerSession(authOptions) as { user: { id: number, email: string, name: string } } | null;
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Get revenue statistics
        const revenueStats: { total_revenue: number, pending_amount: number, overdue_amount: number, collected_amount: number, pending_count: number, overdue_count: number }[] = await prisma.$queryRaw`
            SELECT
                SUM(final_amount) AS total_revenue,
                SUM(CASE WHEN payment_status = 'unpaid' THEN final_amount ELSE 0 END) AS pending_amount,
                COUNT(CASE WHEN payment_status = 'unpaid' THEN 1 END) AS pending_count,
                
                SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date < NOW() THEN final_amount ELSE 0 END) AS overdue_amount,
                COUNT(CASE WHEN payment_status = 'unpaid' AND invoice_due_date < NOW() THEN 1 END) AS overdue_count,
                
                SUM(CASE WHEN payment_status = 'paid' THEN final_amount ELSE 0 END) AS collected_amount
            FROM "Invoice"
            WHERE user_id = ${session.user.id};
        `;

        // Add collection rate to the stats
        let stats = revenueStats[0];
        const collectionRate = stats.total_revenue > 0
            ? (stats.collected_amount / stats.total_revenue) * 100
            : 0;

        for (let keys of Object.keys(stats)) {
            stats[keys] = Number(stats[keys]);
        }

        // Add collection rate to the stats
        Object.assign(stats, { collectionRate: `${collectionRate.toFixed(2)}%` });

        // console.log({
        //     totalRevenue: stats.total_revenue,
        //     pendingAmount: stats.pending_amount,
        //     overdueAmount: stats.overdue_amount,
        //     pendingCount: stats.pending_count,
        //     overdueCount: stats.overdue_count,
        //     collectionRate: `${collectionRate.toFixed(2)}%`
        // });

        // recent invoices
        const recentInvoices = await prisma.invoice.findMany({
            where: {
                user_id: session.user.id
            },
            include: {
                customer: true
            },
            orderBy: {
                invoice_date: 'desc'
            },
            take: 5
        });

        // revenue trend
        const revenueTrend = await prisma.$queryRaw`
  SELECT
    TO_CHAR(date_trunc('month', invoice_date), 'Mon') AS name,
    SUM(final_amount) AS value
  FROM "Invoice"
  WHERE user_id = ${session.user.id}
  GROUP BY name, date_trunc('month', invoice_date)
  ORDER BY date_trunc('month', invoice_date) ASC;
`;


        // console.log(revenueTrend);

        // bill status distribution
        const statusDistribution = await prisma.$queryRaw`
            SELECT
                SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS Paid,
                SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date >= NOW() THEN 1 ELSE 0 END) AS Pending,
                SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date < NOW() THEN 1 ELSE 0 END) AS Overdue
            FROM "Invoice"
            WHERE user_id = ${session.user.id};
        `;

        console.log(statusDistribution);
        for (let keys of Object.keys(statusDistribution[0])) {
            statusDistribution[0][keys] = Number(statusDistribution[0][keys]);
        }


        return NextResponse.json({ revenueStats, recentInvoices, revenueTrend, statusDistribution, 'message': 'success', 'status': 200 }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to fetch invoices" }, { status: 500 });
    }
}