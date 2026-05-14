import { motion } from "framer-motion";
import { Wifi } from "lucide-react";

type Props = {
  name: string;
  number: string;
  expiry: string;
  variant?: "primary" | "gold";
};

export function BankCard({ name, number, expiry, variant = "primary" }: Props) {
  return (
    <motion.div
      initial={{ rotateY: -15, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      whileHover={{ y: -4, rotateX: 4, rotateY: -4 }}
      className={`relative aspect-[1.586/1] w-full max-w-sm rounded-3xl p-6 text-primary-foreground shadow-elevated overflow-hidden ${
        variant === "gold" ? "gold-chip text-navy-deep" : "bank-card"
      }`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-teal/30 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">My First Bank</p>
            <p className="mt-1 text-sm font-semibold">UK Current Account</p>
          </div>
          <Wifi className="h-6 w-6 rotate-90 opacity-90" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-12 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 shadow-inner" />
          <p className="font-mono text-lg tracking-[0.2em]">{number || "•••• •••• •••• ••••"}</p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Card Holder</p>
            <p className="text-sm font-medium uppercase">{name || "Your Name"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-70">Expires</p>
            <p className="text-sm font-medium">{expiry || "MM/YY"}</p>
          </div>
          <p className="text-lg font-bold italic">VISA</p>
        </div>
      </div>
    </motion.div>
  );
}