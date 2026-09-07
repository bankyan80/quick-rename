"use client";

import { Logo } from "@/components/logo";
import { useAppStore } from "@/store/use-store";
import { Sun, Moon, Zap, Shield, Settings, ChevronDown } from "lucide-react";
import { signIn } from "next-auth/react";

export default function TopBar() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const quota = useAppStore((s) => s.quota);
  const user = useAppStore((s) => s.user);
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const setShowPayment = useAppStore((s) => s.setShowPayment);
  const setShowProfile = useAppStore((s) => s.setShowProfile);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const quotaLabel =
    quota.type === "free"
      ? `GRATIS · sisa ${quota.remaining} file`
      : quota.type === "google" && quota.remaining > quota.total
      ? `TOKEN · sisa ${quota.remaining} file`
      : user
      ? `GOOGLE · sisa ${quota.remaining} file`
      : `GRATIS · sisa ${quota.remaining} file`;

  const showTokenBadge = user && quota.total > 10;

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-panel px-4">
      <div className="flex items-center gap-2.5">
        <Logo size={30} />
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-semibold tracking-tight">
            Quick Rename
          </span>
          <span className="text-[10px] text-text-muted">
            Ubah nama ratusan file dalam hitungan detik
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <span className="hidden md:flex items-center gap-1.5 text-[11px] text-text-muted">
          <Shield size={13} className="text-success" />
          File tetap di perangkat Anda
        </span>

        <span
          className="badge cursor-default bg-primary-soft text-primary"
          title="Kuota file saat ini"
        >
          <Zap size={12} />
          {quotaLabel}
        </span>

        {showTokenBadge && (
          <button
            className="badge border border-border bg-card text-text-secondary hover:bg-card-hover transition-colors cursor-pointer"
            onClick={() => setShowPayment(true)}
          >
            Beli Token
          </button>
        )}

<button
              className="toolbar-button"
              onClick={toggleTheme}
              aria-label="Ganti mode terang/gelap"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

        {!user && (
          <button
            className="rounded flex items-center gap-1.5 border border-primary/40 bg-primary-soft px-2.5 py-1.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/20"
            onClick={() => signIn("google")}
          >
            Masuk dengan Google
          </button>
        )}

        <div className="relative group">
          {user ? (
            <button
              className="toolbar-button !p-1"
              onClick={() => setShowProfile(true)}
              aria-label="Menu akun"
            >
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <ChevronDown size={12} className="text-text-muted" />
            </button>
          ) : (
            <button
              className="toolbar-button"
              onClick={() => setShowSettings(false)}
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}