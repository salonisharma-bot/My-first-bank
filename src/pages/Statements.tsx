import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBank, formatGBP } from "@/lib/bank-store";
import { InfoTip } from "@/components/Tooltip";
import { toast } from "@/hooks/use-toast";

export default function Statements() {
  const { state, awardBadge } = useBank();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const categories = useMemo(() => Array.from(new Set(state.transactions.map((t) => t.category))), [state.transactions]);

  const filtered = state.transactions.filter((t) => {
    if (filter !== "all" && t.category !== filter) return false;
    if (q && !t.description.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const ordered = [...filtered].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  let running = 0;
  const withBalance = ordered.map((t) => ({ ...t, runningBalance: (running = +(running + t.amount).toFixed(2)) }));

  const downloadStatement = () => {
    awardBadge("Statement Reader", "📄");
    const lines = [
      `My First Bank — Statement for ${state.fullName}`,
      `Sort code ${state.sortCode}  Account ${state.accountNumber}`,
      "",
      ...withBalance.map((t) => `${new Date(t.date).toLocaleDateString("en-GB")}  ${t.description.padEnd(40).slice(0, 40)}  ${(t.amount < 0 ? "-" : "+")}${formatGBP(Math.abs(t.amount))}  Bal ${formatGBP(t.runningBalance)}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "statement.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Statement downloaded" });
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Statements</h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">Every transaction, in one place. <InfoTip text="A bank statement is the official record of money in and out of your account." /></p>
          </div>
          <Button onClick={downloadStatement} variant="outline" className="rounded-full"><Download className="mr-1 h-4 w-4" />Download</Button>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-3 shadow-card">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions..." className="pl-9" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-input bg-background px-3 text-sm">
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Date</span><span>Description</span><span className="text-right">Amount</span><span className="hidden text-right sm:block">Balance</span>
          </div>
          {withBalance.length === 0 ? (
            <p className="p-12 text-center text-sm text-muted-foreground">No transactions to show.</p>
          ) : (
            [...withBalance].reverse().map((t) => (
              <div key={t.id} className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-4 border-b border-border px-5 py-3 text-sm last:border-0">
                <span className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.category}</p>
                </div>
                <span className={`text-right font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>{t.amount > 0 ? "+" : ""}{formatGBP(t.amount)}</span>
                <span className="hidden text-right font-mono text-xs text-muted-foreground sm:block">{formatGBP(t.runningBalance)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}