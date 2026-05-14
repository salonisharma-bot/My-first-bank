import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  RotateCcw,
  Calculator,
  Receipt,
  PiggyBank,
  Lightbulb,
  Award,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { celebrate } from "@/components/Confetti";

/* ----------------------------- Types & helpers ---------------------------- */

type Role = "employee" | "business" | null;

type EmployeeData = {
  salary: number;
  taxPaid: number;
  savingsInterest: number;
  charity: number;
};

type BusinessData = {
  revenue: number;
  equipment: number;
  marketing: number;
  supplies: number;
  savingsInterest: number;
};

type DeductionOption = {
  id: string;
  label: string;
  emoji: string;
  valid: boolean;
  hint: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)));

/* Universal simplified bracket system */
function calcTax(taxable: number) {
  let owed = 0;
  const breakdown: { band: string; amount: number; rate: number; tax: number }[] = [];
  const b1 = Math.min(taxable, 10000);
  breakdown.push({ band: "0–10k", amount: b1, rate: 0, tax: 0 });
  const b2 = Math.min(Math.max(taxable - 10000, 0), 30000);
  const t2 = b2 * 0.1;
  owed += t2;
  breakdown.push({ band: "10k–40k", amount: b2, rate: 10, tax: t2 });
  const b3 = Math.max(taxable - 40000, 0);
  const t3 = b3 * 0.2;
  owed += t3;
  breakdown.push({ band: "40k+", amount: b3, rate: 20, tax: t3 });
  return { owed, breakdown };
}

/* --------------------------------- Page ---------------------------------- */

