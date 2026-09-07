import { NextResponse } from "next/server";
import { getSession } from "@/lib/quota";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { reference, notes } = body;
    const { id } = await params;

    const order = await prisma.paymentOrder.findUnique({
      where: { id },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING" && order.status !== "WAITING_VERIFICATION") {
      return NextResponse.json(
        { error: "Order cannot be updated in current status" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const proof = await tx.paymentProof.upsert({
        where: { paymentOrderId: order.id },
        update: {
          reference: reference || null,
          notes: notes || null,
        },
        create: {
          paymentOrderId: order.id,
          reference: reference || null,
          notes: notes || null,
        },
      });

      const updatedOrder = await tx.paymentOrder.update({
        where: { id: order.id },
        data: { status: "WAITING_VERIFICATION" },
      });

      return { proof, order: updatedOrder };
    });

    return NextResponse.json({ success: true, ...updated });
  } catch (error) {
    console.error("Proof submission error:", error);
    return NextResponse.json({ error: "Failed to submit proof" }, { status: 500 });
  }
}
