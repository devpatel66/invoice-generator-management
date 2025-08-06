import { NextResponse } from "next/server";
import prisma from "../../lib/prismaClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const { password } = await req.json();
    try {
        const session: {
              user: { id: number; email: string; name: string };
            } | null = await getServerSession(authOptions);
            if (!session) {
              return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
            }
        await prisma.user.update({
            where: { user_id: session.user.id },
            data: { password },
        });
        return NextResponse.json({ message: "Password changed successfully",status: 200 }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
    }
}