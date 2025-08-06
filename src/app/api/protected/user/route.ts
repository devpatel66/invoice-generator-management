import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/api/lib/prismaClient";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session: { user: { id: number; email: string; name: string } } | null =
    await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }
  const user = await prisma.user.findFirst({
    where: {
      user_id: session.user.id,
    },
  });
  return NextResponse.json(
    { user: user, message: "User fetched successfully", status: 200 },
    { status: 200 }
  );
}

export async function PUT(request: NextRequest) {
  try {
    const session: {
      user: { id: number; email: string; name: string };
    } | null = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    const { name, email, oldPassword, newPassword, confirmPassword } =
      await request.json();

    const user = await prisma.user.findUnique({
      where: { user_id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", status: 404 },
        { status: 404 }
      );
    }
    // for password update
    if (oldPassword) {
      const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Invalid password", status: 400 },
          { status: 400 }
        );
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          {
            message: "Passwords do not match",
            title: "confirm-password",
            status: 400,
          },
          { status: 400 }
        );
      }
      const newPasswordHash = bcrypt.hashSync(newPassword);

      await prisma.user.update({
        where: {
          user_id: session.user.id,
        },
        data: {
          password: newPasswordHash,
        },
      });

      return NextResponse.json(
        { message: "Password updated successfully", status: 200 },
        { status: 200 }
      );
    }

    // for name and email update
    if (name || email) {
        console.log(email);
        
      if (email !== user.email) {
        const existsEmail = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });
        if (existsEmail) {
          return NextResponse.json(
            { message: "Email already exists", status: 400, title: "email" },
            { status: 400 }
          );
        }
      }
      await prisma.user.update({
        where: {
          user_id: session.user.id,
        },
        data: {
          name: name || user.name,
          email: email || user.email,
        },
      });

      return NextResponse.json(
        { message: "User updated successfully", status: 200 },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "No changes to update", status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user", status: 500 },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session: { user: { id: number; email: string; name: string } } | null =
    await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized User" }, { status: 401 });
  }
  // TODO : delete data related to user from other table...
  try {
    await prisma.user.delete({
      where: {
        user_id: session.user.id,
      },
    });
    return NextResponse.json(
      { message: "User deleted successfully", status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user", status: 500 },
      { status: 500 }
    );
  }
}
