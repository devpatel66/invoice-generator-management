"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Building,
  FileText,
  Ban as Bank,
  CreditCard,
  User,
  Hash,
  Calendar,
  PlusCircle,
  Pencil,
} from "lucide-react";
import companyAPI from "@/services/company";
import bankAPI from "@/services/bank";
import { toast } from "react-toastify";
import { set } from "react-hook-form";
import { getBankDetailsByIfsc, isValidIFSC } from "@/services/ifsc";
// Sample initial data - in a real app, this would come from your backend
const initialCompanyDetails = {
  name: "Tech Solutions Inc.",
  email: "contact@techsolutions.com",
  phone: "+1 (555) 123-4567",
  website: "https://techsolutions.com",
  address: "123 Innovation Street, Tech Valley, CA 94025",
  gst_nummber: "",
};

interface CompanyDetails {
  company_id?: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  gst_number: string;
}
interface BankDetails {
  bank_id?: number;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  bank_address: string;
  ifsc_code: string;
  swift_code: string;
  account_type: string;
}



export default function CompanySettingsPage() {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null
  );
  const [isAddNewCompanyOpen, setIsAddNewCompanyOpen] = useState(false);
  const [addBankForm, setAddBankForm] = useState(false);
  const [addCompanyFormError, setAddCompanyFormError] = useState();
  const [bankDetails, setBankDetails] = useState<BankDetails>();
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editCompanyForm, setEditCompanyForm] = useState<CompanyDetails>();
  const [editBankForm, setEditBankForm] = useState<BankDetails>();
  const [isPending, startTransition] = useTransition();
  const [ifscDetails, setIfscDetails] = useState<any>();
  const [ifscDetailsError, setIfscDetailsError] = useState<string>();
  async function fetchCompanyDetails() {
    startTransition(async () => {
      const response = await companyAPI.getCompany();
      // console.log(response);
      if (response.status === 200) {
        setCompanyDetails(response.data);
        setIsAddNewCompanyOpen(false);
      } else if (response.status === 400) {
        toast.error(response.message);
      } else if (response.status === 500) {
        toast.error("Something went wrong");
      }
    });
  }

  async function fetchBankDetails() {
    startTransition(async () => {
      const response = await bankAPI.getBank();
      console.log(response);
      if (response.status === 200) {
        setBankDetails(response.data);
      } else if (response.status === 500) {
        toast.error("Something went wrong");
      } else if (response.status === 400) {
        toast.error(response.error);
      }
    });
  }


  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;
    const address = formData.get("address") as string;
    const gst_number = formData.get("gst_number") as string;

    const details = {
      companyName: name,
      companyEmail: email,
      companyPhone: phone,
      companyWebsite: website,
      companyAddress: address,
      companyGstNumber: gst_number,
    };
    console.log(name, email, phone, website, address, gst_number);
    const response = await companyAPI.createCompany(details);
    if (response.status === 200) {
      await fetchCompanyDetails();
      toast.success("Company Added Successfully");
      setIsAddNewCompanyOpen(false);
    } else if (response.status === 400) {
      toast.error(response.message);
    } else {
      toast.error("Something went wrong");
    }
  };
  // TODO : Edit company and bank is remaining.

  const handleEditCompany = async (e) => {
    e.preventDefault();
    if (!ifscDetails) {
      toast.error("Please enter valid IFSC code");
      return
    }
    const details = {
      companyName: editCompanyForm?.name,
      companyEmail: editCompanyForm?.email,
      companyPhone: editCompanyForm?.phone,
      companyWebsite: editCompanyForm?.website,
      companyAddress: editCompanyForm?.address,
      companyGstNumber: editCompanyForm?.gst_number,
      ifsc_code: editBankForm?.ifsc_code,
    };
    if (!editCompanyForm?.company_id || !editCompanyForm?.name || !editCompanyForm?.email || !editCompanyForm?.phone || !editCompanyForm?.website || !editCompanyForm?.address || !editCompanyForm?.gst_number || !editBankForm?.ifsc_code) {
      toast.error("Please fill all the fields");
      return
    }

    const response = await companyAPI.updateCompany(details, editCompanyForm.company_id);
    if (response.status === 200) {
      await fetchCompanyDetails();
      toast.success("Company Updated Successfully");
      await fetchCompanyDetails();
      setIsEditingCompany(false);
    } else if (response.status === 400) {
      toast.error(response.message);
    } else {
      toast.error("Something went wrong");
    }

  }
  const validateIfsccode = async (e) => {
    setIfscDetailsError("");
    setIfscDetails(null);
    const ifsc = e.target.value
    if (ifsc.length < 11) {
      return false
    };
    if (isValidIFSC(ifsc)) {
      const response = await getBankDetailsByIfsc(e.target.value);
      if (response) {
        setIfscDetails(response);
        return true
      } else {
        setIfscDetailsError("Invalid IFSC Code");
      }
    } else {
      toast.error("Invalid IFSC Code");
      setIfscDetailsError("Invalid IFSC Code");
    };
    return false
  }

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const bankName = formData.get("bank_name") as string;
    const accountName = formData.get("account_holder_name") as string;
    const accountNumber = formData.get("account_number") as string;
    const routingNumber = formData.get("ifsc_code") as string;
    const swiftCode = formData.get("swift_code") as string;
    const bankAddress = formData.get("bank_address") as string;
    if (!ifscDetails) {
      toast.error("Please enter valid IFSC code");
      return;
    }
    const details = {
      bankName: bankName,
      accountHolderName: accountName,
      accountNumber: accountNumber,
      ifscCode: routingNumber,
      swiftCode: swiftCode,
      bankAddress: bankAddress,
      accountType: "Saving Account",
    };
    const response = await bankAPI.createBank(details);
    console.log(response);
    if (response.status === 200) {
      toast.success("Bank Added Successfully");
      fetchBankDetails();
    } else if (response.status === 400) {
      toast.error(response.message);
    } else if (response.status === 404) {
      toast.error(response.message);
    } else {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
    fetchBankDetails();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Company Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your company and banking information
        </p>
      </div>

      {/* Company Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Company Details
              </h2>
              <p className="text-sm text-gray-500">
                Manage your company information
              </p>
            </div>
          </div>
          {companyDetails && companyDetails?.name ? (
            <Button
              variant="outline"
              onClick={() => {
                setEditCompanyForm(companyDetails);
                setIsEditingCompany(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIsAddNewCompanyOpen(true);
                setIsEditingCompany(true);
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Details
            </Button>
          )}
        </div>

        {companyDetails && companyDetails?.name ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Company Name
                  </p>
                  <p className="text-gray-900">{companyDetails.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{companyDetails.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-gray-900">{companyDetails.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="text-gray-900">{companyDetails.website}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-gray-900">{companyDetails.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tax ID</p>
                  <p className="text-gray-900">{companyDetails.gst_number}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Company Details
            </h3>
            <p className="text-gray-500 mb-4">
              Add your company details to get started
            </p>
          </div>
        )}
      </Card>

      {/* Bank Details */}
      {/* <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Bank className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Bank Details
              </h2>
              <p className="text-sm text-gray-500">
                Manage your banking information
              </p>
            </div>
          </div>
          {bankDetails ? (
            <Button
              variant="outline"
              onClick={() => {
                setEditBankForm(bankDetails);
                setIsEditingBank(true);
                setIfscDetails(null);
                setIfscDetailsError("");
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
          ) : (
            <Button
              onClick={() => {
                setAddBankForm(true);
                setIfscDetails(null);
                setIfscDetailsError("");
              }}
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Details
            </Button>
          )}
        </div>

        {bankDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Bank className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Bank Name</p>
                  <p className="text-gray-900">{bankDetails?.bank_name ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Account Name
                  </p>
                  <p className="text-gray-900">{bankDetails.account_holder_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Account Number
                  </p>
                  <p className="text-gray-900">{bankDetails.account_number}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    IFSC Code
                  </p>
                  <p className="text-gray-900">{bankDetails.ifsc_code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    SWIFT Code
                  </p>
                  <p className="text-gray-900">{bankDetails.swift_code}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Bank Address
                  </p>
                  <p className="text-gray-900">{bankDetails.bank_address}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Bank className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Bank Details
            </h3>
            <p className="text-gray-500 mb-4">
              Add your banking information to get started

            </p>
          </div>
        )}
      </Card> */}

      {/* Add Company Details */}

      <Dialog open={isAddNewCompanyOpen} onOpenChange={setIsAddNewCompanyOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Company Detail</DialogTitle>
            <DialogDescription>
              Make changes to your company information here
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompanySubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst_number">GST Number</Label>
                <Input id="gst_number" name="gst_number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddNewCompanyOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Company</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Company Details Dialog */}
      {editCompanyForm && editCompanyForm.name && (
        <Dialog open={isEditingCompany} onOpenChange={setIsEditingCompany}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {companyDetails?.name
                  ? "Edit Company Details"
                  : "Add Company Details"}
              </DialogTitle>
              <DialogDescription>
                Make changes to your company information here
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={editCompanyForm.name}
                    onChange={(e) =>
                      setEditCompanyForm({
                        ...editCompanyForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editCompanyForm.email}
                    onChange={(e) =>
                      setEditCompanyForm({
                        ...editCompanyForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editCompanyForm.phone}
                    onChange={(e) =>
                      setEditCompanyForm({
                        ...editCompanyForm,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editCompanyForm.website}
                    onChange={(e) =>
                      setEditCompanyForm({
                        ...editCompanyForm,
                        website: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input
                    id="taxId"
                    value={editCompanyForm.gst_number}
                    onChange={(e) =>
                      setEditCompanyForm({
                        ...editCompanyForm,
                        gst_number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editCompanyForm.address}
                  onChange={(e) =>
                    setEditCompanyForm({
                      ...editCompanyForm,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditingCompany(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditCompany}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Bank Details Dialog */}
      {editBankForm &&
        <Dialog open={isEditingBank} onOpenChange={setIsEditingBank}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {bankDetails ? "Edit Bank Details" : "Add Bank Details"}
              </DialogTitle>
              <DialogDescription>
                Make changes to your banking information here
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={editBankForm?.bank_name}
                    onChange={(e) =>
                      setEditBankForm({
                        ...editBankForm,
                        bank_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    value={editBankForm?.account_holder_name}
                    onChange={(e) =>
                      setEditBankForm({
                        ...editBankForm,
                        account_holder_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={editBankForm?.account_number}
                    onChange={(e) =>
                      setEditBankForm({
                        ...editBankForm,
                        account_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">IFSC Code</Label>
                  <Input
                    id="routingNumber"
                    value={editBankForm?.ifsc_code}
                    onChange={async (e) => {
                      setEditBankForm({
                        ...editBankForm,
                        ifsc_code: e.target.value,
                      })
                    }
                    }
                  />
                  <div className="mt-1">
                    {ifscDetails && (
                      <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm">
                        <h4 className="font-medium text-green-800 flex items-center gap-2">

                          {ifscDetails?.BANK}
                        </h4>

                        <div className="mt-2 flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p className="font-medium text-green-700">{ifscDetails?.BRANCH}</p>
                            <p className="text-green-600 text-xs">{ifscDetails?.ADDRESS}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    {ifscDetailsError && (
                      <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-red-600 text-xs">{ifscDetailsError || "Invalid IFSC code"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT Code</Label>
                  <Input
                    id="swiftCode"
                    value={editBankForm?.swift_code}
                    onChange={(e) =>
                      setEditBankForm({
                        ...editBankForm,
                        swift_code: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAddress">Bank Address</Label>
                <Textarea
                  id="bankAddress"
                  value={editBankForm?.bank_address}
                  onChange={(e) =>
                    setEditBankForm({
                      ...editBankForm,
                      bank_address: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingBank(false)}>
                Cancel
              </Button>
              <Button onClick={handleBankSubmit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }

      {/* Add Bank Details Dialog */}
      <Dialog open={addBankForm} onOpenChange={setAddBankForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {bankDetails ? "Edit Bank Details" : "Add Bank Details"}
            </DialogTitle>
            <DialogDescription>
              Make changes to your banking information here
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBankSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bank_name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    name="account_holder_name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="account_number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">IFSC Code</Label>
                  <Input
                    id="routingNumber"
                    name="ifsc_code"
                    maxLength={11}
                    onChange={validateIfsccode}
                  />
                  <div className="mt-1">
                    {ifscDetails && (
                      <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm">
                        <h4 className="font-medium text-green-800 flex items-center gap-2">

                          {ifscDetails?.BANK}
                        </h4>

                        <div className="mt-2 flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p className="font-medium text-green-700">{ifscDetails?.BRANCH}</p>
                            <p className="text-green-600 text-xs">{ifscDetails?.ADDRESS}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    {ifscDetailsError && (
                      <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-red-600 text-xs">{ifscDetailsError || "Invalid IFSC code"}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT Code</Label>
                  <Input
                    id="swiftCode"
                    name="swift_code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAddress">Bank Address</Label>
                <Textarea
                  id="bankAddress"
                  name="bank_address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditingBank(false); setIfscDetails(undefined) }}>
                Cancel
              </Button>
              <Button type="submit">Add Bank</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
