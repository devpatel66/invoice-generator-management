import prisma from "@/app/api/lib/prismaClient";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import {createRazorpayXContact, createRazorpayXFundAccount} from "../../lib/razorpay";
import { isValidIFSC } from "@/services/ifsc";
export async function GET(request: NextRequest) {
  try {
    const session: {
      user: { id: number; email: string; name: string };
    } | null = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Fetch bank details for the user
    const bankDetails = await prisma.bank.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!bankDetails) {
      return NextResponse.json(
        { error: "Bank details not found", status: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Bank data fetched successfully`", data:bankDetails, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch banks", status: 500 },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const session: {
      user: { id: number; email: string; name: string };
    } | null = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    const user = await prisma.user.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", status: 404 }, { status: 404 });
    }

    const existsBank = await prisma.bank.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (existsBank) {
      return NextResponse.json(
        { error: "Bank already exists", status: 400 },
        { status: 400 }
      );
    }

    const {
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      accountType,
      swiftCode,
      bankAddress,
    } = await request.json();


    
    if (
      !bankName ||
      !accountNumber ||
      !ifscCode ||
      !accountHolderName ||
      !accountType
    ) {
      return NextResponse.json(
        { error: "All fields are required", status: 400 },
        { status: 400 }
      );
    }

    if (!isValidIFSC(ifscCode)) {
      return NextResponse.json(
        { error: "Invalid IFSC code", status: 400 },
        { status: 400 }
      );
    }

    // Link bank to RazorpayX
    const contactId = await createRazorpayXContact(accountHolderName, user.email);
    const fundAccountId = await createRazorpayXFundAccount(contactId, bankName, ifscCode, accountNumber);
    

    // Create new bank details
    const newBank = await prisma.bank.create({
      data: {
        account_id: fundAccountId,
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        account_holder_name: accountHolderName,
        account_type: accountType,
        user_id: userId,
        swift_code: swiftCode,
        bank_address: bankAddress,
        contact_id: contactId
      },
    });

    return NextResponse.json(
      { message: "Bank data created successfully`", newBank, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch banks", status: 500 },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session: {
      user: { id: number; email: string; name: string };
    } | null = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    const {
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      accountType,
      swiftCode,
      bankAddress,
    } = await request.json();

    const exitsBank = await prisma.bank.findFirst({
      where: {
        user_id: userId,
      },
    });
    if (!exitsBank) {
      return NextResponse.json(
        { error: "Bank not found", status: 404 },
        { status: 404 }
      );
    }

    // TODO : Link updated bank details to Razorpay

    // Update bank details
    const newBank = await prisma.bank.update({
      where: {
        bank_id: exitsBank.bank_id,
      },
      data: {
        bank_name: bankName || exitsBank.bank_name,
        account_number: accountNumber || exitsBank.account_number,
        ifsc_code: ifscCode || exitsBank.ifsc_code,
        account_holder_name: accountHolderName || exitsBank.account_holder_name,
        account_type: accountType || exitsBank.account_type,
        swift_code: swiftCode || exitsBank.swift_code,
        bank_address: bankAddress || exitsBank.bank_address,
      },
    });

    return NextResponse.json(
      { message: "Bank data updated successfully`", newBank, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching banks:", error);
    return NextResponse.json(
      { error: "Failed to update bank", status: 500 },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session: {
      user: { id: number; email: string; name: string };
    } | null = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    const exitsBank = await prisma.bank.findFirst({
      where: {
        user_id: userId,
      },
    });
    if (!exitsBank) {
      return NextResponse.json(
        { error: "Bank not found", status: 404 },
        { status: 404 }
      );
    }

    // TODO : Link deleted bank details to Razorpay

    // Delete bank details
    const deletedBank = await prisma.bank.delete({
      where: {
        bank_id: exitsBank.bank_id,
      },
    });

    return NextResponse.json(
      { message: "Bank data deleted successfully`", deletedBank, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting bank:", error);
    return NextResponse.json(
      { error: "Failed to delete bank", status: 500 },
      { status: 500 }
    );
  }
}
