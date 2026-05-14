import { Info } from "lucide-react";
import { useState } from "react";

export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-teal-soft text-teal transition-colors hover:bg-teal hover:text-white"
        aria-label="More info"
      >
        <Info className="h-3 w-3" />
      </button>
      {open && (
        <span className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-xl bg-primary p-3 text-xs leading-snug text-primary-foreground shadow-elevated animate-scale-in">
          {text}
        </span>
      )}
    </span>
  );
}