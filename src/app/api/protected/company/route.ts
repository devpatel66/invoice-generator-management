import prisma from "@/app/api/lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";



export async function GET(request: NextRequest) {
    try {
        const session : { user: { id: number,email : string,name:string } } | null = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }
        
        // Get user ID from session
        const userId = session.user.id;

        // Fetch all companies for the user
        const company = await prisma.company.findFirst({
            where: {
                user_id: userId,
            }
        });

        if(!company){
            return NextResponse.json({ error: "Company not found", status: 404 }, { status: 404 });
        }

        return NextResponse.json({ 'message':'Company data fetched successfully`',data:company, status: 200 },{status:200});
    } catch (error) {
        console.error("Error fetching companies:", error);
        return NextResponse.json({ error: "Failed to fetch companies", status: 500 }, { status: 500 });
    }
}

export async function POST(request:NextRequest) {
    try{
        const session : { user: { id: number,email : string,name:string } } | null = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }
        
        // Get user ID from session
        const userId = session.user.id;

        const alreadyCompany = await prisma.company.findFirst({
            where: {
                user_id: userId,
            }
        });

        if(alreadyCompany){
            return NextResponse.json({ message: "Company already exists", status: 400 }, { status: 400 });
        }

        // Extract data from request
        const { companyName, companyAddress, companyPhone, companyEmail, companyWebsite,companyGstNumber } = await request.json();
        
        if(!companyName || !companyAddress || !companyPhone || !companyEmail ) {
            return NextResponse.json({ error: "All fields are required",status:400 }, { status: 400 });
        }

        // Create new company
        const company = await prisma.company.create({
            data: {
                user_id: userId,
                name: companyName,
                address: companyAddress,
                phone: companyPhone,
                email: companyEmail,
                website: companyWebsite,
                gst_number:companyGstNumber
            },
        });

        return NextResponse.json({ 'message':'Company created successfully`',company, status: 200 },{status:200});
    }catch(error){
        console.error("Error creating company:", error);
        return NextResponse.json({ error: "Failed to create company", status: 500 }, { status: 500 });
    }
}


export async function PUT(request:NextRequest){
    try {
        const session : { user: { id: number,email : string,name:string } } | null = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }
        
        // Get user ID from session
        const userId = session.user.id;

        // Extract data from request
        const { companyName, companyAddress, companyPhone, companyEmail, companyWebsite,companyGstNumber,company_id } = await request.json();
        
        if(!companyName || !companyAddress || !companyPhone || !companyEmail ) {
            return NextResponse.json({ error: "All fields are required",status:400 }, { status: 400 });
        }
        const existsCompany = await prisma.company.findUnique({
            where: {
                compy_id: Number(company_id),
                user_id: userId
            },
        });

        if(!existsCompany) {
            return NextResponse.json({ error: "Company not found",status:404 }, { status: 404 });
        }

        // Update company
        const company = await prisma.company.update({
            where: {
                compy_id: Number(company_id),
            },
            data: {
                name: companyName || existsCompany.name,
                address: companyAddress || existsCompany.address,
                phone: companyPhone || existsCompany.phone,
                email: companyEmail || existsCompany.email,
                website: companyWebsite || existsCompany.website,
                gst_number:companyGstNumber || existsCompany.gst_number
            },
        });

        return NextResponse.json({ 'message':'Company updated successfully`',company, status: 200 },{status:200});
    } catch (error) {
        console.error("Error updating company:", error);
        return NextResponse.json({ error: "Failed to update company", status: 500 }, { status: 500 });
    }
}