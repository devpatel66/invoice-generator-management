"use client";

import { useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { ArrowUpDown, CreditCard, Download, Eye, Filter, MoreVertical, Search, Receipt, Wallet, Ban as Bank, DollarSign, CalendarDays, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import paymentAPI from "@/services/payment";
import { toast } from "react-toastify";
// Sample payment data
const initialPayments = [
  {
    id: "pay_QKATuUStTqEmmo",
    billId: "INV-1-1",
    customer: "Red-Haired Pirates Ltd.",
    amount: 75000,
    method: "gold_coins",
    status: "completed",
    date: "2024-03-14",
    bankRef: "REDHAIR-123456",
  },
];


export default function PaymentsPage() {
  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedPayment, setSelectedPayment] = useState<typeof initialPayments[0] | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [paymentStat,setPaymentStat] = useState();
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const fetchPayments = async () => {
    startTransition(async () => {
      try {
        const response = await paymentAPI.getPayementAnalytics();
        console.log(response.paymentStats);
        if(response.status == 200){
          setPayments(response.payments);
          setPaymentStat(response.paymentStats[0]);
        }else if(response.status == 500){
          toast.error(response.error);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    })
  };
  useEffect(() => {
    fetchPayments();
  }, []);

  // if (isPending) {
  //   return <div>Loading...</div>;
  // }
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch = Object.values(payment).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = !statusFilter || payment.status === statusFilter;
      const matchesMethod = !methodFilter || payment.method === methodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "failed":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="w-4 h-4 mr-2 text-blue-600" />;
      case "bank_transfer":
        return <Bank className="w-4 h-4 mr-2 text-green-600" />;
      case "wallet":
        return <Wallet className="w-4 h-4 mr-2 text-amber-600" />;
      default:
        return null;
    }
  };

  const totalRevenue = payments.reduce((sum, payment) => 
    payment.status === "completed" ? sum + payment.amount : sum, 0
  );

  const pendingAmount = payments.reduce((sum, payment) => 
    payment.status === "pending" ? sum + payment.amount : sum, 0
  );

  const failedAmount = payments.reduce((sum, payment) => 
    payment.status === "failed" ? sum + payment.amount : sum, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Payment History</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage all payment transactions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">
                &#8377;{paymentStat?.total_revenue.toLocaleString()}
              </h3>
              <p className="flex items-center text-sm font-medium text-green-600 mt-2">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {paymentStat?.paid_count} payments
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <p className="w-6 h-6 text-blue-600 text-center" >&#8377;</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">
                &#8377;{paymentStat?.pending_amount.toLocaleString()}
              </h3>
              <p className="flex items-center text-sm font-medium text-amber-600 mt-2">
                <Clock className="w-4 h-4 mr-1" />
                {paymentStat?.pending_count} payments
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">
                &#8377;{paymentStat?.overdue_amount.toLocaleString()}
              </h3>
              <p className="flex items-center text-sm font-medium text-red-600 mt-2">
                <XCircle className="w-4 h-4 mr-1" />
                {paymentStat?.overdue_count} payments
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <h3 className="text-2xl font-semibold text-gray-900 mt-1">
                {paymentStat?.success_rate}%
              </h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSort("date")}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("amount")}>
                  Amount
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("status")}>
                  Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razorpay Payment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment,index) => (
                <TableRow key={index} className="group">
                  <TableCell className="font-medium">{payment.razorpay_payment_id}</TableCell>
                  <TableCell>{payment.customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <p className="w-4 h-4 text-gray-500 mr-1" >&#8377;</p>
                      {payment.amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getMethodIcon(payment.method)}
                      <span className="capitalize">
                        {payment.method.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusColor(payment.status)
                      )}
                    >
                      {getStatusIcon(payment.status)}
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{payment?.created_at?.split('T')[0]}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsViewDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          <a href={`/api/pdf/${payment.invoice_id}`}>Download PDF</a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about payment {selectedPayment?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Razorpay Payment ID</Label>
                  <p className="text-sm font-medium">{selectedPayment.razorpay_payment_id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Invoice ID</Label>
                  <p className="text-sm font-medium">{selectedPayment.invoice_id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Customer</Label>
                  <p className="text-sm font-medium">{selectedPayment.customer.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Amount</Label>
                  <p className="text-sm font-medium">
                    &#8377;{selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Method</Label>
                  <div className="flex items-center mt-1">
                    {getMethodIcon(selectedPayment.method)}
                    <span className="text-sm font-medium capitalize">
                      {selectedPayment.method.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                      getStatusColor(selectedPayment.status)
                    )}
                  >
                    {getStatusIcon(selectedPayment.status)}
                    {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                  </span>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Date</Label>
                  <p className="text-sm font-medium">{selectedPayment.created_at.split('T')[0]}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">
                    {selectedPayment.method === "credit_card" && "Card Details"}
                    {selectedPayment.method === "bank_transfer" && "Bank Reference"}
                    {selectedPayment.method === "wallet" && "Wallet ID"}
                  </Label>
                  <p className="text-sm font-medium">
                    {selectedPayment.method === "credit_card" && `**** &#8377;{selectedPayment.cardLast4}`}
                    {selectedPayment.method === "bank_transfer" && selectedPayment.bankRef}
                    {selectedPayment.method === "wallet" && selectedPayment.walletId}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}