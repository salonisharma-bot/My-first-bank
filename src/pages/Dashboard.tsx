import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Plus, Send, Receipt, PiggyBank, FileText, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { BankCard } from "@/components/BankCard";
import { useBank, formatGBP } from "@/lib/bank-store";
import { Button } from "@/components/ui/button";
import { InfoTip } from "@/components/Tooltip";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { state, addTransaction, awardBadge } = useBank();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);

  if (!state.onboarded) {
    navigate("/register");
    return null;
  }

  const totalSaved = state.pots.reduce((a, p) => a + p.saved, 0);
  const monthSpend = state.transactions
    .filter((t) => t.amount < 0 && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((a, t) => a + Math.abs(t.amount), 0);

  const healthScore = Math.min(100, 40 + state.badges.length * 8 + (totalSaved > 0 ? 20 : 0) + (state.balance > 50 ? 15 : 0));

  const quickAdd = (amount: number, description: string) => {
    addTransaction({ amount, description, category: amount > 0 ? "Deposit" : "Spending" });
    if (amount > 0) awardBadge("First Deposit", "💰");
    toast({ title: `${amount > 0 ? "Added" : "Spent"} ${formatGBP(Math.abs(amount))}` });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-bold md:text-3xl">{state.fullName.split(" ")[0]} 👋</h1>
        </div>

        {/* Card + balance */}
        <div className="grid gap-6 md:grid-cols-[auto,1fr]">
          <BankCard name={state.fullName} number={state.cardNumber} expiry={state.cardExpiry} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="Current balance"
              value={hidden ? "£ • • • •" : formatGBP(state.balance)}
              accent
              action={
                <button onClick={() => setHidden((v) => !v)} className="text-primary-foreground/70 hover:text-primary-foreground">
                  {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              }
            />
            <Stat label="Saved in pots" value={formatGBP(totalSaved)} icon={<PiggyBank className="h-4 w-4 text-teal" />} />
            <Stat label="Spent this month" value={formatGBP(monthSpend)} icon={<ArrowUpRight className="h-4 w-4 text-destructive" />} />
            <Stat
              label={<span className="flex items-center gap-1.5">Financial health <InfoTip text="A score based on saving habits, balance and learning achievements." /></span>}
              value={`${healthScore}/100`}
              icon={<span className="text-xl">{healthScore > 70 ? "💪" : healthScore > 40 ? "👍" : "🌱"}</span>}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ActionTile icon={Plus} label="Add money" onClick={() => quickAdd(10, "Allowance from parent")} />
          <ActionTile icon={Send} label="Pay someone" onClick={() => navigate("/payments")} />
          <ActionTile icon={Receipt} label="Pay a bill" onClick={() => navigate("/payments?tab=bills")} />
          <ActionTile icon={PiggyBank} label="Savings pot" onClick={() => navigate("/savings")} />
        </div>

        {/* Account details */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Your account details</h2>
            <Link to="/security" className="text-xs font-semibold text-teal hover:underline">Security centre →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Mini label={<span className="flex items-center gap-1.5">Sort code <InfoTip text="A sort code identifies your bank branch." /></span>} value={state.sortCode} />
            <Mini label={<span className="flex items-center gap-1.5">Account number <InfoTip text="An 8-digit number unique to your account." /></span>} value={state.accountNumber} />
            <Mini label="Customer number" value={state.customerNumber} />
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent activity</h2>
            <Link to="/statements" className="text-xs font-semibold text-teal hover:underline">View all →</Link>
          </div>
          {state.transactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet — try adding some money!</p>
          ) : (
            <ul className="divide-y divide-border">
              {state.transactions.slice(0, 6).map((t) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.amount > 0 ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                      {t.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · {t.category}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                    {t.amount > 0 ? "+" : ""}{formatGBP(t.amount)}
                  </p>
                </motion.li>
              ))}
            </ul>
          )}
        </div>

        {/* Learning callouts */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/security" className="group flex items-center justify-between rounded-2xl border border-border bg-gradient-to-br from-card to-teal-soft p-5 shadow-card transition-shadow hover:shadow-elevated">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal">Mission</p>
              <p className="mt-1 font-bold">Spot the scam</p>
              <p className="text-xs text-muted-foreground">Test your fraud-spotting skills</p>
            </div>
            <Shield className="h-8 w-8 text-teal transition-transform group-hover:scale-110" />
          </Link>
          <Link to="/statements" className="group flex items-center justify-between rounded-2xl border border-border bg-gradient-to-br from-card to-gold/10 p-5 shadow-card transition-shadow hover:shadow-elevated">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Learn</p>
              <p className="mt-1 font-bold">Read your statement</p>
              <p className="text-xs text-muted-foreground">Understand every line</p>
            </div>
            <FileText className="h-8 w-8 text-gold transition-transform group-hover:scale-110" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, icon, accent, action }: { label: React.ReactNode; value: string; icon?: React.ReactNode; accent?: boolean; action?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-card ${accent ? "border-transparent bg-gradient-card text-primary-foreground" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-medium ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
        {action ?? icon}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function ActionTile({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-teal hover:shadow-elevated"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-soft text-teal transition-colors group-hover:bg-teal group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

function Mini({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold">{value}</p>
    </div>
  );
}