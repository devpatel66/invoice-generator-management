"use client";
async function errorHandler(fn: () => Promise<any>) {
    try {
        return await fn();
    } catch (error) {
        console.log(error);
        return { message: "Something went wrong" ,status: 500 };
    }
}

export default errorHandler;