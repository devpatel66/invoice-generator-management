"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import analyticsAPI from "@/services/analytics";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";
const revenueData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

// const billStatusData = [
//   { name: "Paid", value: 65 },
//   { name: "Pending", value: 25 },
//   { name: "Overdue", value: 10 },
// ];

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const recentBills = [
  {
    id: "INV-1-1",
    customer: "Tech Solutions Inc.",
    amount: 2500,
    status: "paid",
    date: "2024-03-15"
  },
  {
    id: "INV-1-2",
    customer: "Global Innovations",
    amount: 1800,
    status: "pending",
    date: "2024-03-14"
  },
  {
    id: "INV-1-3",
    customer: "Digital Services Co.",
    amount: 3200,
    status: "overdue",
    date: "2024-03-10"
  },
  {
    id: "INV-1-4",
    customer: "Smart Systems Ltd.",
    amount: 1500,
    status: "paid",
    date: "2024-03-13"
  }
];

export default function DashboardPage() {
  const [data, setData] = useState();
  const [billStatusData,setBillStatusData] = useState();
  const [revenueStats,setRevenueStats] = useState();
  useEffect(() => {
    async function getAnalytics() {
     const response = await analyticsAPI.getDashBoardAnalytics();
     console.log(response);
     
     const data = [
      { name: "Paid", value: response.statusDistribution[0].paid },
      { name: "Pending", value: response.statusDistribution[0].pending },
      { name: "Overdue", value: response.statusDistribution[0].overdue },
    ];
     setBillStatusData(data);
     setData(response);
     setRevenueStats(response.revenueStats[0]);
    }

    getAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {/* <div className="flex flex-wrap gap-4">
        <Button className="bg-pirate-oceanBlue text-white hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />
          Generate New Bill
        </Button>
        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <Clock className="w-4 h-4 mr-2" />
          View Pending Bills
        </Button>
      </div> */}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">&#8377;{revenueStats?.total_revenue}</h3>
              {/* <p className="flex items-center text-sm font-medium text-green-600 mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                12.5%
              </p> */}
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">&#8377;{revenueStats?.pending_amount}</h3>
              <p className="flex items-center text-sm font-medium text-amber-600 mt-2">
                <Clock className="w-4 h-4 mr-1" />
                {revenueStats?.pending_count} bills
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">&#8377;{revenueStats?.overdue_amount}</h3>
              <p className="flex items-center text-sm font-medium text-red-600 mt-2">
                <XCircle className="w-4 h-4 mr-1" />
                {revenueStats?.overdue_count} bills
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">{revenueStats?.collectionRate}</h3>
              {/* <p className="flex items-center text-sm font-medium text-green-600 mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                3.2%
              </p> */}
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-80">
            {data && data.revenueTrend ? <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer> : null}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bill Status Distribution</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="h-80">
            {billStatusData && billStatusData ? <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={billStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {billStatusData && billStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer> : null}
            <div className="flex justify-center space-x-6">
              {billStatusData && billStatusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Bills */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bills</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 text-sm font-semibold text-gray-600">Invoice ID</th>
                <th className="pb-3 text-sm font-semibold text-gray-600">Customer</th>
                <th className="pb-3 text-sm font-semibold text-gray-600">Amount</th>
                <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data && data.recentInvoices ? data.recentInvoices.map((bill,index) => (
                <tr key={index} className="group hover:bg-gray-50">
                  <td className="py-4 text-sm font-medium text-gray-900">{bill.invoice_id}</td>
                  <td className="py-4 text-sm text-gray-600">{bill.customer.name}</td>
                  <td className="py-4 text-sm text-gray-900">&#8377;{bill.final_amount.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      bill.payment_status === "paid" && "bg-green-100 text-green-800",
                      bill.payment_status === "unpaid" && "bg-amber-100 text-amber-800",
                      bill.payment_status === "overdue" && "bg-red-100 text-red-800"
                    )}>
                      {bill.payment_status.charAt(0).toUpperCase() + bill.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-600">{bill.created_at}</td>
                </tr>
              )) : null}  
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}