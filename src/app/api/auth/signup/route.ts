import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/lib/prismaClient";
import bcrypt from "bcryptjs";




export async function  POST(request: Request){
    const { name, email, password, confirmPassword } = await request.json();
    console.log(name, email, password);
    if (!name || !email || !password) {
        return NextResponse.json({ message: "Missing required fields",title: "name" }, { status: 400 });
    }

    if (name.length < 3) {
        return NextResponse.json({ message: "Name must be at least 3 characters long",title: "name" }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ message: "Password must be at least 8 characters long",title: "password" }, { status: 400 });
    }

    if(password !== confirmPassword) {
        return NextResponse.json({ message: "Passwords do not match",title: "confirm-password" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    // Check if user already exists
    if (existingUser) {
        return NextResponse.json({ message: "User already exists",title: "email" }, { status: 400 });
    }

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: bcrypt.hashSync(password)
            }
        });

        return NextResponse.json({ message: "User created successfully",status: 200 }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to create user",status: 500 }, { status: 500 });
    }
};




