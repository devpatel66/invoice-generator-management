"use client";

import { use, useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Send,
  XCircle,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import invoiceAPI from "@/services/invoice";
import { toast } from "react-toastify";
import Link from "next/link";
import paymentAPI from "@/services/payment";
// Sample data
const initialBills = [
  {
    id: "INV-1-1",
    customer: "Red-Haired Pirates Ltd.",
    amount: 75000,
    status: "pending",
    dueDate: "2024-03-30",
    issuedDate: "2024-03-14",
    description: "Celebration at a tavern",
  },
  {
    id: "INV-1-2",
    customer: "Blackbeard Enterprises",
    amount: 200000,
    status: "overdue",
    dueDate: "2024-03-10",
    issuedDate: "2024-03-01",
    description: "New weapons and ship upgrades",
  },
  {
    id: "INV-1-3",
    customer: "Marine Headquarters",
    amount: 500000,
    status: "paid",
    dueDate: "2024-03-20",
    issuedDate: "2024-03-13",
    description: "Buster Call expenses",
  },
];


export default function BillsPage() {
  const [bills, setBills] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedBill, setSelectedBill] = useState<typeof initialBills[0] | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    customer: "",
    amount: "",
    status: "",
    dueDate: "",
    description: "",
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditClick = (bill: typeof initialBills[0]) => {
    setSelectedBill(bill);
    setEditForm({
      customer: bill.customer.name,
      amount: bill.final_amount.toString(),
      status: bill.status,
      dueDate: bill.dueDate,
      description: bill.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!selectedBill) return;

    const updatedBills = bills.map((bill) =>
      bill.id === selectedBill.id
        ? {
          ...bill,
          customer: editForm.customer,
          amount: parseFloat(editForm.amount),
          status: editForm.status,
          dueDate: editForm.dueDate,
          description: editForm.description,
        }
        : bill
    );

    setBills(updatedBills);
    setIsEditDialogOpen(false);
  };

  // const filteredBills = bills
  //   .filter((bill) => {
  //     const matchesSearch = Object.values(bill).some((value) =>
  //       value.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //     const matchesStatus = !statusFilter || bill.status === statusFilter;
  //     return matchesSearch && matchesStatus;
  //   })
  //   .sort((a, b) => {
  //     if (!sortField) return 0;
  //     const aValue = a[sortField as keyof typeof a];
  //     const bValue = b[sortField as keyof typeof b];
  //     if (sortDirection === "asc") {
  //       return aValue > bValue ? 1 : -1;
  //     }
  //     return aValue < bValue ? 1 : -1;
  //   });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-amber-100 text-amber-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case "unpaid":
        return <Clock className="w-4 h-4 mr-1" />;
      case "overdue":
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    async function fetchBills() {
      try {
        const response = await invoiceAPI.getAllInvoices();
        console.log(response);

        if (response.status == 200) {
          setBills(response.invoices);
        } else {
          toast.error(response.message);
        };
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    }

    fetchBills();
  }, [])
  const handleSendReminder = async (invoice_id: string) => {
    const response = await paymentAPI.sendPaymentReminder(invoice_id);
    if(response.status == 200) {
      toast.success("Reminder sent successfully");
    }else{
      toast.error("Something went wrong");
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manage Bills</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all your bills in one place
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Generate New Bill
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search bills..."
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
                <DropdownMenuItem onClick={() => setStatusFilter("paid")}>
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>
                  Overdue
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
                <DropdownMenuItem onClick={() => handleSort("dueDate")}>
                  Due Date
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

      {/* Bills Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills && bills.map((bill, index) => (
                <TableRow key={index} className="group">
                  <TableCell className="font-medium">{bill.invoice_id}</TableCell>
                  <TableCell>{bill.customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <p className="w-4 h-4 text-gray-500 mr-1" >&#8377;</p>
                      {bill.final_amount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusColor(bill.payment_status)
                      )}
                    >
                      {getStatusIcon(bill.status)}
                      {bill.payment_status.charAt(0).toUpperCase() + bill.payment_status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{bill.invoice_due_date.split("T")[0]}</TableCell>
                  <TableCell>{bill.invoice_date.split("T")[0]}</TableCell>
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
                            setSelectedBill(bill);
                            setIsViewDetailsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {
                          (bill.payment_status === "unpaid" || bill.payment_status === "overdue") &&
                          <DropdownMenuItem>
                          <Pencil className="w-4 h-4 mr-2" />
                          <Link href={`/dashboard/bills/edit-invoice/${bill.invoice_id}`}>Edit Bill</Link>
                        </DropdownMenuItem>
                        }
                        {
                          (bill.payment_status === "unpaid" || bill.payment_status === "overdue") &&
                          <DropdownMenuItem onClick={() => handleSendReminder(bill.invoice_id)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reminder
                        </DropdownMenuItem>
                        }
                        {
                          bill.payment_status === "paid" &&
                          <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          <a href={`/api/download-pdf/${bill.invoice_id}`}>Download PDF</a>
                        </DropdownMenuItem>
                        }
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
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>
              Detailed information about bill {selectedBill?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Bill ID</Label>
                  <p className="text-sm font-medium">{selectedBill.invoice_id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                      getStatusColor(selectedBill.payment_status)
                    )}
                  >
                    {getStatusIcon(selectedBill.payment_status)}
                    {selectedBill.payment_status.charAt(0).toUpperCase() + selectedBill.payment_status.slice(1)}
                  </span>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Customer</Label>
                  <p className="text-sm font-medium">{selectedBill.customer.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Amount</Label>
                  <p className="text-sm font-medium">
                    &#8377;{selectedBill.final_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Due Date</Label>
                  <p className="text-sm font-medium">{selectedBill.invoice_due_date.split("T")[0]}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Issued Date</Label>
                  <p className="text-sm font-medium">{selectedBill.invoice_date.split("T")[0]}</p>
                </div>
              </div>
              {/* <div>
                <Label className="text-sm text-gray-500">Description</Label>
                <p className="text-sm mt-1">{selectedBill.description}</p>
              </div> */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bill Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
            <DialogDescription>
              Update the details for bill {selectedBill?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Input
                id="customer"
                value={editForm.customer}
                onChange={(e) => setEditForm({ ...editForm, customer: e.target.value })}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  className="pl-10"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}