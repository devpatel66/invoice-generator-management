import errorHandler from "@/lib/error-hadler";

type InvoiceType = {
    invoiceNumber: number;
    invoiceDate: string;
    invoiceDueDate: string;
    customDetails?: {label: string, value: string}[];
    customerId: number;
    taxRate: number;
    termsAndConditions?: string;
    note?: string;
    items: {description: string, unitPrice: number, quantity: number}[];
    subTotal?: number;
    taxAmount?: number;
    finalAmount?: number;
    total: number;
    paymentLink?: string;
    paymentStatus?: string;
}

class Invoice {
    async createInvoice(invoice: InvoiceType) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/invoice`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(invoice),
            });
            return response.json();
        });
    }

    async getInvoice(invoiceId: string) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/invoice?invoice=${invoiceId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        });
    }

    async getAllInvoices(){
        return await errorHandler(async () => {
            const response = await fetch('/api/protected/invoice/get-invoices')
            console.log(response);
            return response.json();
        });
    }
    async update(invoice){
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/invoice`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(invoice),
            });
            return response.json();
        });
    }
}

const invoiceAPI = new Invoice();
export default invoiceAPI;