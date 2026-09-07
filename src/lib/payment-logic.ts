export type OrderStatus =
  | "PENDING"
  | "WAITING_VERIFICATION"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export interface PaymentOrderInput {
  id: string;
  tokenQuantity: number;
  fileQuantity: number;
  amount: number;
  paymentMethod: "DANA" | "QRIS";
  status: OrderStatus;
  balanceBefore: number;
}

export interface ApprovalDecision {
  canApprove: boolean;
  reason?: string;
  balanceAfter?: number;
}

export const TOKEN_PRICE_DEFAULT = 50000;
export const FILES_PER_TOKEN_DEFAULT = 100;

export function generateOrderNumber(date: Date, seq: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const s = String(seq).padStart(6, "0");
  return `QR-${y}${m}${d}-${s}`;
}

export function calculateFileQuantity(
  tokenQuantity: number,
  filesPerToken = FILES_PER_TOKEN_DEFAULT
): number {
  return tokenQuantity * filesPerToken;
}

export function calculateAmount(
  tokenQuantity: number,
  tokenPrice = TOKEN_PRICE_DEFAULT
): number {
  return tokenQuantity * tokenPrice;
}

/**
 * Double-approval protection: an order can only be approved
 * if it is NOT already APPROVED.
 */
export function canApproveOrder(order: PaymentOrderInput): ApprovalDecision {
  if (order.status === "APPROVED") {
    return {
      canApprove: false,
      reason: "Order already approved",
    };
  }

  return {
    canApprove: true,
    balanceAfter: order.balanceBefore + order.fileQuantity,
  };
}

export function validateProofSubmission(
  status: OrderStatus
): boolean {
  return status === "PENDING" || status === "WAITING_VERIFICATION";
}

export function describeOrderStatus(status: string): string {
  switch (status) {
    case "PENDING":
      return "Waiting for payment";
    case "WAITING_VERIFICATION":
      return "Payment proof submitted — waiting verification";
    case "APPROVED":
      return "Approved and credited";
    case "REJECTED":
      return "Rejected";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}