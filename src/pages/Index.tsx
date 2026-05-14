import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, GraduationCap, Smartphone, PiggyBank, Trophy } from "lucide-react";
import { BankCard } from "@/components/BankCard";
import { Button } from "@/components/ui/button";
import { useBank } from "@/lib/bank-store";

const features = [
  { icon: Smartphone, title: "Real UK banking flow", text: "Sort codes, account numbers and Faster Payments — just like the real thing." },
  { icon: PiggyBank, title: "Savings pots & goals", text: "Save for a bike, console or holiday with progress trackers." },
  { icon: ShieldCheck, title: "Spot the scams", text: "Practise spotting HMRC, phishing and parcel scams safely." },
  { icon: Trophy, title: "Earn badges & XP", text: "Complete missions and level up your money confidence." },
];

const Index = () => {
  const { state } = useBank();

  return (
    <div className="min-h-screen bg-gradient-soft text-foreground">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-card text-primary-foreground shadow-card">
            <span className="text-base font-bold">£</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold">My First Bank</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">UK Simulator</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-primary">Features</a>
          <a href="#learn" className="hover:text-primary">What you'll learn</a>
          <Link to="/teacher" className="hover:text-primary">For teachers</Link>
        </nav>
        <Link to={state.onboarded ? "/dashboard" : "/register"}>
          <Button size="sm" className="rounded-full">
            {state.onboarded ? "Open dashboard" : "Get started"}
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-hero opacity-[0.04]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 md:grid-cols-2 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal">
              <Sparkles className="h-3.5 w-3.5" /> Ages 12–16 · UK Edition
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Open Your First <span className="bg-gradient-card bg-clip-text text-transparent">UK Bank Account</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Learn how real banking works in the UK — from sort codes to Faster Payments — in a safe, simulated environment built for teens.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={state.onboarded ? "/dashboard" : "/register"}>
                <Button size="lg" className="group rounded-full bg-primary text-primary-foreground hover:bg-primary-glow">
                  {state.onboarded ? "Continue banking" : "Open my account"}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="rounded-full">
                  Explore features
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Mock data only</div>
              <div className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-teal" /> Classroom ready</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 -z-10 mx-auto h-72 w-72 rounded-full bg-teal/30 blur-3xl" />
            <div className="animate-float">
              <BankCard name="Alex Taylor" number="4242 1234 5678 9010" expiry="08/29" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to start banking with confidence</h2>
          <p className="mt-3 text-muted-foreground">Practise the real skills before you walk into a real branch.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Learning outcomes */}
      <section id="learn" className="mx-auto max-w-6xl px-4 py-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground md:p-14">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">By the end, you'll know how to…</h2>
              <p className="mt-3 max-w-md text-primary-foreground/80">Real-world UK banking skills, taught through interactive missions.</p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                "Open a UK current account",
                "Send money via Faster Payments",
                "Set up a savings pot",
                "Read a bank statement",
                "Spot common UK scams",
                "Use Two-Factor Authentication",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm">
                  <span className="text-gold">✓</span> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Educational simulator. No real money is moved. © My First Bank UK.
      </footer>
    </div>
  );
};

export default Index;
