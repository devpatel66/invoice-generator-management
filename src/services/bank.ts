import errorHandler from "@/lib/error-hadler";

interface BankType {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    accountType?: string;
    swiftCode?: string;
    bankAddress?: string;
}

class Bank{
    async createBank(bankData: BankType) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/bank`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bankData),
            });
            
            return response.json();
        });
    }

    async getBank() {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/bank`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        });
    }

    async updateBank(bankData: BankType) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/bank`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bankData),
            });
            return response.json();
        });
    }

    // async deleteBank(bankId: number) {
    //     return await errorHandler(async () => {
    //         const response = await fetch(`/api/protected/bank/${bankId}`, {
    //             method: "DELETE",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //         });
    //         return response.json();
    //     });
    // }
       
}

const bankAPI = new Bank();

export default bankAPI;
