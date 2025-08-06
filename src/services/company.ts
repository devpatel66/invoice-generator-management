import errorHandler from "@/lib/error-hadler";


interface CompanyType {
    companyName: string | undefined;
    companyAddress: string | undefined;
    companyPhone: string | undefined;
    companyEmail: string | undefined;
    companyWebsite: string | undefined;
    companyGstNumber: string | undefined;
}
class Company {
    async getCompany() {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/company`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        });
    }
    async createCompany(company: CompanyType) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/company`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(company),
            });
            return response.json();
        });
    }
    async updateCompany(company: CompanyType, companyId: number) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/company`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({...company,company_id:companyId}),
            });
            return response.json();
        });
    }
    // async deleteCompany(companyId: number) {
    //     return await errorHandler(async () => {
    //         const response = await fetch(`/api/protected/company/${companyId}`, {
    //             method: "DELETE",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //         });
    //         return response.json();
    //     });
    // }
}

const companyAPI = new Company();

export default companyAPI;
