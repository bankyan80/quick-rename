import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.appSettings.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      danaPaymentName:
        settingsMap["danaPaymentName"] ||
        process.env.DANA_PAYMENT_NAME ||
        "",
      danaPaymentNumber:
        settingsMap["danaPaymentNumber"] ||
        process.env.DANA_PAYMENT_NUMBER ||
        "",
      qrisImageUrl:
        settingsMap["qrisImageUrl"] || process.env.QRIS_IMAGE_URL || "",
      tokenPrice: Number(
        settingsMap["tokenPrice"] ||
          process.env.TOKEN_PRICE ||
          50000
      ),
      filesPerToken: Number(
        settingsMap["filesPerToken"] ||
          process.env.FILES_PER_TOKEN ||
          100
      ),
    });
  } catch {
    return NextResponse.json(
      {
        danaPaymentName: "",
        danaPaymentNumber: "",
        qrisImageUrl: "",
        tokenPrice: Number(process.env.TOKEN_PRICE || 50000),
        filesPerToken: Number(process.env.FILES_PER_TOKEN || 100),
      },
      { status: 200 }
    );
  }
}