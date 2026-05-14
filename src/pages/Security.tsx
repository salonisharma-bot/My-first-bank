import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, KeyRound, Smartphone, BellRing } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useBank } from "@/lib/bank-store";
import { toast } from "@/hooks/use-toast";
import { celebrate } from "@/components/Confetti";

const scams = [
  { id: "hmrc", title: "HMRC text message", body: '"HMRC: You are due a tax refund of £278.50. Claim now: http://hmrc-refund.co/claim"', options: [{ text: "Tap the link and enter my bank details", correct: false }, { text: "Reply STOP", correct: false }, { text: "Delete it — HMRC never texts links for refunds", correct: true }], explain: "HMRC will never text you a link to claim a refund. Always go to gov.uk directly." },
  { id: "bank", title: "Phone call from 'your bank'", body: '"Hi, this is Barclays Fraud Team. Please move your money to this safe account..."', options: [{ text: "Move the money quickly to be safe", correct: false }, { text: "Hang up, then call your bank using the number on your card", correct: true }, { text: "Give them your PIN to verify", correct: false }], explain: "Your real bank will never ask you to move money to a 'safe account' or share your PIN." },
  { id: "phish", title: "Phishing email", body: '"Your Netflix has been suspended. Update payment: http://netflxi-billing.com"', options: [{ text: "Click the link and update card", correct: false }, { text: "Check the URL — it's misspelled, delete it", correct: true }, { text: "Reply asking why", correct: false }], explain: "Phishing sites use lookalike URLs. Always go to the official site directly." },
  { id: "parcel", title: "Parcel delivery scam", body: '"Royal Mail: Your parcel needs a £1.45 redelivery fee. Pay: http://royal-mail-fee.uk"', options: [{ text: "Pay £1.45 — it's small", correct: false }, { text: "Ignore — Royal Mail rarely asks small fees by SMS", correct: true }, { text: "Forward to friends", correct: false }], explain: "Forward suspicious texts to 7726 (free) in the UK." },
];

export default function Security() {
  const { state, setState, awardBadge } = useBank();
  const [active, setActive] = useState<string | null>(null);
  const [answered, setAnswered] = useState<Record<string, boolean>>({});

  const onAnswer = (id: string, correct: boolean) => {
    setAnswered((a) => ({ ...a, [id]: correct }));
    if (correct) {
      setState((s) => ({ ...s, scamsSpotted: s.scamsSpotted + 1, xp: s.xp + 25 }));
      if (state.scamsSpotted + 1 >= 3) { awardBadge("Cyber Safe", "🛡️"); celebrate(); }
      toast({ title: "Spot on! +25 XP" });
    } else {
      toast({ title: "Not quite — try again", variant: "destructive" });
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Security centre</h1>
          <p className="text-sm text-muted-foreground">Keep your money — and your data — safe.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SecCard icon={KeyRound} title="Password" status="Strong" />
          <SecCard icon={Smartphone} title="2FA" status="Enabled" />
          <SecCard icon={BellRing} title="Login alerts" status="On" />
          <SecCard icon={ShieldCheck} title="Scams spotted" status={`${state.scamsSpotted}/4`} muted={state.scamsSpotted < 3} />
        </div>

        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-gold" />
            <h2 className="font-bold">Scam Challenge</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Tap a scenario and choose the safest response.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {scams.map((s) => {
              const done = answered[s.id];
              return (
                <div key={s.id} className={`rounded-2xl border-2 p-4 ${done ? "border-success bg-success/5" : "border-border"}`}>
                  <button onClick={() => setActive(active === s.id ? null : s.id)} className="w-full text-left">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scenario</p>
                    <p className="mt-1 font-bold">{s.title}</p>
                    <p className="mt-2 rounded-lg bg-muted/60 p-3 text-xs italic">{s.body}</p>
                  </button>
                  <AnimatePresence>
                    {active === s.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2 overflow-hidden">
                        {s.options.map((o, i) => (
                          <button key={i} onClick={() => onAnswer(s.id, o.correct)} className="block w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-sm hover:border-teal hover:bg-teal-soft">{o.text}</button>
                        ))}
                        {done && <p className="rounded-lg bg-teal-soft p-3 text-xs text-primary"><strong>Why:</strong> {s.explain}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SecCard({ icon: Icon, title, status, muted }: { icon: any; title: string; status: string; muted?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-teal" />
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${muted ? "bg-muted text-muted-foreground" : "bg-success/15 text-success"}`}>{status}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
    </div>
  );
}