import { motion } from "framer-motion";
import { Trophy, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useBank } from "@/lib/bank-store";

const allMissions = [
  { name: "Account Opened", emoji: "🏦", desc: "Complete the sign-up flow" },
  { name: "First Deposit", emoji: "💰", desc: "Add money to your account" },
  { name: "Sent Safely", emoji: "📤", desc: "Make a verified payment" },
  { name: "Saver Started", emoji: "🐷", desc: "Create a savings pot" },
  { name: "Cyber Safe", emoji: "🛡️", desc: "Spot 3 scams correctly" },
  { name: "Statement Reader", emoji: "📄", desc: "Download a bank statement" },
];

export default function Rewards() {
  const { state } = useBank();
  const earned = new Set(state.badges.map((b) => b.name));
  const level = Math.floor(state.xp / 100) + 1;
  const pct = state.xp % 100;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl bg-gradient-card p-6 text-primary-foreground shadow-elevated md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-80">Your level</p>
              <p className="mt-1 text-4xl font-bold">Level {level}</p>
              <p className="mt-1 text-sm opacity-80">{state.xp} XP earned</p>
            </div>
            <Trophy className="h-12 w-12 text-gold" />
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div className="h-full bg-gold" initial={{ width: 0 }} animate={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs opacity-80">{100 - pct} XP to level {level + 1}</p>
        </div>

        <div>
          <h2 className="mb-3 flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4 text-gold" /> Missions & badges</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allMissions.map((m, i) => {
              const got = earned.has(m.name);
              return (
                <motion.div key={m.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border p-5 text-center shadow-card ${got ? "border-gold bg-gradient-to-br from-gold/15 to-card" : "border-border bg-card opacity-70"}`}>
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-3xl ${got ? "gold-chip" : "bg-muted"}`}>{got ? m.emoji : "🔒"}</div>
                  <p className="mt-3 font-bold">{m.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                  {got && <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-gold">Earned</p>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}