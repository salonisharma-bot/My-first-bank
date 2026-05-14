import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBank, formatGBP, SavingsPot } from "@/lib/bank-store";
import { toast } from "@/hooks/use-toast";

const presets = [
  { name: "New Bicycle", emoji: "🚲", target: 250 },
  { name: "Gaming Console", emoji: "🎮", target: 500 },
  { name: "Holiday Fund", emoji: "✈️", target: 400 },
  { name: "University Savings", emoji: "🎓", target: 1000 },
];

export default function Savings() {
  const { state, setState, awardBadge } = useBank();
  const [showNew, setShowNew] = useState(false);

  const createPot = (name: string, emoji: string, target: number, monthly: number) => {
    const pot: SavingsPot = { id: crypto.randomUUID(), name, emoji, target, saved: 0, monthly };
    setState((s) => ({ ...s, pots: [...s.pots, pot] }));
    awardBadge("Saver Started", "🐷");
    setShowNew(false);
  };

  const moveToPot = (potId: string, amount: number) => {
    if (amount <= 0) return;
    if (state.balance < amount) return toast({ title: "Not enough balance", variant: "destructive" });
    setState((s) => ({
      ...s,
      balance: +(s.balance - amount).toFixed(2),
      pots: s.pots.map((p) => (p.id === potId ? { ...p, saved: +(p.saved + amount).toFixed(2) } : p)),
      transactions: [
        { id: crypto.randomUUID(), date: new Date().toISOString(), description: `Moved to savings pot`, category: "Savings", amount: -amount },
        ...s.transactions,
      ],
    }));
    toast({ title: `Saved ${formatGBP(amount)}!` });
  };

  const deletePot = (potId: string) => {
    const pot = state.pots.find((p) => p.id === potId);
    if (!pot) return;
    setState((s) => ({
      ...s,
      balance: +(s.balance + pot.saved).toFixed(2),
      pots: s.pots.filter((p) => p.id !== potId),
    }));
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Savings pots</h1>
            <p className="text-sm text-muted-foreground">Set goals and watch your money grow.</p>
          </div>
          <Button onClick={() => setShowNew(true)} className="rounded-full"><Plus className="mr-1 h-4 w-4" />New pot</Button>
        </div>

        {showNew && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <p className="mb-3 text-sm font-semibold">Pick a goal to start</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {presets.map((p) => (
                <button
                  key={p.name}
                  onClick={() => createPot(p.name, p.emoji, p.target, Math.round(p.target / 6))}
                  className="rounded-2xl border-2 border-border p-4 text-center transition-colors hover:border-teal hover:bg-teal-soft"
                >
                  <div className="text-3xl">{p.emoji}</div>
                  <p className="mt-2 text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Target {formatGBP(p.target)}</p>
                </button>
              ))}
            </div>
            <CustomPot onCreate={createPot} />
          </motion.div>
        )}

        {state.pots.length === 0 && !showNew && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Target className="mx-auto h-10 w-10 text-teal" />
            <p className="mt-3 font-semibold">No pots yet</p>
            <p className="text-sm text-muted-foreground">Create your first goal to start saving.</p>
            <Button className="mt-4 rounded-full" onClick={() => setShowNew(true)}>Create my first pot</Button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {state.pots.map((p) => {
            const pct = Math.min(100, (p.saved / p.target) * 100);
            const monthsLeft = p.monthly > 0 ? Math.ceil((p.target - p.saved) / p.monthly) : 0;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{p.emoji}</div>
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatGBP(p.saved)} of {formatGBP(p.target)}</p>
                    </div>
                  </div>
                  <button onClick={() => deletePot(p.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete pot">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                  <motion.div className="h-full bg-gradient-card" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{pct.toFixed(0)}% complete</span>
                  <span>{monthsLeft > 0 ? `~${monthsLeft} mo to go` : "Goal reached!"}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[5, 10, 25].map((a) => (
                    <Button key={a} size="sm" variant="outline" className="rounded-full" onClick={() => moveToPot(p.id, a)}>+ {formatGBP(a)}</Button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function CustomPot({ onCreate }: { onCreate: (name: string, emoji: string, target: number, monthly: number) => void }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [monthly, setMonthly] = useState("");

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Or create your own</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <Input placeholder="Pot name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="number" placeholder="Target £" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Input type="number" placeholder="Monthly £" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
      </div>
      <Button
        size="sm"
        className="mt-2 rounded-full"
        onClick={() => {
          const t = parseFloat(target), m = parseFloat(monthly);
          if (!name || !t || !m) return toast({ title: "Fill all fields", variant: "destructive" });
          onCreate(name, "🎯", t, m);
        }}
      >Create custom pot</Button>
    </div>
  );
}