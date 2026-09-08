import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, processOrderAction } from "@/lib/payment-admin";

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const orders = await prisma.paymentOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, avatarUrl: true },
        },
        proof: {
          select: { reference: true, notes: true, submittedAt: true },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders error:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await processOrderAction(orderId, action, "admin");

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Admin order action error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process order" },
      { status: 400 }
    );
  }
}
