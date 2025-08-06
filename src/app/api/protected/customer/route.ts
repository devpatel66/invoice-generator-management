import prisma from "@/app/api/lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";


export async function GET(request: NextRequest) {
    try {
        // const session : { user: { id: number,email : string,name:string } } | null = await getServerSession(authOptions);
        // if(!session){
        //     return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        // }

        // // Get user ID from session
        // const userId = session.user.id;

        const searchParams = request.nextUrl.searchParams;
        const customer_id = searchParams.get('customer_id');


        // Fetch all companies for the user
        const customers = await prisma.customer.findMany({
            where: {
                customer_id: Number(customer_id),
            },
            include: {
                company: true
            }
        });

        return NextResponse.json({ 'message': 'Customers fetched successfully`', customers, status: 200 }, { status: 200 });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ error: "Failed to fetch Customers", status: 500 }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const session: { user: { id: number, email: string, name: string } } | null = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }

        // Get user ID from session
        const userId = session.user.id;

        const { customer_name, companyName, companyAddress, companyPhone, companyEmail, companyWebsite, companyGstNumber } = await request.json();

        if (!customer_name || !companyName || !companyAddress || !companyPhone || !companyEmail) {
            return NextResponse.json({ error: "All fields are required", status: 400 }, { status: 400 });
        }

        const company = await prisma.company.create({
            data: {
                name: companyName,
                address: companyAddress,
                phone: companyPhone,
                email: companyEmail,
                website: companyWebsite,
                gst_number: companyGstNumber,
            },
        });


        const customer = await prisma.customer.create({
            data: {
                name: customer_name,
                company_id: company.compy_id,
                user_id: userId
            },
        });

        return NextResponse.json({ 'message': 'Customer created successfully`', customer, status: 200 }, { status: 200 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json({ error: "Failed to create customer", status: 500 }, { status: 500 });
    }
}


export async function PUT(request: NextRequest) {
    try {
        const session: { user: { id: number, email: string, name: string } } | null = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }

        // Get user ID from session
        const userId = session.user.id;

        const { customer_id, customer_name, companyName, companyAddress, companyPhone, companyEmail, companyWebsite, companyGstNumber, companyId } = await request.json();

        const existsClient = await prisma.customer.findUnique({
            where: {
                customer_id: Number(customer_id)
            },
            include: {
                company: true
            }
        });

        if (!existsClient) {
            return NextResponse.json({ error: "Customer not found", status: 404 }, { status: 404 });
        }

        const company = await prisma.company.update({
            where: {
                compy_id: Number(existsClient.company.compy_id)
            },
            data: {
                name: companyName || existsClient.company.name,
                address: companyAddress || existsClient.company.address,
                phone: companyPhone || existsClient.company.phone,
                email: companyEmail || existsClient.company.email,
                website: companyWebsite || existsClient.company.website,
                gst_number: companyGstNumber || existsClient.company.gst_number
            }
        });

        const customer = await prisma.customer.update({
            where: {
                customer_id: Number(existsClient.customer_id)
            },
            data: {
                name: customer_name || existsClient.name
            }
        });

        return NextResponse.json({ 'message': 'Customer updated successfully`', customer, status: 200 }, { status: 200 });
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json({ error: "Failed to update customer", status: 500 }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const { customer_id } = await request.json();
        const existsClient = await prisma.customer.findUnique({
            where: { customer_id },
        });
        if (!existsClient) {
            return NextResponse.json({ error: "Customer not found", status: 404 }, { status: 404 });
        }

        const company = await prisma.company.delete({
            where: { compy_id: existsClient.company_id },
        });

        const customer = await prisma.customer.delete({
            where: { customer_id: existsClient.customer_id },
        });
        return NextResponse.json({ message: "Customer deleted successfully", status: 200 }, { status: 200 });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json({ error: "Failed to delete customer", status: 500 }, { status: 500 });
    }
}