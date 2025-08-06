

"use client"

import NewBillForm from "@/app/components/NewBillForm"
import companyAPI from "@/services/company"
import bankAPI from "@/services/bank"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function NewBillPage() {
  const [companyExists, setCompanyExists] = useState<boolean | null>(null) // null = loading

  useEffect(() => {
    async function fetchCompany() {
      try {
        const company = await companyAPI.getCompany();
        const bank = await bankAPI.getBank();
        console.log(bank);
        if (company.status === 404) {
          setCompanyExists(false);
        } else {
          setCompanyExists(true);
        }
      } catch (err) {
        toast.error("Failed to load company details.");
        setCompanyExists(false);
      }
    }

    fetchCompany();
  }, []);

  if (companyExists === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Bill</h1>
        <p className="text-gray-600 mb-4">Loading...</p>
      </div>
    );
  }

  if (!companyExists) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Bill</h1>
        <p className="text-gray-600 mb-4">Please add a company first.</p>
        <Link href="/dashboard/settings/company" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Add Company or Bank Details</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Bill</h1>
      <NewBillForm />
    </div>
  )
}
