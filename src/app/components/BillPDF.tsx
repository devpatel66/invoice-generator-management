"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useReactToPrint } from "react-to-print"
type BillPDFProps = {
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
  }
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

const BillPDF: React.FC<BillPDFProps> = ({ data, showPaymentQR }) => {
  const billRef = useRef<HTMLDivElement>(null)

  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  const taxAmount = subtotal * (data.taxRate / 100)
  const total = subtotal + taxAmount

  const handlePrint = useReactToPrint({contentRef:billRef,documentTitle:"Bill"})

  return (
    <>
    <div ref={billRef} className="bg-white p-8 w-full mx-auto shadow-lg" style={{ minHeight: "297mm" }}>
      <h1 className="text-3xl font-bold mb-6">Bill</h1>

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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Client Details</h2>
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

      {data.customDetails.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Custom Details</h2>
          {data.customDetails.map((detail, index) => (
            <p key={index}>
              <strong>{detail.label}:</strong> {detail.value}
            </p>
          ))}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b items-center">
                <td className="py-2">{item.description}</td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">&#8377;{item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-2">&#8377;{(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right font-semibold py-2">
                Subtotal:
              </td>
              <td className="text-right py-2">&#8377;{subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="text-right font-semibold py-2">
                Tax ({data.taxRate}%):
              </td>
              <td className="text-right py-2">&#8377;{taxAmount.toFixed(2)}</td>
            </tr>
            <tr className="font-bold">
              <td colSpan={3} className="text-right py-2">
                Total:
              </td>
              <td className="text-right py-2">&#8377;{total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mb-6">
        <p>
          <strong>Amount in words:</strong> {numberToWords(Math.round(total * 100) / 100)} Rupess Only
        </p>
      </div>



      <div className="flex justify-between">
        <div className="w-2/3">
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
            <div className="flex flex-col items-center justify-center mt-4">
              <h2 className="text-xl font-semibold mb-2">Payment QR Code</h2>
              <QRCodeSVG value={`https://example.com/pay/&#8377;{total.toFixed(2)}`} size={50} />
              <p className="mt-2">Scan to pay &#8377;{total.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
          </>
  )
}

export default BillPDF

