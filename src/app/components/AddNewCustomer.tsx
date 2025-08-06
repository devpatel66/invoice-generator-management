"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import customerAPI from "@/services/customer";
import products from "razorpay/dist/types/products";
import { toast } from "react-toastify";
interface AddCustomer {
  customer_name: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyWebsite?: string;
  companyGstNumber?: string;
}
interface Customer {
  name: string;
  company_id: string;
  customer_id: string;
  company: {
    compy_id: string;
    name: string;
    address: string;
    email: string;
    gst_number: string;
    user_id: string;
    phone: string;
    website: string;
  };
}

export default function AddCustomer({ setClientDetails,selectedCustomer }: any) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCustomer, setNewCustomer] = useState<AddCustomer>({
    customer_name: "",
    companyEmail: "",
    companyPhone: "",
    companyAddress: "",
    companyWebsite: "",
    companyGstNumber: "",
    companyName: "",
  });

  const filteredCustomers = customers?.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getCustomers();

      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const handleAddCustomer = async () => {
    const response = await customerAPI.createCustomer(newCustomer);
    // console.log(response);

    if (response.status == 400) {
      toast.error(response.message);
      return;
    } else if (response.status == 200) {
      await fetchCustomers();
      toast.success("Customer added successfully");
    } else {
      toast.error("Something went wrong");
    }

    setNewCustomer({
      customer_name: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      companyWebsite: "",
      companyGstNumber: "",
      companyName: "",
    });
    // Close the dialog
    const closeEvent = new Event("close-dialog");
    document.dispatchEvent(closeEvent);
  };

  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(selectedCustomer?.name);
  useEffect(() => {
    
    if(selectedCustomer){
      setClientDetails(selectedCustomer.customer_id);
      setSelectedCustomerName(selectedCustomer.name);
    }
    const closeDialog = () => {
      const dialogElement = document.querySelector("[data-state='open']");
      if (dialogElement) {
        const closeButton = dialogElement.querySelector(
          "button[data-state='closed']"
        );
        if (closeButton) {
          (closeButton as HTMLButtonElement).click();
        }
      }
    };

    fetchCustomers();

    document.addEventListener("close-dialog", closeDialog);

    return () => {
      document.removeEventListener("close-dialog", closeDialog);
    };
  }, []);
  const handleChange = (id: string) => {
    // console.log(id);

    const cust = customers.find(
      (customer) => customer.customer_id === id
    );
    // console.log(selectedCustomer?.name);

    if (cust) {
      setSelectedCustomerName(cust.name);
      setClientDetails(cust.customer_id);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Label htmlFor="customerId">Customer {selectedCustomer && "Name : " + selectedCustomer.name}</Label>
        <Select onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a customer">
              {selectedCustomerName
                ? selectedCustomerName
                : "Select a customer"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="p-2">
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            {filteredCustomers && filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <SelectItem
                  key={customer.customer_id}
                  value={customer.customer_id}
                >
                  {customer.name}
                </SelectItem>
              ))
            ) : (
              <p>No customers found</p>
            )}
            <div className="p-2 border-t">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Add New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new customer here.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newCustomer.customer_name}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            customer_name: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Company Name
                      </Label>
                      <Input
                        id="companyName"
                        value={newCustomer.companyName}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            companyName: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
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
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="companyPhone" className="text-right">
                        Phone Number
                      </Label>
                      <Input
                        id="companyPhone"
                        value={newCustomer.companyPhone}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            companyPhone: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={newCustomer.companyAddress}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            companyAddress: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">
                        GST Number
                      </Label>
                      <Input
                        id="gstNumber"
                        value={newCustomer.companyGstNumber}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            companyGstNumber: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">
                        Company Website
                      </Label>
                      <Input
                        id="companyWebsite"
                        value={newCustomer.companyWebsite}
                        onChange={(e) =>
                          setNewCustomer({
                            ...newCustomer,
                            companyWebsite: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddCustomer}>Add Customer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </SelectContent>
        </Select>
        {/* {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>} */}
      </div>
    </div>
  );
}
