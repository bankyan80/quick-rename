"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/use-store";
import { useSession } from "next-auth/react";
import TopBar from "@/components/top-bar";
import MenuBar from "@/components/menu-bar";
import Sidebar from "@/components/sidebar";
import MainPanel from "@/components/main-panel";
import RenamePanel from "@/components/rename-panel";
import BottomBar from "@/components/bottom-bar";
import SettingsModal from "@/components/settings-modal";
import HistoryModal from "@/components/history-modal";
import HelpModal from "@/components/help-modal";
import PaymentModal from "@/components/payment-modal";
import ProfileModal from "@/components/profile-modal";
import AdminModal from "@/components/admin-modal";
import LandingScreen from "@/components/landing-screen";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { getAnonymousId } from "@/lib/anonymous-session";

export default function ClientApp({
  children,
}: {
  children: React.ReactNode;
}) {
  useKeyboardShortcuts();

  const files = useAppStore((s) => s.files);
  const folderHandle = useAppStore((s) => s.folderHandle);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setUser = useAppStore((s) => s.setUser);
  const setQuota = useAppStore((s) => s.setQuota);
  const setDensity = useAppStore((s) => s.setDensity);
  const setConfirmBeforeRename = useAppStore((s) => s.setConfirmBeforeRename);
  const setPreserveExtensions = useAppStore((s) => s.setPreserveExtensions);
  const showSettings = useAppStore((s) => s.showSettings);
  const showHistory = useAppStore((s) => s.showHistory);
  const showHelp = useAppStore((s) => s.showHelp);
  const showPayment = useAppStore((s) => s.showPayment);
  const showProfile = useAppStore((s) => s.showProfile);
  const showAdmin = useAppStore((s) => s.showAdmin);
  const { data: session } = useSession();

  useEffect(() => {
    const savedTheme = localStorage.getItem("qr-theme");
    if (savedTheme) {
      setTheme(savedTheme as "dark" | "light" | "system");
    }
    const savedDensity = localStorage.getItem("qr-density");
    if (savedDensity) setDensity(savedDensity as "comfortable" | "compact");
    const savedConfirm = localStorage.getItem("qr-confirm-before-rename");
    if (savedConfirm !== null)
      setConfirmBeforeRename(savedConfirm === "true");
    const savedPreserve = localStorage.getItem("qr-preserve-extensions");
    if (savedPreserve !== null)
      setPreserveExtensions(savedPreserve === "true");
  }, [
    setTheme,
    setDensity,
    setConfirmBeforeRename,
    setPreserveExtensions,
  ]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
    localStorage.setItem("qr-theme", theme);
  }, [theme]);

  const density = useAppStore((s) => s.density);
  const confirmBeforeRename = useAppStore((s) => s.confirmBeforeRename);
  const preserveExtensions = useAppStore((s) => s.preserveExtensions);

  useEffect(() => {
    localStorage.setItem("qr-density", density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem("qr-confirm-before-rename", String(confirmBeforeRename));
  }, [confirmBeforeRename]);

  useEffect(() => {
    localStorage.setItem("qr-preserve-extensions", String(preserveExtensions));
  }, [preserveExtensions]);

  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "",
      });

      fetch("/api/quota")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setQuota({
              type: data.isAuthenticated ? "google" : "free",
              total: data.type === "free" ? data.freeTotal : data.googleTotal + data.tokenBalance,
              used: data.googleUsed,
              remaining: data.totalRemaining,
            });
          }
        })
        .catch(() => {});
    } else {
      setUser(null);
      const anonymousId = getAnonymousId();
      fetch(`/api/quota${anonymousId ? `?anonymousId=${encodeURIComponent(anonymousId)}` : ""}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error && !data.isAuthenticated) {
            setQuota({
              type: "free",
              total: data.freeTotal,
              used: data.freeUsed,
              remaining: data.totalRemaining,
            });
          }
        })
        .catch(() => {});
    }
  }, [session, setUser, setQuota]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-text-primary">
      {children}
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        {files.length === 0 && !folderHandle ? (
          <LandingScreen />
        ) : (
          <>
            <TopBar />
            <MenuBar />
            <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
              <Sidebar />
              <MainPanel />
              <RenamePanel />
            </div>
            <BottomBar />
          </>
        )}
      </div>

      {showSettings && <SettingsModal />}
      {showHistory && <HistoryModal />}
      {showHelp && <HelpModal />}
      {showPayment && <PaymentModal />}
      {showProfile && <ProfileModal />}
      {showAdmin && <AdminModal />}
    </div>
  );
}
