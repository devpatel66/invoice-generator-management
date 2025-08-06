import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCodeSVG } from "qrcode.react"
import { useRef } from "react"
import printJS from 'print-js';
import generatePDF from "@/lib/pdf-genrator";
import React from "react";
type BillPreviewProps = {
  data: {
    companyName: string
    companyAddress: string
    companyPhone: string
    companyEmail: string
    clientName: string
    clientEmail: string
    clientAddress: string
    clientPhone: string
    customDetails: Array<{ label: string; value: string }>
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
    }>
    taxRate: number
    termsAndConditions: string
    note: string
  } | null
  showPaymentQR: boolean
}

const numberToWords = (num: number) => {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ]

  if (num === 0) return "zero"

  const convertLessThanOneThousand = (n: number): string => {
    if (n >= 100) {
      return ones[Math.floor(n / 100)] + " hundred " + convertLessThanOneThousand(n % 100)
    }
    if (n >= 20) {
      return tens[Math.floor(n / 10)] + " " + ones[n % 10]
    }
    if (n >= 10) {
      return teens[n - 10]
    }
    return ones[n]
  }

  let result = ""
  if (num >= 1000000000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000000000)) + " billion "
    num %= 1000000000
  }
  if (num >= 1000000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000000)) + " million "
    num %= 1000000
  }
  if (num >= 1000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000)) + " thousand "
    num %= 1000
  }
  result += convertLessThanOneThousand(num)

  return result.trim()
}

export default function BillPreview({ data, showPaymentQR }: BillPreviewProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bill Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Fill out the form to see a preview of your bill.</p>
        </CardContent>
      </Card>
    )
  }

  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (data.taxRate / 100)
  const total = subtotal + taxAmount
  const billPreviewRef = useRef(null);

  function printBill() {
    generatePDF(data, subtotal, taxAmount, total)
  }

  return (
    <Card className="border-0" id="billPreview">
      {/* <button onClick={printBill} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Print</button> */}
      <CardHeader>
        <div className="space-y-2 flex justify-between">
          <div>
            <div className="h-20 w-20 bg-gray-500 flex items-center justify-center">logo</div>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xl font-semibold">
              {data.companyName}
            </p>
            <p>
              {data.companyAddress}
            </p>
            <p className="flex gap-2">
              {data.companyPhone}
              {data.companyEmail}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          <div className="flex justify-between">

            <div className="">
              <h3 className="font-semibold">Client Details</h3>
              <p>
                <strong>Name:</strong> {data.clientName}
              </p>
              <p>
                <strong>Email:</strong> {data.clientEmail}
              </p>
              <p>
                <strong>Address:</strong> {data.clientAddress}
              </p>
              <p>
                <strong>Phone:</strong> {data.clientPhone}
              </p>
            </div>
            {/* invoice number, invoice date, due date */}
            <div>
            <h3 className="font-semibold"></h3>
              <p className="flex justify-between">
                <strong>Invoice No. :</strong>
                <span> {data?.invoiceNumber || 1}</span> 
              </p>
              <p>
                <strong>Invoice Date :</strong> {data?.invoiceDate.toISOString().split("T")[0] || "12/04/2025"} 
              </p>
              <p className="flex justify-between">
                <strong>Due Date :</strong> 
                <span>{data?.invoiceDueDate.toISOString().split("T")[0] || "12/04/2025"}</span>
              </p>
            </div>
          </div>
          {data.customDetails.length > 0 && (
            <div>
              <h4 className="font-semibold">Custom Details</h4>
              {data.customDetails.map((detail, index) => (
                <p key={index}>
                  <strong>{detail.label}:</strong> {detail.value}
                </p>
              ))}
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left">Description</th>
                <th className="text-center">Quantity</th>
                <th className="text-center">Unit Price</th>
                <th className="text-center">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-b py-2">
                  <td className="py-2">{item.description}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center">&#8377;{item.unitPrice.toFixed(2)}</td>
                  <td className="text-center">&#8377;{(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="mt-2">
                <td colSpan={3} className="text-right font-semibold">
                  Subtotal:
                </td>
                <td className="text-center">&#8377;{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right font-semibold">
                  Tax ({data.taxRate}%):
                </td>
                <td className="text-center">&#8377;{taxAmount.toFixed(2)}</td>
              </tr>
              <tr className="font-bold">
                <td colSpan={3} className="text-right">
                  Total:
                </td>
                <td className="text-center">&#8377;{total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          <div>
            <p>
              <strong>Amount in words:</strong> {numberToWords(Math.round(total * 100) / 100)} only
            </p>
          </div>
          <div className="flex justify-between ">
            <div className="w-2/4">
              {data.termsAndConditions && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Terms and Conditions</h2>
                  <p className="text-wrap">{data.termsAndConditions}</p>
                </div>
              )}

              {data.note && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Note</h2>
                  <p className="text-wrap">{data.note}</p>
                </div>
              )}

            </div>
            <div className="w-1/3">
              {showPaymentQR && (
                <div className="flex flex-col items-center justify-center">
                  <h2 className="text-xl font-semibold mb-2">Payment QR Code</h2>
                  <QRCodeSVG value={`https://example.com/pay/&#8377;{total.toFixed(2)}`} size={50} />
                  <p className="mt-2">Scan to pay &#8377;{total.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

