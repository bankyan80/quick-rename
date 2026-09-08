import { getSession } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

export async function isAdmin() {
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

export async function processOrderAction(
  orderId: string,
  action: "approve" | "reject",
  source: string
) {
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
          verifiedBy: source,
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

  return result;
}