import { NextResponse } from "next/server";
import { getSession } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await getSession();
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return false;
  if (user.role === "admin") return true;
  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) return true;
  return false;
}

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

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.paymentOrder.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: { tokenAccount: true },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status === "APPROVED") {
        throw new Error("Order already approved");
      }

      if (action === "approve") {
        const fileQuantity = order.fileQuantity;

        let tokenAccount = order.user.tokenAccount;
        if (!tokenAccount) {
          tokenAccount = await tx.tokenAccount.create({
            data: {
              userId: order.userId,
              balance: 0,
            },
          });
        }

        const balanceBefore = tokenAccount.balance;
        const balanceAfter = balanceBefore + fileQuantity;

        await tx.tokenAccount.update({
          where: { id: tokenAccount.id },
          data: { balance: balanceAfter },
        });

        await tx.tokenTransaction.create({
          data: {
            userId: order.userId,
            type: "PURCHASE",
            amount: fileQuantity,
            balanceBefore,
            balanceAfter,
            reference: order.orderNumber,
            description: `Token purchase (${order.paymentMethod})`,
          },
        });

        const updated = await tx.paymentOrder.update({
          where: { id: order.id },
          data: {
            status: "APPROVED",
            verifiedAt: new Date(),
            verifiedBy: "admin",
          },
        });

        return {
          ...updated,
          balanceAdded: fileQuantity,
          balanceBefore,
          balanceAfter,
        };
      } else {
        const updated = await tx.paymentOrder.update({
          where: { id: order.id },
          data: { status: "REJECTED" },
        });

        return { ...updated, balanceAdded: 0 };
      }
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Admin order action error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process order" },
      { status: 400 }
    );
  }
}