export default function TaxChallenge() {
  const [role, setRole] = useState<Role>(null);
  const [step, setStep] = useState(0); // 0 dashboard, 1 income, 2 deductions, 3 calc, 4 results, 5 reflection
  const [showStart, setShowStart] = useState(true);

  const [emp, setEmp] = useState<EmployeeData>({
    salary: 36000,
    taxPaid: 4000,
    savingsInterest: 500,
    charity: 300,
  });

  const [biz, setBiz] = useState<BusinessData>({
    revenue: 50000,
    equipment: 8000,
    marketing: 2500,
    supplies: 1500,
    savingsInterest: 400,
  });

  const allDeductions: DeductionOption[] = useMemo(
    () =>
      role === "employee"
        ? [
            { id: "charity", label: "Charity donation", emoji: "💝", valid: true, hint: "Donations to registered charities are usually deductible." },
            { id: "course", label: "Job-related training course", emoji: "📚", valid: true, hint: "Training that relates to your job can often be claimed." },
            { id: "vacation", label: "Family vacation", emoji: "🏖️", valid: false, hint: "Holidays are personal — never deductible." },
            { id: "console", label: "New gaming console", emoji: "🎮", valid: false, hint: "Personal entertainment isn't a tax deduction." },
            { id: "uniform", label: "Required work uniform", emoji: "👔", valid: true, hint: "Uniforms required for work are usually deductible." },
            { id: "coffee", label: "Daily coffee runs", emoji: "☕", valid: false, hint: "Everyday personal spending doesn't count." },
          ]
        : [
            { id: "laptop", label: "Laptop for business", emoji: "💻", valid: true, hint: "Equipment used for the business is deductible." },
            { id: "ads", label: "Advertising costs", emoji: "📣", valid: true, hint: "Marketing is a normal business expense." },
            { id: "supplies", label: "Office supplies", emoji: "📎", valid: true, hint: "Supplies used to run the business are deductible." },
            { id: "vacation", label: "Family vacation", emoji: "🏖️", valid: false, hint: "Personal trips aren't business expenses." },
            { id: "console", label: "Gaming console (for fun)", emoji: "🎮", valid: false, hint: "Personal items don't qualify." },
            { id: "lunch", label: "Lunch with friends", emoji: "🍔", valid: false, hint: "Social meals with friends aren't deductible." },
          ],
    [role]
  );

  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, "ok" | "bad">>({});
  const [score, setScore] = useState(0);
  const [reflection, setReflection] = useState({ easier: "", responsibility: "", surprised: "" });

  /* ------------------------------ Calculations ----------------------------- */

  const totals = useMemo(() => {
    if (role === "employee") {
      const totalIncome = emp.salary + emp.savingsInterest;
      // valid deductions among those picked
      const validPicked = allDeductions.filter((d) => d.valid && picked[d.id]);
      // Map: charity uses emp.charity amount; course/uniform = $400 sample each
      const sampleAmounts: Record<string, number> = {
        charity: emp.charity,
        course: 400,
        uniform: 250,
      };
      const deductions = validPicked.reduce((s, d) => s + (sampleAmounts[d.id] ?? 0), 0);
      const taxable = Math.max(0, totalIncome - deductions);
      const { owed, breakdown } = calcTax(taxable);
      const net = owed - emp.taxPaid; // positive = owe more, negative = refund
      return { totalIncome, deductions, taxable, owed, breakdown, taxPaid: emp.taxPaid, net };
    }
    if (role === "business") {
      const totalIncome = biz.revenue + biz.savingsInterest;
      const sampleAmounts: Record<string, number> = {
        laptop: biz.equipment,
        ads: biz.marketing,
        supplies: biz.supplies,
      };
      const deductions = allDeductions
        .filter((d) => d.valid && picked[d.id])
        .reduce((s, d) => s + (sampleAmounts[d.id] ?? 0), 0);
      const taxable = Math.max(0, totalIncome - deductions);
      const { owed, breakdown } = calcTax(taxable);
      return { totalIncome, deductions, taxable, owed, breakdown, taxPaid: 0, net: owed };
    }
    return null;
  }, [role, emp, biz, picked, allDeductions]);

  /* ------------------------------ Interactions ----------------------------- */

  function togglePick(d: DeductionOption) {
    setPicked((p) => {
      const next = { ...p, [d.id]: !p[d.id] };
      return next;
    });
    setFeedback((f) => ({ ...f, [d.id]: d.valid ? "ok" : "bad" }));
    setScore((s) => s + (d.valid ? 10 : -5));
    setTimeout(() => setFeedback((f) => {
      const c = { ...f };
      delete c[d.id];
      return c;
    }), 1200);
  }

  function startOver() {
    setRole(null);
    setStep(0);
    setPicked({});
    setScore(0);
    setShowStart(true);
    setReflection({ easier: "", responsibility: "", surprised: "" });
  }

  function next() {
    if (step === 3) celebrate();
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  /* --------------------------------- UI ----------------------------------- */

  if (showStart) {
    return (
      <Shell>
        <Welcome onStart={() => setShowStart(false)} />
      </Shell>
    );
  }

  if (!role) {
    return (
      <Shell>
        <RoleSelection onPick={(r) => setRole(r)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <StepHeader step={step} role={role} onRestart={startOver} score={score} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          {step === 0 && (
            <FinancialDashboard
              role={role}
              emp={emp}
              setEmp={setEmp}
              biz={biz}
              setBiz={setBiz}
            />
          )}
          {step === 1 && totals && <IncomeStep role={role} emp={emp} biz={biz} totals={totals} />}
          {step === 2 && (
            <DeductionsStep
              options={allDeductions}
              picked={picked}
              feedback={feedback}
              onToggle={togglePick}
            />
          )}
          {step === 3 && totals && <TaxableStep totals={totals} />}
          {step === 4 && totals && <ResultsStep role={role} totals={totals} score={score} />}
          {step === 5 && (
            <ReflectionStep
              role={role}
              reflection={reflection}
              setReflection={setReflection}
              onRestart={startOver}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {step < 5 && (
        <div className="mt-8 flex items-center justify-between">
          <Button variant="outline" onClick={back} disabled={step === 0} className="rounded-full">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button onClick={next} className="rounded-full bg-primary text-primary-foreground hover:bg-primary-glow">
            {step === 4 ? "Reflect" : "Next"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </Shell>
  );
}

/* ------------------------------- Sub-views ------------------------------- */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-card text-primary-foreground shadow-card">
            <Calculator className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">Tax Time Challenge</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Financial literacy game
            </p>
          </div>
        </Link>
        <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-primary">
          ← Back to Bank
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
    </div>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-elevated md:p-14"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
        <Sparkles className="h-3.5 w-3.5 text-gold" /> Ages 12–16 · Financial Game
      </span>
      <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
        Tax Time <span className="text-gold">Challenge</span>
      </h1>
      <p className="mt-3 max-w-xl text-lg text-primary-foreground/85">
        Can you successfully file your own tax return? Choose your career, track your money,
        claim the right deductions, and find out if you get a refund — or owe extra.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <CharacterCard
          icon={<Briefcase className="h-6 w-6" />}
          title="Employee"
          subtitle="Earns a salary. Some tax already paid."
          color="bg-teal/20"
        />
        <CharacterCard
          icon={<Building2 className="h-6 w-6" />}
          title="Business Owner"
          subtitle="Earns revenue. Tracks expenses. Pays own tax."
          color="bg-gold/20"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          size="lg"
          onClick={onStart}
          className="rounded-full bg-gold text-navy-deep hover:bg-gold/90"
        >
          Start the Challenge <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function CharacterCard({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-primary-foreground/75">{subtitle}</p>
    </div>
  );
}

function RoleSelection({ onPick }: { onPick: (r: Exclude<Role, null>) => void }) {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold md:text-3xl">Choose your role</h2>
      <p className="mt-1 text-muted-foreground">Each path teaches different money skills.</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <RoleCard
          onClick={() => onPick("employee")}
          icon={<Briefcase className="h-7 w-7" />}
          title="Employee"
          tagline="The Salaried Worker"
          color="from-teal to-primary-glow"
          points={["Fixed monthly salary", "Tax often deducted automatically", "Side income & donations"]}
        />
        <RoleCard
          onClick={() => onPick("business")}
          icon={<Building2 className="h-7 w-7" />}
          title="Business Owner"
          tagline="The Entrepreneur"
          color="from-gold to-accent"
          points={["Revenue from customers", "Tracks every expense", "Files & pays own tax"]}
        />
      </div>
    </div>
  );
}

function RoleCard({
  onClick,
  icon,
  title,
  tagline,
  color,
  points,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  tagline: string;
  color: string;
  points: string[];
}) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-card transition-shadow hover:shadow-elevated"
    >
      <div
        className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-primary-foreground shadow-card`}
      >
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{tagline}</p>
      <h3 className="mt-1 text-2xl font-bold">{title}</h3>
      <ul className="mt-4 space-y-2">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" /> {p}
          </li>
        ))}
      </ul>
      <div className="mt-5 inline-flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
        Choose this path <ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </motion.button>
  );
}

function StepHeader({
  step,
  role,
  onRestart,
  score,
}: {
  step: number;
  role: Exclude<Role, null>;
  onRestart: () => void;
  score: number;
}) {
  const steps = ["Dashboard", "Income", "Deductions", "Taxable", "Result", "Reflect"];
  const pct = ((step + 1) / steps.length) * 100;
  return (
    <div className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {role === "employee" ? (
              <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> Employee</span>
            ) : (
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> Business Owner</span>
            )}
          </Badge>
          <span className="text-sm font-semibold text-foreground">Step {step + 1} of {steps.length}: {steps[step]}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-foreground">
            <Trophy className="h-3 w-3 text-gold" /> {score} pts
          </div>
          <Button size="sm" variant="ghost" onClick={onRestart} className="rounded-full">
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restart
          </Button>
        </div>
      </div>
      <Progress value={pct} className="mt-3 h-2" />
    </div>
  );
}

/* --------------------------- Step 0 — Dashboard -------------------------- */

function FinancialDashboard({
  role,
  emp,
  setEmp,
  biz,
  setBiz,
}: {
  role: Exclude<Role, null>;
  emp: EmployeeData;
  setEmp: (e: EmployeeData) => void;
  biz: BusinessData;
  setBiz: (b: BusinessData) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="mb-3 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-teal" />
          <h3 className="text-lg font-bold">Your finances this year</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Tweak your numbers to see how the tax outcome changes.
        </p>

        <div className="mt-5 space-y-5">
          {role === "employee" ? (
            <>
              <ValueRow label="Salary" value={emp.salary} max={120000} step={500} onChange={(v) => setEmp({ ...emp, salary: v })} />
              <ValueRow label="Tax already paid" value={emp.taxPaid} max={20000} step={100} onChange={(v) => setEmp({ ...emp, taxPaid: v })} />
              <ValueRow label="Savings interest" value={emp.savingsInterest} max={5000} step={50} onChange={(v) => setEmp({ ...emp, savingsInterest: v })} />
              <ValueRow label="Charity donation" value={emp.charity} max={5000} step={50} onChange={(v) => setEmp({ ...emp, charity: v })} />
            </>
          ) : (
            <>
              <ValueRow label="Revenue (sales)" value={biz.revenue} max={150000} step={500} onChange={(v) => setBiz({ ...biz, revenue: v })} />
              <ValueRow label="Equipment" value={biz.equipment} max={30000} step={100} onChange={(v) => setBiz({ ...biz, equipment: v })} />
              <ValueRow label="Marketing" value={biz.marketing} max={20000} step={100} onChange={(v) => setBiz({ ...biz, marketing: v })} />
              <ValueRow label="Supplies" value={biz.supplies} max={10000} step={50} onChange={(v) => setBiz({ ...biz, supplies: v })} />
              <ValueRow label="Savings interest" value={biz.savingsInterest} max={5000} step={50} onChange={(v) => setBiz({ ...biz, savingsInterest: v })} />
            </>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-card p-6 text-primary-foreground shadow-elevated">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
            {role === "employee" ? "Total income" : "Total revenue"}
          </p>
          <p className="mt-1 text-4xl font-bold">
            {role === "employee" ? fmt(emp.salary + emp.savingsInterest) : fmt(biz.revenue + biz.savingsInterest)}
          </p>
          <p className="mt-3 text-sm text-primary-foreground/80">
            {role === "employee"
              ? "Salary + savings interest. Some tax was withheld from each paycheck."
              : "Revenue is everything you earned — but it's not your profit yet!"}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-gold" />
            <h4 className="font-semibold">Did you know?</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {role === "employee"
              ? "Employees often have tax taken out of every paycheck. At the end of the year you check if too much (refund) or too little (bill) was paid."
              : "Business owners pay tax on profit, not on revenue. Profit = Revenue − Allowable expenses."}
          </p>
        </div>
      </div>
    </div>
  );
}

function ValueRow({
  label,
  value,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="h-8 w-28 text-right text-sm"
        />
      </div>
      <Slider
        className="mt-2"
        value={[value]}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

/* ----------------------------- Step 1 — Income --------------------------- */

function IncomeStep({
  role,
  emp,
  biz,
  totals,
}: {
  role: Exclude<Role, null>;
  emp: EmployeeData;
  biz: BusinessData;
  totals: { totalIncome: number };
}) {
  const data =
    role === "employee"
      ? [
          { name: "Salary", value: emp.salary, fill: "hsl(var(--teal))" },
          { name: "Savings Interest", value: emp.savingsInterest, fill: "hsl(var(--gold))" },
        ]
      : [
          { name: "Revenue", value: biz.revenue, fill: "hsl(var(--teal))" },
          { name: "Savings Interest", value: biz.savingsInterest, fill: "hsl(var(--gold))" },
        ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-lg font-bold">Step 1 · Record your income</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add up everything you earned this year — from work and from savings.
        </p>
        <ul className="mt-5 space-y-3">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
              <span className="text-sm font-medium">{d.name}</span>
              <span className="font-bold">{fmt(d.value)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-sm font-bold">Total income</span>
            <span className="text-lg font-bold">{fmt(totals.totalIncome)}</span>
          </li>
        </ul>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h4 className="mb-2 font-semibold">Income breakdown</h4>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Legend />
            <RTooltip formatter={(v: number) => fmt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --------------------------- Step 2 — Deductions ------------------------- */

function DeductionsStep({
  options,
  picked,
  feedback,
  onToggle,
}: {
  options: DeductionOption[];
  picked: Record<string, boolean>;
  feedback: Record<string, "ok" | "bad">;
  onToggle: (d: DeductionOption) => void;
}) {
  return (
    <div>
      <div className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-card">
        <h3 className="text-lg font-bold">Step 2 · Claim your deductions</h3>
        <p className="mt-1 text-sm text-primary-foreground/85">
          Tap the items you think you can legally claim. Watch out — some are personal spending in disguise!
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((d) => {
          const sel = !!picked[d.id];
          const fb = feedback[d.id];
          return (
            <motion.button
              key={d.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onToggle(d)}
              className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                sel
                  ? "border-teal bg-teal-soft shadow-card"
                  : "border-border bg-card hover:border-teal/60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">{d.emoji}</div>
                {sel && <CheckCircle2 className="h-5 w-5 text-teal" />}
              </div>
              <p className="mt-2 font-semibold">{d.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.hint}</p>

              <AnimatePresence>
                {fb && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold text-white ${
                      fb === "ok" ? "bg-success" : "bg-destructive"
                    }`}
                  >
                    {fb === "ok" ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> +10 pts
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> Not deductible · −5
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* --------------------------- Step 3 — Taxable income --------------------- */

function TaxableStep({
  totals,
}: {
  totals: {
    totalIncome: number;
    deductions: number;
    taxable: number;
    breakdown: { band: string; amount: number; rate: number; tax: number }[];
  };
}) {
  const bracketData = totals.breakdown.map((b) => ({
    name: `${b.band} · ${b.rate}%`,
    Amount: b.amount,
    Tax: b.tax,
  }));
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-lg font-bold">Step 3 · Calculate taxable income</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Taxable Income = Total Income − Allowable Deductions
        </p>
        <div className="mt-5 space-y-3">
          <Row label="Total income" value={fmt(totals.totalIncome)} />
          <Row label="− Deductions" value={`− ${fmt(totals.deductions)}`} negative />
          <div className="rounded-2xl bg-gradient-card p-4 text-primary-foreground">
            <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Taxable income</p>
            <p className="mt-1 text-3xl font-bold">{fmt(totals.taxable)}</p>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <h4 className="mb-3 font-semibold">Tax bracket visualizer</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={bracketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <RTooltip formatter={(v: number) => fmt(v)} />
            <Legend />
            <Bar dataKey="Amount" fill="hsl(var(--teal))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Tax" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-muted-foreground">
          0% on first $10k · 10% on next $30k · 20% above $40k
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className={`font-bold ${negative ? "text-destructive" : ""}`}>{value}</span>
    </div>
  );
}

/* ----------------------------- Step 4 — Results -------------------------- */

function ResultsStep({
  role,
  totals,
  score,
}: {
  role: Exclude<Role, null>;
  totals: {
    totalIncome: number;
    deductions: number;
    taxable: number;
    owed: number;
    taxPaid: number;
    net: number;
  };
  score: number;
}) {
  const refund = role === "employee" && totals.net < 0;
  const earnedBadge = score >= 30;

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="md:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-lg font-bold">Your tax return</h3>
        <p className="mt-1 text-sm text-muted-foreground">Here's how the year shakes out.</p>
        <div className="mt-5 space-y-2">
          <Row label="Total income" value={fmt(totals.totalIncome)} />
          <Row label="Deductions" value={fmt(totals.deductions)} />
          <Row label="Taxable income" value={fmt(totals.taxable)} />
          <Row label="Tax owed" value={fmt(totals.owed)} />
          {role === "employee" && <Row label="Tax already paid" value={fmt(totals.taxPaid)} />}
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mt-5 rounded-2xl p-5 text-center text-primary-foreground shadow-elevated ${
            refund ? "bg-success" : "bg-gradient-card"
          }`}
        >
          <p className="text-xs uppercase tracking-wider opacity-80">
            {refund ? "🎉 Refund coming your way" : "Amount to pay"}
          </p>
          <p className="mt-1 text-4xl font-bold">{fmt(Math.abs(totals.net))}</p>
          <p className="mt-2 text-sm opacity-90">
            {refund
              ? "You overpaid through the year — the tax office sends this back."
              : role === "employee"
              ? "You underpaid through the year — settle up with the tax office."
              : "As a business owner, you pay this directly to the tax office."}
          </p>
        </motion.div>
      </div>

      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-gold p-6 text-navy-deep shadow-card">
          <Trophy className="h-7 w-7" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider">Your score</p>
          <p className="text-3xl font-bold">{score} pts</p>
          <p className="mt-1 text-sm">+10 for valid claims, −5 for wrong ones.</p>
        </div>

        <div className={`rounded-3xl border border-border bg-card p-6 shadow-card ${earnedBadge ? "" : "opacity-70"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">{earnedBadge ? "Tax Expert 🏅" : "Keep going!"}</p>
              <p className="text-xs text-muted-foreground">
                {earnedBadge ? "You filed accurately. Both career paths unlocked." : "Score 30+ to unlock the Tax Expert badge."}
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" /> Print certificate
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------- Step 5 — Reflection ------------------------ */

function ReflectionStep({
  role,
  reflection,
  setReflection,
  onRestart,
}: {
  role: Exclude<Role, null>;
  reflection: { easier: string; responsibility: string; surprised: string };
  setReflection: (r: { easier: string; responsibility: string; surprised: string }) => void;
  onRestart: () => void;
}) {
  const otherRole = role === "employee" ? "business" : "employee";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-teal" />
          <h3 className="text-lg font-bold">Reflection time</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Thinking back over the challenge helps the lessons stick.
        </p>
        <div className="mt-5 space-y-4">
          <Question
            label="Which role felt easier — employee or business owner?"
            value={reflection.easier}
            onChange={(v) => setReflection({ ...reflection, easier: v })}
          />
          <Question
            label="Who do you think had more responsibility?"
            value={reflection.responsibility}
            onChange={(v) => setReflection({ ...reflection, responsibility: v })}
          />
          <Question
            label="What surprised you most about taxes?"
            value={reflection.surprised}
            onChange={(v) => setReflection({ ...reflection, surprised: v })}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated">
          <Sparkles className="h-6 w-6 text-gold" />
          <h4 className="mt-2 text-lg font-bold">Your personalised feedback</h4>
          <p className="mt-2 text-sm text-primary-foreground/85">
            {role === "employee"
              ? "As an employee, much of your tax is handled for you — but you still have to check it. Knowing your deductions can mean a bigger refund."
              : "As a business owner you have more freedom — and more paperwork. Tracking every expense is what turns revenue into smart profit."}
          </p>
          <p className="mt-3 text-sm text-primary-foreground/85">
            Try the <strong className="text-gold">{otherRole === "employee" ? "Employee" : "Business Owner"}</strong> path
            next to compare both worlds!
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
          <h4 className="font-semibold">Key takeaways</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Income is what you receive; profit is what's left after expenses.</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Only real, work-related costs count as deductions.</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Tax brackets mean different slices of money are taxed at different rates.</li>
            <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> A refund means you overpaid; a bill means you underpaid.</li>
          </ul>
        </div>

        <Button onClick={onRestart} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary-glow">
          <RotateCcw className="mr-2 h-4 w-4" /> Try the other role
        </Button>
      </div>
    </div>
  );
}

function Question({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="Type your thoughts…"
      />
    </div>
  );
}