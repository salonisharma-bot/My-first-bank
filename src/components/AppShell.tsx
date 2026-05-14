import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Send, PiggyBank, FileText, Shield, Trophy, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useBank, resetState } from "@/lib/bank-store";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/payments", label: "Payments", icon: Send },
  { to: "/savings", label: "Savings", icon: PiggyBank },
  { to: "/statements", label: "Statements", icon: FileText },
  { to: "/security", label: "Security", icon: Shield },
  { to: "/rewards", label: "Rewards", icon: Trophy },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state } = useBank();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const initials = state.fullName
    ?.split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ME";

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-card text-primary-foreground shadow-card">
              <span className="text-sm font-bold">£</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">My First Bank</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">UK Simulator</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-semibold text-foreground">
              <Trophy className="h-3.5 w-3.5 text-gold" /> {state.xp} XP
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {initials}
            </div>
            <button
              onClick={() => {
                resetState();
                window.location.href = "/";
              }}
              className="ml-1 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              aria-label="Sign out and reset demo"
            >
              <LogOut className="h-3.5 w-3.5" /> Reset
            </button>
          </div>

          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-border bg-background px-4 py-2 md:hidden">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-teal-soft text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                resetState();
                window.location.href = "/";
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground"
            >
              <LogOut className="h-4 w-4" /> Reset demo
            </button>
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 pb-24 md:pb-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 space-y-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:bg-teal-soft hover:text-primary"
                  }`
                }
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 animate-fade-in">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {nav.slice(0, 5).map((n) => {
            const active = location.pathname === n.to;
            return (
              <button
                key={n.to}
                onClick={() => navigate(n.to)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <n.icon className={`h-5 w-5 ${active ? "text-teal" : ""}`} />
                {n.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}