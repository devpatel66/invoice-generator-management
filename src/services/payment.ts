import errorHandler from "@/lib/error-hadler";

class Payment{
    async getPayementAnalytics() {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/payment`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        });
    }

    async sendPaymentReminder(invoice_id:string) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/payment-reminder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({invoice_id}),
            });
            return response.json();
        });
    }
}

const paymentAPI = new Payment();

export default paymentAPI;
