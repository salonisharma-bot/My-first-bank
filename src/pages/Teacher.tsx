import { Link } from "react-router-dom";
import { ArrowLeft, Users, Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBank } from "@/lib/bank-store";

export default function Teacher() {
  const { state } = useBank();
  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <h1 className="text-3xl font-bold">Teacher portal</h1>
        <p className="mt-1 text-muted-foreground">Track learner progress in your classroom.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat icon={Users} label="Active learner" value="1" />
          <Stat icon={Award} label="Badges earned" value={String(state.badges.length)} />
          <Stat icon={Award} label="Total XP" value={String(state.xp)} />
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Learner: {state.fullName || "Not started"}</h2>
            <Button variant="outline" size="sm" className="rounded-full"><Download className="mr-1 h-3.5 w-3.5" />Export</Button>
          </div>
          <ul className="divide-y divide-border text-sm">
            <Row label="Account opened" value={state.onboarded ? "✓" : "—"} />
            <Row label="Transactions made" value={String(state.transactions.length)} />
            <Row label="Savings pots" value={String(state.pots.length)} />
            <Row label="Scams spotted" value={`${state.scamsSpotted}/4`} />
            <Row label="Badges" value={state.badges.map((b) => b.emoji).join(" ") || "—"} />
          </ul>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">In a full classroom version, this aggregates across all students.</p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <Icon className="h-5 w-5 text-teal" />
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}