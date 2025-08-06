"use client";

import { useRef, useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import BillPreview from "./BillPreview";
import BillPDF from "./BillPDF";
import { QRCodeSVG } from "qrcode.react";
import { Trash2 } from "lucide-react";
import AddCustomer from "./AddNewCustomer";
import invoiceAPI from "@/services/invoice";
import { toast } from "react-toastify";
const billSchema = z.object({
  // Seller details
  invoiceNumber: z.coerce.number().min(1, "Invoice number is required"),
  invoiceDate: z.coerce
    .date()
    .refine((date) => date <= new Date(), "Date cannot be in the future"),
  invoiceDueDate: z.coerce
    .date()
    .refine((date) => date >= new Date(), "Due date cannot be in the past"),
  customDetails: z.array(
    z.object({
      label: z.string().min(1, "Label is required"),
      value: z.string().min(1, "Value is required"),
    })
  ),
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.coerce.number().min(1, "Unit price must be non-negative"),
      })
    )
    .min(1, "At least one item is required"),
  taxRate: z.number().min(0).max(100),
  termsAndConditions: z.string(),
  note: z.string(),
});

type BillFormData = z.infer<typeof billSchema>;
interface Customer {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
}
export default function NewBillForm() {
  const [previewData, setPreviewData] = useState<BillFormData | null>(null);
  const [showPDF, setShowPDF] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [clientDetails, setClientDetails] = useState<number>(0);
  const [clientDetailsError, setClientDetailsError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      customDetails: [],
      taxRate: 0,
      termsAndConditions: "",
      note: "",
      invoiceNumber: 0,
      invoiceDate: new Date(),
      invoiceDueDate: new Date(),
    },
  });

  // const { fields: itemFields, append: appendItem } = useFieldArray({
  //   control,
  //   name: "items",
  // })

  const { fields: customDetailFields, append: appendCustomDetail } =
    useFieldArray({
      control,
      name: "customDetails",
    });

  const onSubmit = async (data: BillFormData) => {
    
    
    if (!clientDetails) {
      setClientDetailsError("Please select a customer");
      window.scrollTo(0, 10);
      return;
    }
    setClientDetailsError("");
    const total = calculateTotal(data);
    console.log(data);
    Object.assign(data, { total });
    Object.assign(data, { customerId : clientDetails });
    
    startTransition(async () => {
      const response = await invoiceAPI.createInvoice(data);
      console.log(response);      
      if (response.status === 200) {
        toast.success("Invoice created successfully");
      }else if (response.status === 400) {
        toast.error(response.error);
      }else if (response.status === 500) {
        toast.error("Something went wrong");
      }
    });
  };

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const calculateTotal = (data: BillFormData) => {
    const subtotal = data.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (data.taxRate / 100);
    return subtotal + taxAmount;
  };

  return (
    <div className="grid justify-items-center grid-cols-1 lg:grid-cols-1 gap-8">
      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Company Details Section */}

            {/* Client Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Client Details
              </h3>
              <AddCustomer setClientDetails={setClientDetails} />
              {clientDetailsError && (
                <p className="text-red-500 text-xs mt-1">
                  {clientDetailsError}
                </p>
              )}
            </div>

            {/* Invoice Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Invoice Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber" className="text-gray-700">
                    Invoice Number *
                  </Label>
                  <Input
                    type="number"
                    id="invoiceNumber"
                    {...register("invoiceNumber")}
                    className="focus-visible:ring-primary"
                  />
                  {errors.invoiceNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.invoiceNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate" className="text-gray-700">
                    Invoice Date *
                  </Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    {...register("invoiceDate")}
                    className="focus-visible:ring-primary"
                  />
                  {errors.invoiceDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.invoiceDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-gray-700">
                    Due Date *
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...register("invoiceDueDate")}
                    className="focus-visible:ring-primary"
                  />
                  {errors.invoiceDueDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.invoiceDueDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Custom Fields
              </h3>
              {customDetailFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-2 gap-3 items-end"
                >
                  <div className="space-y-2">
                    <Label className="text-gray-700">Label</Label>
                    <Input
                      {...register(`customDetails.${index}.label`)}
                      placeholder="e.g. PO Number"
                      className="focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Value</Label>
                    <div className="flex space-x-2">
                      <Input
                        {...register(`customDetails.${index}.value`)}
                        placeholder="Value"
                        className="focus-visible:ring-primary"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeCustomDetail(index)}
                        className="border-gray-300"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendCustomDetail({ label: "", value: "" })}
                className="text-primary border-primary hover:bg-primary/5"
              >
                + Add Custom Field
              </Button>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Items
              </h3>
              <div className="space-y-4">
                {itemFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-3 items-start"
                  >
                    <div className="col-span-5 space-y-2">
                      <Label className="text-gray-700">Description *</Label>
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="Item description"
                        className="focus-visible:ring-primary"
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.items[index]?.description?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-gray-700">Qty *</Label>
                      <Input
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                        placeholder="1"
                        type="number"
                        min="1"
                        className="focus-visible:ring-primary"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="text-gray-700">Unit Price *</Label>
                      <Input
                        {...register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        className="focus-visible:ring-primary"
                      />
                      {errors.items?.[index]?.unitPrice && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.items[index]?.unitPrice?.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 flex items-end h-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendItem({ description: "", quantity: 1, unitPrice: 0 })
                  }
                  className="text-primary border-primary hover:bg-primary/5"
                >
                  + Add Item
                </Button>
                {errors.items && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.items.message}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate" className="text-gray-700">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("taxRate", { valueAsNumber: true })}
                    className="focus-visible:ring-primary max-w-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions" className="text-gray-700">
                    Terms and Conditions
                  </Label>
                  <Textarea
                    id="termsAndConditions"
                    {...register("termsAndConditions")}
                    rows={3}
                    className="focus-visible:ring-primary"
                    placeholder="Payment due within 15 days..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-gray-700">
                    Notes
                  </Label>
                  <Textarea
                    id="note"
                    {...register("note")}
                    rows={2}
                    className="focus-visible:ring-primary"
                    placeholder="Thank you for your business..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              {/* <Button
                type="button"
                variant="outline"
                className="border-gray-300"
              >
                Save Draft
              </Button> */}
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Save and Send Invoice
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
