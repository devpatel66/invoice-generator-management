"use client";

import { useRef, useState, useTransition, useEffect, use } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import invoiceAPI from "@/services/invoice";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import AddCustomer from "@/app/components/AddNewCustomer";
import Loading from "@/app/loading";

const billSchema = z.object({
  invoice_number: z.coerce.number().min(1, "Invoice number is required"),
  invoice_date: z.coerce
    .date()
    .refine((date) => date <= new Date(), "Date cannot be in the future"),
    invoice_due_date: z.coerce.date(),
    customDetails: z.array(
        z.object({
          label: z.string().min(1, "Label is required"),
          value: z.string().min(1, "Value is required"),
        })
      ).optional(),     
  items: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.coerce.number().min(0, "Unit price must be non-negative"),
      })
    )
    .min(1, "At least one item is required"),
  tax_rate: z.number().min(0).max(100),
  terms_condition: z.string(),
  customer_note: z.string(),
});

type BillFormData = z.infer<typeof billSchema>;

interface EditBillFormProps {
  invoiceData: {
    invoice_id: string;
    invoice_number: number;
    invoice_date: string;
    invoice_due_date: string;
    custome_details: any[];
    items: any[];
    tax_rate: number;
    terms_condition: string;
    customer_note: string;
    customer_id: number;
  };
  customerData: {
    customer_id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
}

export default function EditBillForm() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.invoice_id as string; // 👈 Here

  const [clientDetails, setClientDetails] = useState<number>();
  const [clientDetailsError, setClientDetailsError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [invoiceData, setInvoiceData] = useState()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },


  } = useForm<BillFormData>({
    resolver: zodResolver(billSchema)
  });
  console.log(errors);
  useEffect(() => {
    // if (!invoiceId) return;

    console.log(invoiceId);
    fetchInvoice();
  }, [invoiceId]);
  function fetchInvoice() {
    startTransition(() => {
      (async () => {
        const response = await invoiceAPI.getInvoice(invoiceId);
        console.log(response);

        if (response.status === 200) {
          setInvoiceData(response.invoices);
          reset(response.invoices);
        } else {
          toast.error(response.error);
        }
      })();
    });
  }

  function formatDateForInput(dateString: string) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  }


  const { fields: customDetailFields, append: appendCustomDetail, remove: removeCustomDetail } = useFieldArray({
    control,
    name: "customDetails",
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control,
    name: "items",
  });

  const calculateTotal = (data: BillFormData) => {
    const subtotal = data.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (data.tax_rate / 100);
    return subtotal + taxAmount;
  };

  const onSubmit = async (data: BillFormData) => {
    console.log(data);

    if (!clientDetails) {
      setClientDetailsError("Please select a customer");
      window.scrollTo(0, 10);
      return;
    }
    setClientDetailsError("");

    const total = calculateTotal(data);
    const payload = {
      ...data,
      total,
      customer_id: clientDetails,
      invoice_id: invoiceData.invoice_id,
    };

    startTransition(async () => {
      try {
        const response = await invoiceAPI.update(payload);
        if (response.status === 200) {
          toast.success("Invoice updated successfully");
          router.push(`/dashboard/bills`);
        } else if (response.status === 400) {
          toast.error(response.error);
        } else {
          toast.error("Something went wrong");
        }
      } catch (error) {
        toast.error("Failed to update invoice");
      }
    });
  };

  if (!invoiceData) {
    return <Loading />
  } else {


    return (
      <div className="grid justify-items-center grid-cols-1 lg:grid-cols-1 gap-8">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Invoice #{invoiceData?.invoice_number}</h2>
              <p className="text-gray-600">Update the invoice details below</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* Client Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Client Details
                </h3>
                <AddCustomer
                  setClientDetails={setClientDetails}
                  selectedCustomer={invoiceData.customer}
                />
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
                      {...register("invoice_number")}
                      className="focus-visible:ring-primary"
                    />
                    {errors.invoice_number && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.invoice_number.message}
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
                      {...register(invoiceData?.invoice_date ? formatDateForInput(invoiceData.invoice_date) : "")}
                      defaultValue={invoiceData?.invoice_date ? formatDateForInput(invoiceData.invoice_date) : ""}
                      className="focus-visible:ring-primary"
                    />
                    {errors.invoice_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.invoice_date.message}
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
                      {...register(invoiceData?.invoice_due_date ? formatDateForInput(invoiceData.invoice_due_date) : "")}
                      defaultValue={invoiceData?.invoice_due_date ? formatDateForInput(invoiceData.invoice_due_date) : ""}
                      className="focus-visible:ring-primary"
                    />

                    {errors.invoice_due_date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.invoice_due_date.message}
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
                  <div key={field.id} className="grid grid-cols-2 gap-3 items-end">
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
                    <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
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
                      {...register("tax_rate", { valueAsNumber: true })}
                      className="focus-visible:ring-primary max-w-[120px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termsAndConditions" className="text-gray-700">
                      Terms and Conditions
                    </Label>
                    <Textarea
                      id="termsAndConditions"
                      {...register("terms_condition")}
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
                      {...register("customer_note")}
                      rows={2}
                      className="focus-visible:ring-primary"
                      placeholder="Thank you for your business..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-gray-300"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <div className="flex space-x  -3">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Update Invoice"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
}