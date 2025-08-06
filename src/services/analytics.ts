import errorHandler from "@/lib/error-hadler";

class Analytics {
    async getAnalytics() {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/analytics/analysis`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        });
    }

    async getDashBoardAnalytics() {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/analytics/dashboard-metrics`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        });
    }
}

const analyticsAPI = new Analytics();

export default analyticsAPI;