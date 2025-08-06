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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MoreVertical,
  Plus,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building,
  FileText,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  User,
  Link,
  Hash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import customerAPI from "@/services/customer";
import { string } from "zod";
import { toast } from "react-toastify";
interface Invoice {
  invoice_id: string;
  invoice_number: number;
  invoice_date: string;
  invoice_due_date: string;
  final_amount: number;
  payment_status: string;
}
interface Company {
  compy_id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  gst_number?: string;
}

interface Customer {
  company_id: number;
  customer_id: number;
  name: string;
  user_id: number;
  totalBilledAmount: number;
  latestInvoice?: Invoice;
  totalBillCount: number;
  company: Company;
  invoices: Invoice[];
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] =
    useState(false);
  const [isGenerateBillDialogOpen, setIsGenerateBillDialogOpen] =
    useState(false);
  const [isViewBillsSheetOpen, setIsViewBillsSheetOpen] = useState(false);
  const [isViewDetailsSheetOpen, setIsViewDetailsSheetOpen] = useState(false);
  // working on edit customer
  const [newCustomer, setNewCustomer] = useState({
    customer_id: 0,
    customer_name: "",
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
    companyGstNumber: "",
  });
  const [isPending, startTransition] = useTransition();
  const [newBill, setNewBill] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
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

  const handleAddCustomer = () => {
    startTransition(async () => {
      const response = await customerAPI.createCustomer(newCustomer);
      if (response.status === 200) {
        toast.success("Customer added successfully");
        await fetchCustomers();
        setNewCustomer({
          customer_id: 0,
          customer_name: "",
          companyName: "",
          companyAddress: "",
          companyPhone: "",
          companyEmail: "",
          companyWebsite: "",
          companyGstNumber: "",
        });
        setIsNewCustomerDialogOpen(false);
      } else if (response.status === 500) {
        toast.error("Something went wrong");
      } else {
        toast.error(response.message);
      }
    });
    // setCustomers([...customers, customer]);
  };
  async function fetchCustomers() {
    const response = await customerAPI.getCustomers();
    console.log(response);
    setCustomers(response.data);
  }

  const handleEditCustomer = () => {
    startTransition(async () => {
      const response = await customerAPI.updateCustomer(newCustomer);
      if (response.status === 200) {
        toast.success("Customer updated successfully");
        await fetchCustomers();
        setIsEditCustomerDialogOpen(false);
      } else if (response.status === 500) {
        toast.error("Something went wrong");
      } else {
        toast.error(response.message);
      }
    });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customer relationships and billing information
          </p>
        </div>
        <Dialog
          open={isNewCustomerDialogOpen}
          onOpenChange={setIsNewCustomerDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter the customer's information below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  value={newCustomer.customer_name}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      customer_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={newCustomer.companyName}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      companyName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.companyEmail}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      companyEmail: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCustomer.companyPhone}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      companyPhone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newCustomer.companyAddress}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      companyAddress: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">GST Number</Label>
                <Input
                  id="phone"
                  value={newCustomer.companyGstNumber}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      companyGstNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Website Link</Label>
                <Input
                  id="phone"
                  value={newCustomer.companyWebsite}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      companyWebsite: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNewCustomerDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={isPending} onClick={handleAddCustomer}>{isPending ? "Adding..." : "Add Customer"   }</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-200">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
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
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Customer Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("totalBilled")}>
                  Total Billed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("lastBill")}>
                  Last Bill Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("status")}>
                  Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Bill Amount</TableHead>
                <TableHead>Total Bill Count</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Bills</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers && customers.length > 0 ? (
                customers.map((customer, index) => (
                  <TableRow key={index} className="group">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {customer.company.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="w-4 h-4 mr-2" />
                          {customer.company.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2" />
                          {customer.company.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Building className="w-4 h-4 mr-2" />
                          {customer.company.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        &#8377;{customer?.totalBilledAmount.toLocaleString()}
                      </div>
                    </TableCell>

                    <TableCell>{customer.totalBillCount}</TableCell>
                    {/* <TableCell>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1 text-gray-400" />
                        {customer?.totalBillCount }
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex items-center">
                        {customer?.created_at.split("T")[0]}
                      </div>
                    </TableCell>
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
                              setSelectedCustomer(customer);
                              setIsViewDetailsSheetOpen(true);
                            }}
                          >
                            <User className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setNewCustomer({
                                customer_id: customer.customer_id,
                                customer_name: customer.name,
                                companyEmail: customer.company.email,
                                companyPhone: customer.company.phone,
                                companyAddress: customer.company.address,
                                companyName: customer.company.name,
                                companyWebsite: customer.company.website,
                                companyGstNumber: customer.company.gst_number,
                              });
                              setIsEditCustomerDialogOpen(true);
                            }}
                          >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsGenerateBillDialogOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Generate Bill
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsViewBillsSheetOpen(true);
                            }}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Bills
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog
        open={isEditCustomerDialogOpen}
        onOpenChange={setIsEditCustomerDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer's information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name</Label>
              <Input
                id="edit-name"
                value={newCustomer.customer_name}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    customer_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Company Name</Label>
              <Input
                id="edit-name"
                value={newCustomer.companyName}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    companyName: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newCustomer.companyEmail}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    companyEmail: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={newCustomer.companyPhone}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    companyPhone: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={newCustomer.companyAddress}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    companyAddress: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">GST Number</Label>
              <Input
                id="edit-phone"
                value={newCustomer.companyGstNumber}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    companyGstNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Website Link</Label>
              <Input
                id="edit-phone"
                value={newCustomer.companyWebsite}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    companyWebsite: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditCustomerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isPending} onClick={handleEditCustomer}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Bill Dialog */}
      <Dialog
        open={isGenerateBillDialogOpen}
        onOpenChange={setIsGenerateBillDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Bill</DialogTitle>
            <DialogDescription>
              Create a new bill for {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bill-amount">Amount</Label>
              <div className="relative">
                <p className="w-4 h-4 text-gray-500 mr-1">&#8377;</p>
                <Input
                  id="bill-amount"
                  type="number"
                  className="pl-10"
                  value={newBill.amount}
                  onChange={(e) =>
                    setNewBill({ ...newBill, amount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="bill-date"
                  type="date"
                  className="pl-10"
                  value={newBill.date}
                  onChange={(e) =>
                    setNewBill({ ...newBill, date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-description">Description</Label>
              <Textarea
                id="bill-description"
                value={newBill.description}
                onChange={(e) =>
                  setNewBill({ ...newBill, description: e.target.value })
                }
                placeholder="Enter bill details..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateBillDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button>Generate Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bills Sheet */}
      <Sheet open={isViewBillsSheetOpen} onOpenChange={setIsViewBillsSheetOpen}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Invoice History</SheetTitle>
            <SheetDescription>
              View all bills for {selectedCustomer?.name}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <div className="space-y-4">
              {selectedCustomer?.invoices.map((invoice, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Invoice Number :
                        {invoice.invoice_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        {invoice.invoice_date.split("T")[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        &#8377;{invoice.final_amount.toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          invoice.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {invoice.payment_status.charAt(0).toUpperCase() +
                          invoice.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Details Sheet */}
      <div>
        <Sheet
          open={isViewDetailsSheetOpen}
          onOpenChange={setIsViewDetailsSheetOpen}
        >
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Customer Details</SheetTitle>
              <SheetDescription>
                Detailed information about {selectedCustomer?.name}
              </SheetDescription>
            </SheetHeader>
            {selectedCustomer && (
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Basic Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">{selectedCustomer.name}</p>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {selectedCustomer.company.name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {selectedCustomer.company.email}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {selectedCustomer.company.phone}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {selectedCustomer.company.address}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {selectedCustomer.company.gst_number}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Link className="w-4 h-4 mr-2 text-gray-400" />
                      <p className="text-gray-900">
                        {selectedCustomer.company.website}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Billing Summary
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <p className="text-sm text-gray-500">Total Billed</p>
                      <p className="text-lg font-medium text-gray-900">
                        &#8377;
                        {selectedCustomer.totalBilledAmount.toLocaleString()}
                      </p>
                    </Card>
                    <Card className="p-4">
                      <p className="text-sm text-gray-500">Total Bills</p>
                      <p className="text-lg font-medium text-gray-900">
                        {selectedCustomer.totalBillCount}
                      </p>
                    </Card>
                  </div>
                </div>

                {/* <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Recent Activity
                  </h3>
                  <div className="mt-2">
                    <Card className="p-4">
                      <p className="text-sm text-gray-500">Last Bill</p>
                      <p className="text-gray-900">
                        {selectedCustomer.lastBill}
                      </p>
                    </Card>
                  </div>
                </div> */}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
