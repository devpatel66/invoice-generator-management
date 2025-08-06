import prisma from "@/app/api/lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const session: { user: { id: number, email: string, name: string } } | null = await getServerSession(authOptions) as { user: { id: number, email: string, name: string } } | null;
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const analysisData = await prisma.$queryRaw(
          Prisma.sql`
            SELECT
              SUM(final_amount) AS total_revenue,
              COUNT(DISTINCT customer_id) AS active_customers,
              COUNT(*) AS total_bills,
              ROUND(AVG(final_amount)::numeric, 2) AS average_bill_value
            FROM "Invoice"
            WHERE user_id = ${session.user.id}
          `
        );
        for(let key in analysisData[0]){
            analysisData[0][key] = Number(analysisData[0][key]);
        }
        const revenueByMonth = await prisma.$queryRaw(
          Prisma.sql`
            WITH months AS (
              SELECT to_char(date_trunc('year', CURRENT_DATE) + (interval '1 month' * generate_series(0, 11)), 'YYYY-MM') AS month
            )
            SELECT
              months.month,
              COALESCE(SUM(i.final_amount), 0) AS revenue,
              COALESCE(COUNT(i.invoice_id), 0) AS bills
            FROM months
            LEFT JOIN "Invoice" i
              ON to_char(date_trunc('month', i.invoice_date), 'YYYY-MM') = months.month
              AND i.user_id = ${session.user.id}
            GROUP BY months.month
            ORDER BY months.month
          `
        );
        console.log(revenueByMonth);
        const formattedRevenueByMonth = revenueByMonth.map(item => ({
          month: item.month,
          revenue: Number(item.revenue),
          bills: Number(item.bills),
        }));
        const finalData = formattedRevenueByMonth.map(item => {
          const [year, month] = item.month.split('-');
          const date = new Date(Number(year), Number(month) - 1);
          const monthName = date.toLocaleString('default', { month: 'short' }); // "May", "Jun", etc.
        
          return {
            ...item,
            month: monthName,
          };
        });
        
console.log(finalData);

        const topCustomers = await prisma.$queryRaw`
  SELECT
    c.name AS customer,
    SUM(i.final_amount) AS revenue,
    COUNT(i.invoice_id) AS total_bills
  FROM "Invoice" i
  JOIN "Customer" c ON i.customer_id = c.customer_id
  WHERE i.user_id = ${session.user.id}
    AND i.payment_status = 'paid'
  GROUP BY c.customer_id, c.name
  ORDER BY revenue DESC
  LIMIT 5;
`;
// console.log(topCustomers);

for(let customers in topCustomers){
  topCustomers[customers].total_bills = Number(topCustomers[customers].total_bills);
}
//         const paymentMethodStats = await prisma.$queryRaw`
//   SELECT
//     method AS payment_method,
//     SUM(amount) AS total_amount
//   FROM "Payment"
//   WHERE status = 'paid'
//   GROUP BY payment_method
//   ORDER BY total_amount DESC;
// `;

// bill status distribution
const statusDistribution = await prisma.$queryRaw`
SELECT
    SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) AS paid_count,
    SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date >= NOW() THEN 1 ELSE 0 END) AS pending_count,
    SUM(CASE WHEN payment_status = 'unpaid' AND invoice_due_date < NOW() THEN 1 ELSE 0 END) AS overdue_count
FROM "Invoice"
WHERE user_id = ${session.user.id};
`;

for(let key in statusDistribution[0]){
    statusDistribution[0][key] = Number(statusDistribution[0][key]);
}

        return NextResponse.json({ analysisData, "revenueByMonth":finalData, topCustomers, statusDistribution, message: 'success', status: 200 }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to fetch invoices" }, { status: 500 });
    }
}