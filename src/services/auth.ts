import errorHandler from "@/lib/error-hadler";
import { signIn, signOut,getSession } from "next-auth/react";


export type User = {
    name: string;
    email: string;
}

class AuthUser {
    // private url: string;
    constructor() {
        // this.url = "api/auth";
    }

    async signup(userData: User & { confirmPassword: string }) {
        return await errorHandler(async () => {
            // console.log(this.url);
            const response = await fetch(`/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });
            return response.json();
        });
    }

    async login(userData: { email: string, password: string }) {
        console.log(userData);
        return await errorHandler(async () => {
            const response = await signIn("credentials", {
                ...userData,
                redirect: false,
            });
            console.log(response);
            return response;
        });
    }

    async logout() {
        return await errorHandler(async () => {
            const response = await signOut();
            return response;
        });
    }

    async update(userData: User | User & { confirmPassword: string,currentPassword: string,newPassword: string }) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });
            return response.json();
        });
    }

    async changePassword(newPassword: string) {
        return await errorHandler(async () => {
            const response = await fetch(`/api/protected/changePassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({password:newPassword}),
            });
            return response.json();
        });
    }
}

const auth = new AuthUser();
export default auth;
