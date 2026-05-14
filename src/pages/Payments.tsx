import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Receipt, UserPlus, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBank, formatGBP } from "@/lib/bank-store";
import { InfoTip } from "@/components/Tooltip";
import { toast } from "@/hooks/use-toast";

const bills = [
  { name: "Mobile contract (giffgaff)", amount: 12, emoji: "📱" },
  { name: "Streaming (Netflix Basic)", amount: 7.99, emoji: "🎬" },
  { name: "Charity donation", amount: 5, emoji: "❤️" },
  { name: "Online purchase (book)", amount: 9.5, emoji: "📚" },
];

export default function Payments() {
  const { state, setState, addTransaction, awardBadge } = useBank();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "send";

  const setTab = (t: string) => setParams({ tab: t });

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Payments</h1>
          <p className="text-sm text-muted-foreground">Send money or pay bills using UK Faster Payments.</p>
        </div>

        <div className="inline-flex rounded-full bg-muted p-1">
          {[
            { id: "send", label: "Pay someone", icon: Send },
            { id: "bills", label: "Pay a bill", icon: Receipt },
            { id: "payees", label: "Payees", icon: UserPlus },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                tab === t.id ? "bg-card text-primary shadow-card" : "text-muted-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "send" && <SendMoney />}
        {tab === "bills" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {bills.map((b) => (
              <button
                key={b.name}
                onClick={() => {
                  if (state.balance < b.amount) return toast({ title: "Not enough balance", variant: "destructive" });
                  addTransaction({ amount: -b.amount, description: b.name, category: "Bill" });
                  toast({ title: `Paid ${formatGBP(b.amount)} to ${b.name}` });
                }}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-card hover:border-teal hover:shadow-elevated"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-soft text-xl">{b.emoji}</div>
                  <div>
                    <p className="text-sm font-semibold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">Direct Debit</p>
                  </div>
                </div>
                <p className="font-bold">{formatGBP(b.amount)}</p>
              </button>
            ))}
          </div>
        )}
        {tab === "payees" && (
          <div className="space-y-3">
            {state.payees.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{p.sortCode} · {p.accountNumber}</p>
                </div>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">VERIFIED</span>
              </div>
            ))}
            <AddPayee onAdd={(p) => setState((s) => ({ ...s, payees: [...s.payees, p] }))} />
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SendMoney() {
  const { state, addTransaction, awardBadge } = useBank();
  const [payeeId, setPayeeId] = useState(state.payees[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");

  const payee = state.payees.find((p) => p.id === payeeId);

  const sendOtp = () => {
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setCode(c);
    setOtpSent(true);
    toast({ title: `📱 SMS code: ${c}`, description: "In real life, this would be sent to your phone." });
  };

  const submit = () => {
    const n = parseFloat(amount);
    if (!payee || !n || n <= 0) return toast({ title: "Enter a valid amount", variant: "destructive" });
    if (n > state.balance) return toast({ title: "Insufficient funds", variant: "destructive" });
    if (otp !== code) return toast({ title: "Wrong SMS code", variant: "destructive" });

    addTransaction({ amount: -n, description: `Payment to ${payee.name}${reference ? ` — ${reference}` : ""}`, category: "Transfer" });
    awardBadge("Sent Safely", "📤");
    toast({ title: `Sent ${formatGBP(n)} to ${payee.name} via Faster Payments ⚡` });
    setAmount(""); setReference(""); setOtp(""); setOtpSent(false); setCode("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center gap-2 rounded-xl bg-teal-soft p-3 text-xs text-primary">
        <ShieldCheck className="h-4 w-4 text-teal" />
        <span>Confirmation of Payee checks the name matches before sending — protects you from scams.</span>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pay to</Label>
        <select
          value={payeeId}
          onChange={(e) => setPayeeId(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
        >
          {state.payees.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.sortCode}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Amount (£) <InfoTip text="Faster Payments usually arrive within seconds." />
          </Label>
          <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference (optional)</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. Birthday" />
        </div>
      </div>

      {!otpSent ? (
        <Button onClick={sendOtp} className="w-full rounded-full">Send SMS verification code</Button>
      ) : (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enter 6-digit code</Label>
            <Input inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
          </div>
          <Button onClick={submit} className="w-full rounded-full bg-teal hover:bg-teal/90">Confirm payment</Button>
        </div>
      )}
    </motion.div>
  );
}

function AddPayee({ onAdd }: { onAdd: (p: { id: string; name: string; sortCode: string; accountNumber: string }) => void }) {
  const [name, setName] = useState("");
  const [sort, setSort] = useState("");
  const [acct, setAcct] = useState("");

  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold">Add a new payee</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Sort code (00-00-00)" value={sort} onChange={(e) => setSort(e.target.value)} />
        <Input placeholder="Account number" value={acct} onChange={(e) => setAcct(e.target.value.replace(/\D/g, "").slice(0, 8))} />
      </div>
      <Button
        className="mt-3 rounded-full"
        onClick={() => {
          if (!name || !sort || acct.length !== 8) return toast({ title: "Fill all fields, account = 8 digits", variant: "destructive" });
          onAdd({ id: crypto.randomUUID(), name, sortCode: sort, accountNumber: acct });
          toast({ title: `${name} added as a payee` });
          setName(""); setSort(""); setAcct("");
        }}
      >
        Add payee
      </Button>
    </div>
  );
}