import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Upload, Camera, ShieldCheck, KeyRound, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InfoTip } from "@/components/Tooltip";
import { BankCard } from "@/components/BankCard";
import { useBank, generateAccountDetails, formatGBP } from "@/lib/bank-store";
import { celebrate } from "@/components/Confetti";
import { toast } from "@/hooks/use-toast";

const steps = ["Personal details", "Verify identity", "Choose account", "Security", "Approved"];

const accountTypes = [
  {
    id: "teen" as const,
    name: "Teen Current Account",
    age: "Ages 13–17",
    debit: true,
    overdraft: false,
    rate: "1.50%",
    perks: ["Contactless debit card", "Spending notifications", "Monthly £10 free transfers"],
  },
  {
    id: "junior" as const,
    name: "Junior Saver",
    age: "Ages 12–15",
    debit: false,
    overdraft: false,
    rate: "3.25%",
    perks: ["High savings rate", "Parental controls", "Round-up savings"],
  },
  {
    id: "student" as const,
    name: "Student Starter",
    age: "Ages 16+",
    debit: true,
    overdraft: false,
    rate: "2.10%",
    perks: ["Free travel insurance demo", "Budgeting tools", "Cashback rewards"],
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { state, setState, awardBadge } = useBank();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    fullName: state.fullName || "",
    dob: "",
    mobile: state.mobile || "",
    email: state.email || "",
    address: "",
    postcode: state.postcode || "",
    docUploaded: false,
    selfieTaken: false,
    accountType: state.accountType || "teen",
    username: "",
    password: "",
    passcode: "",
    twoFA: true,
  });

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finalise = () => {
    const details = generateAccountDetails();
    setState((s) => ({
      ...s,
      onboarded: true,
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      postcode: form.postcode,
      accountType: form.accountType,
      ...details,
      balance: 25,
      transactions: [
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          description: "Welcome bonus from My First Bank",
          category: "Bonus",
          amount: 25,
        },
      ],
    }));
    awardBadge("Account Opened", "🏦");
    celebrate();
    next();
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.fullName.trim() || !form.dob || !form.mobile.trim() || !form.email.trim() || !form.postcode.trim()) {
        toast({ title: "Please complete all fields", variant: "destructive" });
        return false;
      }
    }
    if (step === 1 && (!form.docUploaded || !form.selfieTaken)) {
      toast({ title: "Please complete identity checks", variant: "destructive" });
      return false;
    }
    if (step === 3) {
      if (form.username.length < 4 || form.password.length < 6 || form.passcode.length !== 4) {
        toast({ title: "Username 4+ chars, password 6+, passcode 4 digits", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step === 3) finalise();
    else next();
  };

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => (step === 0 ? navigate("/") : back())}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{steps[step]}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-card"
              initial={false}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Tell us about yourself</h2>
                  <p className="text-sm text-muted-foreground">Banks need basic info to open your account. This is mock data only.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name"><Input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Alex Taylor" /></Field>
                    <Field label="Date of birth"><Input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} /></Field>
                    <Field label="UK mobile number"><Input value={form.mobile} onChange={(e) => update("mobile", e.target.value)} placeholder="07700 900123" /></Field>
                    <Field label="Email address"><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="alex@example.co.uk" /></Field>
                    <Field label="Home address" className="sm:col-span-2"><Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="221B Baker Street, London" /></Field>
                    <Field label={<span className="flex items-center gap-2">Postcode <InfoTip text="A UK postcode like SW1A 1AA helps your bank confirm your address." /></span>}>
                      <Input value={form.postcode} onChange={(e) => update("postcode", e.target.value.toUpperCase())} placeholder="SW1A 1AA" />
                    </Field>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold">Verify your identity</h2>
                  <div className="rounded-2xl bg-teal-soft p-4 text-sm text-primary">
                    <div className="flex gap-2">
                      <ShieldCheck className="h-5 w-5 shrink-0 text-teal" />
                      <p><strong>Why?</strong> UK banks must verify identity (KYC) to prevent fraud and money laundering.</p>
                    </div>
                  </div>
                  <UploadCard
                    icon={<Upload className="h-5 w-5" />}
                    title="Upload Passport or Provisional Driving Licence"
                    done={form.docUploaded}
                    onClick={() => { update("docUploaded", true); toast({ title: "ID document accepted ✓" }); }}
                  />
                  <UploadCard
                    icon={<Camera className="h-5 w-5" />}
                    title="Take a selfie to match your ID"
                    done={form.selfieTaken}
                    onClick={() => { update("selfieTaken", true); toast({ title: "Selfie verified ✓" }); }}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Choose your account</h2>
                  <p className="text-sm text-muted-foreground">Pick the account that fits you best. You can change later.</p>
                  <div className="grid gap-3">
                    {accountTypes.map((a) => {
                      const active = form.accountType === a.id;
                      return (
                        <button
                          key={a.id}
                          onClick={() => update("accountType", a.id)}
                          className={`text-left rounded-2xl border-2 p-5 transition-all ${
                            active ? "border-teal bg-teal-soft shadow-card" : "border-border bg-card hover:border-teal/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-bold">{a.name}</h3>
                              <p className="text-xs text-muted-foreground">{a.age}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Interest (AER)</p>
                              <p className="text-lg font-bold text-teal">{a.rate}</p>
                            </div>
                          </div>
                          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                            {a.perks.map((p) => (
                              <li key={p} className="flex items-center gap-2"><Check className="h-3 w-3 text-success" /> {p}</li>
                            ))}
                            <li className="flex items-center gap-2 opacity-70">
                              <span className={a.debit ? "text-success" : "text-muted-foreground"}>{a.debit ? "✓" : "—"}</span> Debit card
                            </li>
                            <li className="flex items-center gap-2 opacity-70">
                              <span className="text-muted-foreground">—</span> Overdraft (not available under 18)
                            </li>
                          </ul>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Set up security</h2>
                  <p className="text-sm text-muted-foreground">Strong logins keep your money safe.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Username"><Input value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="alex_t" /></Field>
                    <Field label="Password"><Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 6 chars" /></Field>
                    <Field label={<span className="flex items-center gap-2">4-digit passcode <InfoTip text="A short PIN you'll use in the mobile app for quick login." /></span>}>
                      <Input inputMode="numeric" maxLength={4} value={form.passcode} onChange={(e) => update("passcode", e.target.value.replace(/\D/g, ""))} placeholder="••••" />
                    </Field>
                    <Field label="Two-Factor Authentication">
                      <button
                        onClick={() => update("twoFA", !form.twoFA)}
                        className={`flex w-full items-center justify-between rounded-xl border-2 p-3 ${form.twoFA ? "border-success bg-success/10" : "border-border"}`}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4" /> 2FA via SMS</span>
                        <span className={`text-xs font-bold ${form.twoFA ? "text-success" : "text-muted-foreground"}`}>{form.twoFA ? "ON" : "OFF"}</span>
                      </button>
                    </Field>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 text-center">
                  <PartyPopper className="mx-auto h-12 w-12 text-gold" />
                  <div>
                    <h2 className="text-2xl font-bold">Your account is ready! 🎉</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Welcome bonus of {formatGBP(25)} added.</p>
                  </div>
                  <div className="flex justify-center"><BankCard name={state.fullName} number={state.cardNumber} expiry={state.cardExpiry} /></div>
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <Detail label="Sort code" value={state.sortCode} tip="A sort code identifies your bank branch." />
                    <Detail label="Account number" value={state.accountNumber} tip="Your unique 8-digit account number." />
                    <Detail label="Customer number" value={state.customerNumber} />
                    <Detail label="Card CVV" value={state.cardCvv} />
                  </div>
                  <Button size="lg" onClick={() => navigate("/dashboard")} className="w-full rounded-full">
                    Go to my dashboard <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step < 4 && (
            <div className="mt-8 flex justify-end gap-2">
              {step > 0 && <Button variant="outline" onClick={back} className="rounded-full">Back</Button>}
              <Button onClick={handleNext} className="rounded-full">
                {step === 3 ? "Open my account" : "Continue"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function UploadCard({ icon, title, done, onClick }: { icon: React.ReactNode; title: string; done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl border-2 border-dashed p-5 text-left transition-all ${
        done ? "border-success bg-success/10" : "border-border hover:border-teal hover:bg-teal-soft/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${done ? "bg-success text-success-foreground" : "bg-teal-soft text-teal"}`}>
          {done ? <Check className="h-5 w-5" /> : icon}
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{done ? "Verified" : "Tap to simulate upload"}</p>
        </div>
      </div>
    </button>
  );
}

function Detail({ label, value, tip }: { label: string; value: string; tip?: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label} {tip && <InfoTip text={tip} />}</p>
      <p className="mt-1 font-mono text-sm font-bold">{value}</p>
    </div>
  );
}