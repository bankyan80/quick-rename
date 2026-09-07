import { NextResponse } from "next/server";
import { getSession } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

const TOKEN_PRICE = Number(process.env.TOKEN_PRICE || 50000);
const FILES_PER_TOKEN = Number(process.env.FILES_PER_TOKEN || 100);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { tokenQuantity, paymentMethod } = body;

    if (
      typeof tokenQuantity !== "number" ||
      tokenQuantity < 1 ||
      !["DANA", "QRIS"].includes(paymentMethod)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const seq = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    const orderNumber = `QR-${y}${m}${d}-${seq}`;

    const amount = tokenQuantity * TOKEN_PRICE;
    const fileQuantity = tokenQuantity * FILES_PER_TOKEN;

    const order = await prisma.paymentOrder.create({
      data: {
        userId: session.user.id,
        orderNumber,
        tokenQuantity,
        fileQuantity,
        amount,
        paymentMethod,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Payment order error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const orders = await prisma.paymentOrder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        tokenQuantity: true,
        fileQuantity: true,
        amount: true,
        paymentMethod: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
