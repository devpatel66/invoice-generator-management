import errorHandler from "@/lib/error-hadler";

interface CustomerType {
    customer_name: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyWebsite?: string;
    companyGstNumber?: string;
}

class Customer {
    async createCustomer(customer: CustomerType) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/customer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customer),
            });
            return response.json();
        });
    }

    async getCustomer(customer_id: number) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/customer?customer_id=${customer_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        });
    }

    async getCustomers() {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/customer/get-all-customers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });            
            return response.json();
        });
    }

    async updateCustomer(customer: CustomerType) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/customer`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customer),
            });
            return response.json();
        });
    }

    async deleteCustomer(customer_id: number) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/customer`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ customer_id }),
            });
            return response.json();
        });
    }
}

const customerAPI = new Customer();

export default customerAPI;