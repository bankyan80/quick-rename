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

    const settings = await prisma.appSettings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      danaPaymentName: process.env.DANA_PAYMENT_NAME || settingsMap["danaPaymentName"] || "",
      danaPaymentNumber: process.env.DANA_PAYMENT_NUMBER || settingsMap["danaPaymentNumber"] || "",
      qrisImageUrl: process.env.QRIS_IMAGE_URL || settingsMap["qrisImageUrl"] || "",
      tokenPrice: Number(process.env.TOKEN_PRICE || settingsMap["tokenPrice"] || 50000),
      filesPerToken: Number(process.env.FILES_PER_TOKEN || settingsMap["filesPerToken"] || 100),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const allowedKeys = ["danaPaymentName", "danaPaymentNumber", "qrisImageUrl", "tokenPrice", "filesPerToken"];

    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.includes(key) && typeof value === "string") {
        await prisma.appSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
