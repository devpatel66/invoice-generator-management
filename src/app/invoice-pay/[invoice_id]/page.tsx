'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Loading from '@/app/loading';

export default function InvoicePage() {
  const { invoice_id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      const res = await fetch(`/api/payment/${invoice_id}`);
      const data = await res.json();

      if (data.success) {
        console.log(data);
        
        setInvoice(data.invoice);
        setOrder(data.order);
      }

      setLoading(false);
    }

    if (invoice_id) fetchInvoice();
  }, [invoice_id]);

  const handlePayment = async () => {
    if (!order || !invoice) return;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Number(order.amount),
      currency: 'INR',
      name: 'Invoice Payment',
      description: 'Pay your invoice securely',
      order_id: order.id,
      handler: async function (response: any) {
        // Send payment details to backend to verify and mark invoice as paid
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            invoice_id: invoice.invoice_id,
          }),
        });
        console.log(res);
        
        const result = await res.json();
        alert(result.message || 'Payment complete!');
      },
      prefill: {
        name: invoice.customer_name,
        email: invoice.customer_email,
      },
      theme: {
        color: '#6366f1',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (loading) return <Loading />;

  if (!invoice) return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden text-center">
  <div className="flex justify-center mb-6">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-16 w-16 text-rose-500" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  </div>
  
  <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
  <p className="text-gray-600 mb-6">We couldn't locate the invoice you're looking for.</p>
  
  <div className="bg-rose-50 border-l-4 border-rose-400 p-4 mb-6 rounded-r-lg text-left">
    <div className="flex">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5 text-rose-400 mt-0.5 mr-2 flex-shrink-0" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path 
          fillRule="evenodd" 
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
          clipRule="evenodd" 
        />
      </svg>
      <div>
        <h3 className="text-sm font-medium text-rose-800">Possible reasons:</h3>
        <ul className="list-disc pl-5 text-sm text-rose-700 mt-1 space-y-1">
          <li>The invoice ID is incorrect</li>
          <li>The invoice has been deleted</li>
          <li>You don't have permission to view this invoice</li>
        </ul>
      </div>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row justify-center gap-3">
    <button
      className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors"
      onClick={() => window.location.reload()}
    >
      <div className="flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        Try Again
      </div>
    </button>
  </div>
</div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
  {/* Header Section */}
  <div className="flex justify-between items-start mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
      <div className="mt-2 text-sm text-gray-500">
        <p>Invoice #: {invoice.invoice_number}</p>
        <p>Date: {new Date(invoice.invoice_date).toLocaleDateString()}</p>
        <p>Due Date: {new Date(invoice.invoice_due_date).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="text-right">
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        invoice.payment_status === 'paid' 
          ? 'bg-green-100 text-green-800' 
          : invoice.payment_status === 'pending'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-red-100 text-red-800'
      }`}>
        {invoice.payment_status.toUpperCase()}
      </span>
      <p className="mt-2 text-2xl font-bold text-gray-800">₹{invoice.final_amount.toFixed(2)}</p>
    </div>
  </div>

  {/* From/To Sections */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">From</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-medium">{invoice.user.name}</p>
        <p className="text-gray-600">{invoice.user.company[0]?.name}</p>
        <p className="text-gray-600">{invoice.user.company[0]?.email}</p>
        <p className="text-gray-600">{invoice.user.company[0]?.phone}</p>
      </div>
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Bill To</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-medium">{invoice.customer.name}</p>
        <p className="text-gray-600">{invoice.customer.company?.name}</p>
        <p className="text-gray-600">{invoice.customer.company?.email}</p>
        <p className="text-gray-600">{invoice.customer.company?.phone}</p>
        {invoice.custome_details && (
          <div className="mt-2 text-sm">
            {/* Render additional customer details from JSON if available */}
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Items Table */}
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-gray-700 mb-3">Items</h2>
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.description || 'Item'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">{item.quantity || 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">₹{item.unitPrice?.toFixed(2) || '0.00'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">₹{(item.quantity * item.unitPrice)?.toFixed(2) || '0.00'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Summary Section */}
  <div className="flex justify-end mb-8">
    <div className="w-full md:w-1/3">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{invoice.sub_total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax ({invoice.tax_rate}%)</span>
          <span className="font-medium">₹{invoice.tax_amount.toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-gray-200 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold">₹{invoice.final_amount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Notes & Terms */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
    {invoice.customer_note && (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
        <p className="text-sm text-gray-600">{invoice.customer_note}</p>
      </div>
    )}
    {invoice.terms_condition && (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Terms & Conditions</h3>
        <p className="text-sm text-gray-600">{invoice.terms_condition}</p>
      </div>
    )}
  </div>

  {/* Payment Action */}
  {invoice.payment_status !== 'paid'  ? (
    <div className="flex justify-end space-x-4">
      <button
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-200"
        onClick={handlePayment}
      >
        Pay Now
      </button>
    </div>
  ) : 
  (
    <div className="flex justify-end space-x-4">
      <a
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-200"
        href={`/api/pdf/${invoice.invoice_id}`}
      >
        Download Invoice
      </a>
    </div>
  ) 
  
  }

  {/* Footer */}
  <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
    <p>Thank you for your business!</p>
    <p className="mt-1">If you have any questions, please contact 'Bill D Invoice'</p>
  </div>
</div>
  );
}
