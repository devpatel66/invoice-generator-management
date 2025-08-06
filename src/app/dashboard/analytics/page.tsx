"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, FileText, TrendingUp, Calendar, Download, Filter, FileDown, Table as TableIcon, ChevronDown, FileText as FileText2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import analyticsAPI from "@/services/analytics";
import { toast } from "react-toastify";
import { set } from "react-hook-form";
// Sample data
const revenueData = [
  { month: "Jan", revenue: 45000, bills: 32 },
  { month: "Feb", revenue: 52000, bills: 38 },
  { month: "Mar", revenue: 48000, bills: 35 },
  { month: "Apr", revenue: 61000, bills: 42 },
  { month: "May", revenue: 55000, bills: 39 },
  { month: "Jun", revenue: 67000, bills: 45 },
  { month: "Jul", revenue: 72000, bills: 48 },
  { month: "Aug", revenue: 69000, bills: 46 },
  { month: "Sep", revenue: 75000, bills: 50 },
  { month: "Oct", revenue: 82000, bills: 54 },
  { month: "Nov", revenue: 87000, bills: 58 },
  { month: "Dec", revenue: 92000, bills: 62 },
];

// Top customers data
// const topCustomersData = [
//   { customer: "Tech Solutions Inc.", revenue: 285000 },
//   { customer: "Global Innovations", revenue: 195000 },
//   { customer: "Digital Services Co.", revenue: 168000 },
//   { customer: "Smart Systems Ltd.", revenue: 142000 },
//   { customer: "Future Technologies", revenue: 98000 },
// ];

// const billStatusData = [
//   { name: "Paid", value: 68 },
//   { name: "Pending", value: 22 },
//   { name: "Overdue", value: 10 },
// ];

const paymentMethodData = [
  { method: "Credit Card", amount: 45000 },
  { method: "Bank Transfer", amount: 32000 },
  { method: "Digital Wallet", amount: 18000 },
  { method: "Other", amount: 5000 },
];

const COLORS = {
  revenue: ["#2563eb", "#60a5fa"],
  customers: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
  status: ["#22c55e", "#f59e0b", "#ef4444"],
  payment: ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef"]
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [exportDataset, setExportDataset] = useState<string | null>(null);


  const [analysisData,setAnalysisData] = useState();
  const [revenueByMonth,setRevenueByMonth] = useState();
  const [topCustomersData,setTopCustomers] = useState();
  const [billStatusData,setStatusDistribution] = useState();
  const handleExport = (type: string, dataset: string) => {
    setExportType(type);
    setExportDataset(dataset);
    setIsExportDialogOpen(true);
  };

  async function fetchDetails() {
    const response = await analyticsAPI.getAnalytics();
    console.log(response);
    
    if(response.status == 200){
      setAnalysisData(response.analysisData[0]);
      setRevenueByMonth(response.revenueByMonth);
      setTopCustomers(response.topCustomers);
      setStatusDistribution([
        { name: "Paid", value: response.statusDistribution[0].paid_count },
        { name: "Pending", value: response.statusDistribution[0].pending_count },
        { name: "Overdue", value: response.statusDistribution[0].overdue_count },
      ]);
    }else{
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    fetchDetails();
  }, []);

  const generateExport = () => {
    // In a real app, this would generate and download the file
    // For this demo, we'll just simulate the export process
    
    let dataToExport;
    switch (exportDataset) {
      case "revenue":
        dataToExport = revenueData;
        break;
      case "customers":
        dataToExport = topCustomersData;
        break;
      case "billStatus":
        dataToExport = billStatusData;
        break;
      case "paymentMethods":
        dataToExport = paymentMethodData;
        break;
      default:
        dataToExport = revenueData;
    }
    
    // Convert data to CSV or JSON string
    let exportContent = '';
    if (exportType === 'csv') {
      // Create CSV header
      const headers = Object.keys(dataToExport[0]).join(',');
      // Create CSV rows
      const rows = dataToExport.map(item => Object.values(item).join(',')).join('\n');
      exportContent = `${headers}\n${rows}`;
    } else if (exportType === 'json') {
      exportContent = JSON.stringify(dataToExport, null, 2);
    } else if (exportType === 'excel') {
      // In a real app, this would use a library to generate Excel files
      exportContent = 'Excel export would be generated here';
    }
    
    // In a real app, this would trigger a download
    console.log(`Exporting ${exportDataset} as ${exportType}:`, exportContent);
    
    // Close the dialog
    setIsExportDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          
          
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleExport('pdf', 'dashboard')}>
                <FileText2 className="w-4 h-4 mr-2" />
                Export Dashboard as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv', 'revenue')}>
                <TableIcon className="w-4 h-4 mr-2" />
                Export Revenue Data (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv', 'customers')}>
                <TableIcon className="w-4 h-4 mr-2" />
                Export Customer Data (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json', 'dashboard')}>
                <FileDown className="w-4 h-4 mr-2" />
                Export All Data (JSON)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">&#8377;{analysisData?.total_revenue}</h3>
              <p className="flex items-center text-sm font-medium text-green-600 mt-2">
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">{analysisData?.active_customers}</h3>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">{analysisData?.total_bills}</h3>
            </div>
            <div className="p-3 bg-violet-100 rounded-lg">
              <FileText className="w-6 h-6 text-violet-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Bill Value</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">&#8377;{analysisData?.average_bill_value}</h3>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
            <p className="text-sm text-gray-500 mt-1">Monthly revenue and bills generated</p>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              defaultValue={selectedMetric} 
              onValueChange={(value) => setSelectedMetric(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="bills">Bills</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={COLORS.revenue[0]}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="bills"
                name="Bills"
                stroke={COLORS.revenue[1]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customers by Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers by Revenue</h3>
           
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCustomersData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="customer" type="category" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill={COLORS.customers[0]}>
                  {topCustomersData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.customers[index % COLORS.customers.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods */}
        {/* <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleExport('csv', 'paymentMethods')}
              title="Export Payment Methods Data"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="method" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="amount" fill={COLORS.payment[0]}>
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.payment[index % COLORS.payment.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card> */}

        {/* Bill Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Bill Status Distribution</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
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
                  {billStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Trends */}
        {/* <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Growth</h3>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleExport('csv', 'revenue')}
              title="Export Monthly Growth Data"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card> */}
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>
              Choose your preferred export format for {exportDataset} data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setExportType('csv')}
                data-state={exportType === 'csv' ? 'active' : 'inactive'}
              >
                <TableIcon className="mr-2 h-4 w-4" />
                <span>CSV (.csv)</span>
                {exportType === 'csv' && (
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setExportType('excel')}
                data-state={exportType === 'excel' ? 'active' : 'inactive'}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Excel (.xlsx)</span>
                {exportType === 'excel' && (
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setExportType('json')}
                data-state={exportType === 'json' ? 'active' : 'inactive'}
              >
                <FileDown className="mr-2 h-4 w-4" />
                <span>JSON (.json)</span>
                {exportType === 'json' && (
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => setExportType('pdf')}
                data-state={exportType === 'pdf' ? 'active' : 'inactive'}
              >
                <FileText2 className="mr-2 h-4 w-4" />
                <span>PDF (.pdf)</span>
                {exportType === 'pdf' && (
                  <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={generateExport}
              disabled={!exportType}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}