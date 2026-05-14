import { useEffect, useState } from "react";

export type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number; // negative = debit, positive = credit
};

export type SavingsPot = {
  id: string;
  name: string;
  emoji: string;
  target: number;
  saved: number;
  monthly: number;
};

export type Payee = {
  id: string;
  name: string;
  sortCode: string;
  accountNumber: string;
};

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  earnedAt: string;
};

export type AccountType = "teen" | "junior" | "student";

export type BankState = {
  onboarded: boolean;
  fullName: string;
  email: string;
  mobile: string;
  postcode: string;
  accountType: AccountType;
  sortCode: string;
  accountNumber: string;
  customerNumber: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  balance: number;
  pots: SavingsPot[];
  transactions: Transaction[];
  payees: Payee[];
  badges: Badge[];
  xp: number;
  scamsSpotted: number;
};

const STORAGE_KEY = "uk-bank-sim-v1";

export const initialState: BankState = {
  onboarded: false,
  fullName: "",
  email: "",
  mobile: "",
  postcode: "",
  accountType: "teen",
  sortCode: "",
  accountNumber: "",
  customerNumber: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  balance: 0,
  pots: [],
  transactions: [],
  payees: [
    { id: "p1", name: "Mum", sortCode: "20-45-67", accountNumber: "11223344" },
    { id: "p2", name: "Best Friend", sortCode: "30-12-89", accountNumber: "55667788" },
  ],
  badges: [],
  xp: 0,
  scamsSpotted: 0,
};

export function generateAccountDetails() {
  const sortCode = `${rand(2)}-${rand(2)}-${rand(2)}`;
  const accountNumber = rand(8);
  const customerNumber = rand(10);
  const cardNumber = `${rand(4)} ${rand(4)} ${rand(4)} ${rand(4)}`;
  const year = (new Date().getFullYear() + 4).toString().slice(-2);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const cardExpiry = `${month}/${year}`;
  const cardCvv = rand(3);
  return { sortCode, accountNumber, customerNumber, cardNumber, cardExpiry, cardCvv };
}

function rand(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export function loadState(): BankState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
}

export function saveState(s: BankState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

// Simple subscription pattern across hook instances
const listeners = new Set<() => void>();
let memory: BankState = loadState();

export function useBank() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const setState = (updater: (s: BankState) => BankState) => {
    memory = updater(memory);
    saveState(memory);
    listeners.forEach((l) => l());
  };

  return {
    state: memory,
    setState,
    addTransaction: (t: Omit<Transaction, "id" | "date">) => {
      setState((s) => {
        const tx: Transaction = {
          ...t,
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
        };
        return {
          ...s,
          balance: +(s.balance + t.amount).toFixed(2),
          transactions: [tx, ...s.transactions],
        };
      });
    },
    awardBadge: (name: string, emoji: string) => {
      setState((s) => {
        if (s.badges.some((b) => b.name === name)) return s;
        return {
          ...s,
          xp: s.xp + 50,
          badges: [
            ...s.badges,
            { id: crypto.randomUUID(), name, emoji, earnedAt: new Date().toISOString() },
          ],
        };
      });
    },
    addXp: (n: number) => setState((s) => ({ ...s, xp: s.xp + n })),
  };
}

export function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}