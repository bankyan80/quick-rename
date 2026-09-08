"use client";

import { useAppStore } from "@/store/use-store";
import AdminPanel from "@/components/admin-panel";

export default function AdminModal() {
  const setShowAdmin = useAppStore((s) => s.setShowAdmin);

  return <AdminPanel variant="modal" onClose={() => setShowAdmin(false)} />;
}