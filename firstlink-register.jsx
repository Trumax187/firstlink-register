import React, { useState, useMemo } from "react";

/* ------------------------------------------------------------------
   PLEDGE BOOK — collateral loan register (prototype, slice 1)

   STORAGE ADAPTER
   All reads/writes go through the `db` object below. Right now it is
   plain React state seeded with demo records. To persist on GitHub
   Pages, replace the two functions in `useStore` with localStorage
   reads/writes. To move to Flask/Postgres later, replace them with
   fetch() calls. Nothing else in this file changes.

   NOT IN THIS SLICE (deliberately): dashboard, printable agreement,
   receipts, PIN lock, notifications.
------------------------------------------------------------------ */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@600&display=swap');

.pb * { box-sizing: border-box; }
.pb {
  /* BRAND COLOURS — change these and the whole app follows. */
  --ink:#1B3A6B;        /* navy: header, nav, primary buttons */
  --ink-2:#2A4E85;      /* lighter navy: tab bar */
  --paper:#FFFFFF;      /* white background */
  --surface:#fff;
  --line:#D9E0EC; --muted:#6B7280;
  --brass:#B8860B;      /* FirstLink gold accent */
  --brass-soft:#F5EBD0;
  --ok:#2E7D6B; --late:#C0392B; --done:#6B7280;
  font-family:'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
  font-feature-settings:'tnum' 1;
  color:var(--ink); background:var(--paper); min-height:100vh;
}
.pb-top { background:var(--ink); color:#fff; padding:16px 18px; text-align:center; }
.pb-mark { font-family:'IBM Plex Serif', Georgia, serif; font-size:21px; letter-spacing:.005em; }
.pb-mark span { color:var(--brass); font-weight:600; }
.pb-sub { font-size:12px; color:#d3b8c6; margin-top:3px; letter-spacing:.02em; }
.pb-nav { display:flex; gap:2px; background:var(--ink-2); padding:0 10px; overflow-x:auto; justify-content:center; }
.pb-nav button { white-space:nowrap; }
.pb-nav button {
  background:none; border:0; color:#a9bbcd; padding:11px 14px; font:inherit;
  font-size:14px; cursor:pointer; border-bottom:2px solid transparent;
}
.pb-nav button[data-on="1"] { color:#fff; border-bottom-color:var(--brass); }
.pb-body { padding:16px; max-width:940px; margin:0 auto; }

.pb-head { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:12px; gap:10px; }
.pb-h1 { font-size:17px; font-weight:600; margin:0; }
.pb-count { font-size:13px; color:var(--muted); }

.pb-btn {
  font:inherit; font-size:14px; padding:9px 14px; border-radius:3px; cursor:pointer;
  border:1px solid var(--ink); background:var(--ink); color:#fff;
}
.pb-btn.ghost { background:none; color:var(--ink); }
.pb-btn.warn { background:none; border-color:var(--late); color:var(--late); }
.pb-btn:disabled { opacity:.4; cursor:not-allowed; }
.pb-btn.sm { padding:6px 10px; font-size:13px; }

.pb-card { background:var(--surface); border:1px solid var(--line); border-radius:3px; }
.pb-row {
  display:block; width:100%; text-align:left; background:var(--surface);
  border:0; border-bottom:1px solid var(--line); padding:13px 14px; font:inherit;
  cursor:pointer;
}
.pb-row:last-child { border-bottom:0; }
.pb-row:hover { background:#F8FAFC; }
.pb-row-top { display:flex; justify-content:space-between; gap:10px; align-items:center; }
.pb-name { font-weight:500; font-size:15px; }
.pb-meta { font-size:13px; color:var(--muted); margin-top:3px; }
.pb-amt { font-weight:600; font-size:15px; white-space:nowrap; }

.pb-chip { font-size:11.5px; padding:3px 8px; border-radius:2px; white-space:nowrap; }
.pb-chip[data-s="active"] { background:#E3F0EC; color:var(--ok); }
.pb-chip[data-s="overdue"] { background:#FBE4E1; color:var(--late); }
.pb-chip[data-s="cleared"] { background:#F0E7EE; color:var(--done); }
.pb-chip[data-s="forfeited"] { background:var(--ink); color:#fff; }
.pb-chip[data-s="held"] { background:var(--brass-soft); color:var(--brass); }
.pb-chip[data-s="released"] { background:#F0E7EE; color:var(--done); }

.pb-block { margin-bottom:18px; }
.pb-block > h3 {
  font-size:13px; font-weight:600; color:var(--muted); margin:0 0 7px;
}
.pb-kv { display:flex; justify-content:space-between; padding:9px 14px; border-bottom:1px solid var(--line); font-size:14px; }
.pb-kv:last-child { border-bottom:0; }
.pb-kv span:first-child { color:var(--muted); }
.pb-kv.total { background:#F8FAFC; font-weight:600; }
.pb-kv.total span:first-child { color:var(--ink); }

.pb-line { padding:10px 14px; border-bottom:1px solid var(--line); font-size:13.5px; display:flex; justify-content:space-between; gap:10px; }
.pb-line:last-child { border-bottom:0; }
.pb-line em { font-style:normal; color:var(--muted); display:block; font-size:12.5px; margin-top:2px; }

.pb-field { margin-bottom:12px; }
.pb-field label { display:block; font-size:13px; color:var(--muted); margin-bottom:4px; }
.pb-field input, .pb-field select {
  width:100%; font:inherit; font-size:15px; padding:9px 10px;
  border:1px solid var(--line); border-radius:3px; background:#fff; color:var(--ink);
}
.pb-field input:focus, .pb-field select:focus { outline:2px solid var(--brass); outline-offset:-1px; }
.pb-two { display:flex; gap:10px; }
.pb-two > * { flex:1; }
.pb-modal { position:fixed; inset:0; background:rgba(58,30,63,.55); display:flex;
  align-items:center; justify-content:center; padding:20px; z-index:50; }
.pb-modal-card { background:#fff; border-radius:4px; padding:18px; max-width:380px; width:100%; }
.pb-modal-msg { margin:0 0 14px; font-size:15px; line-height:1.5; }
.pb-fixed { font-size:15px; padding:9px 0; }
.pb-x { border:1px solid var(--line); background:#fff; color:var(--muted); font:inherit; font-size:15px;
  line-height:1; width:26px; height:26px; border-radius:3px; cursor:pointer; }
.pb-x:hover { border-color:var(--late); color:var(--late); }
.pb-note { font-size:12.5px; color:var(--muted); line-height:1.5; margin:8px 0 0; }

.pb-back { background:none; border:0; font:inherit; font-size:13.5px; color:var(--muted); cursor:pointer; padding:0 0 10px; }
.pb-empty { padding:26px 16px; text-align:center; color:var(--muted); font-size:14px; }
.pb-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
.pb-late { color:var(--late); }
.pb-strip { display:flex; gap:10px; margin-bottom:18px; }
.pb-strip > div { flex:1; background:var(--surface); border:1px solid var(--line); border-radius:3px; padding:11px 13px; }
.pb-strip b { display:block; font-size:19px; font-weight:600; margin-bottom:2px; }
.pb-strip span { font-size:12.5px; color:var(--muted); }
.pb-strip > div[data-alarm="1"] b { color:var(--late); }
.pb-ledger { width:100%; border-collapse:collapse; font-size:13.5px; }
.pb-ledger th { text-align:left; font-weight:600; color:var(--muted); font-size:12.5px; padding:9px 12px; border-bottom:1px solid var(--line); }
.pb-ledger td { padding:10px 12px; border-bottom:1px solid var(--line); vertical-align:top; }
.pb-ledger tr:last-child td { border-bottom:0; }
.pb-ledger td.n, .pb-ledger th.n { text-align:right; white-space:nowrap; }
.pb-ledger em { font-style:normal; color:var(--muted); display:block; font-size:12.5px; margin-top:2px; }
.pb-out { color:var(--late); }
.pb-in { color:var(--ok); }
.pb-months { display:flex; gap:6px; overflow-x:auto; margin-bottom:14px; padding-bottom:2px; }
.pb-months button { font:inherit; font-size:13px; white-space:nowrap; padding:7px 11px; border:1px solid var(--line); background:#fff; color:var(--muted); border-radius:3px; cursor:pointer; }
.pb-months button[data-on="1"] { background:var(--ink); border-color:var(--ink); color:#fff; }
.pb-sec { margin-bottom:18px; }
.pb-sec > h3 { font-size:13px; font-weight:600; color:var(--muted); margin:0 0 7px; display:flex; justify-content:space-between; }
.pb-flag { font-size:11.5px; color:var(--late); margin-top:4px; }
@media (max-width:520px){ .pb-two { display:block; } .pb-two > * { margin-bottom:12px; } }
`;

/* ---------- helpers ---------- */

const K = (n) =>
  "K" + Number(n || 0).toLocaleString("en-ZM", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TODAY = new Date("2026-09-15T00:00:00");

const d = (s) => new Date(s + "T00:00:00");
const iso = (dt) => dt.toISOString().slice(0, 10);
const fmtDate = (s) =>
  d(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const addDays = (s, n) => {
  const x = d(s);
  x.setDate(x.getDate() + n);
  return iso(x);
};
const daysBetween = (a, b) => Math.round((d(b) - d(a)) / 86400000);

const normNrc = (v) => (v || "").replace(/[^0-9]/g, "");
const fmtNrc = (v) => {
  const n = normNrc(v);
  if (n.length !== 9) return v || "not recorded";
  return n.slice(0, 6) + "/" + n.slice(6, 8) + "/" + n.slice(8);
};
const sameNrc = (a, b) => normNrc(a).length === 9 && normNrc(a) === normNrc(b);

const uid = (p) => p + "-" + Math.random().toString(36).slice(2, 8);

/* ---------- settings ----------
   Placeholder until she confirms. Change this one number and the
   dashboard, the flags and the forfeit button all follow.        */

const SETTINGS = { forfeitAfterDays: 7 };

/* ---------- seed data ---------- */

const SEED = {
  borrowers: [
    { id: "b1", name: "Grace Zulu", phone: "0977 214 880", nrc: "284119/61/1", area: "Chelston" },
    { id: "b2", name: "Patrick Banda", phone: "0966 703 119", nrc: "175420/11/8", area: "Matero" },
    { id: "b3", name: "Naomi Phiri", phone: "0955 410 275", nrc: "392077/23/4", area: "Kabwata" },
  ],
  items: [
    { id: "c1", borrowerId: "b1", desc: "Samsung Galaxy A34, 128GB", condition: "Good, minor screen scratch", value: 3200, location: "Safe A, shelf 2", status: "held" },
    { id: "c2", borrowerId: "b2", desc: "Gold chain, 18ct, 12g", condition: "Good", value: 9500, location: "Safe A, box 1", status: "held" },
    { id: "c3", borrowerId: "b3", desc: "Hisense 43\" TV", condition: "Working, no remote", value: 2400, location: "Store room", status: "released" },
    { id: "c4", borrowerId: "b1", desc: "Dell Latitude 5420 laptop", condition: "Good, charger included", value: 6000, location: "Safe B, shelf 1", status: "held" },
    { id: "c5", borrowerId: "b3", desc: "Honda GX160 water pump", condition: "Working, serviced", value: 4100, location: "Store room", status: "held" },
  ],
  loans: [
    {
      id: "l1", borrowerId: "b1", itemId: "c1", principal: 1500,
      interest: { mode: "percent", value: 20, periodDays: 30 },
      issuedOn: "2026-08-20", dueOn: "2026-09-19", status: "active", renewals: 0,
      charges: [{ id: "ch1", kind: "initial", amount: 300, on: "2026-08-20", note: "20% of K1,500.00, 30 days" }],
      repayments: [{ id: "r1", amount: 500, on: "2026-09-05", method: "Cash" }],
    },
    {
      id: "l2", borrowerId: "b2", itemId: "c2", principal: 5000,
      interest: { mode: "percent", value: 15, periodDays: 30 },
      issuedOn: "2026-07-10", dueOn: "2026-09-08", status: "active", renewals: 1,
      charges: [
        { id: "ch2", kind: "initial", amount: 750, on: "2026-07-10", note: "15% of K5,000.00, 30 days" },
        { id: "ch3", kind: "renewal", amount: 750, on: "2026-08-09", note: "Renewal 1 — 15% of K5,000.00, 30 days" },
      ],
      repayments: [],
    },
    {
      id: "l3", borrowerId: "b3", itemId: "c3", principal: 800,
      interest: { mode: "fixed", value: 200, periodDays: 30 },
      issuedOn: "2026-06-15", dueOn: "2026-07-15", status: "cleared", renewals: 0,
      charges: [{ id: "ch4", kind: "initial", amount: 200, on: "2026-06-15", note: "Flat K200.00, 30 days" }],
      repayments: [{ id: "r2", amount: 1000, on: "2026-07-12", method: "Mobile money" }],
    },
    {
      id: "l4", borrowerId: "b3", itemId: "c5", principal: 2000,
      interest: { mode: "percent", value: 20, periodDays: 30 },
      issuedOn: "2026-08-16", dueOn: "2026-09-15", status: "active", renewals: 0,
      charges: [{ id: "ch5", kind: "initial", amount: 400, on: "2026-08-16", note: "20% of K2,000.00, 30 days" }],
      repayments: [],
    },
  ],
  events: [
    { id: "e1", loanId: "l3", at: "2026-06-15 09:12", text: "Loan issued — K800.00 against Hisense 43\" TV" },
    { id: "e8", loanId: "l4", at: "2026-08-16 11:20", text: "Loan issued — K2,000.00 against Honda GX160 water pump" },
    { id: "e2", loanId: "l3", at: "2026-07-12 14:40", text: "Repayment K1,000.00 (Mobile money)" },
    { id: "e3", loanId: "l3", at: "2026-07-12 14:41", text: "Loan cleared. Collateral released to borrower" },
    { id: "e4", loanId: "l1", at: "2026-08-20 10:05", text: "Loan issued — K1,500.00 against Samsung Galaxy A34" },
    { id: "e5", loanId: "l1", at: "2026-09-05 11:30", text: "Repayment K500.00 (Cash)" },
    { id: "e6", loanId: "l2", at: "2026-07-10 08:50", text: "Loan issued — K5,000.00 against gold chain, 18ct" },
    { id: "e7", loanId: "l2", at: "2026-08-09 16:02", text: "Renewed 30 days. Interest charge K750.00 added. Principal unchanged" },
  ],
};

/* ---------- loan maths ---------- */

const chargesTotal = (l) => l.charges.reduce((s, c) => s + c.amount, 0);
const paidTotal = (l) => l.repayments.reduce((s, r) => s + r.amount, 0);
const owing = (l) => l.principal + chargesTotal(l) - paidTotal(l);

const nextCharge = (l) =>
  l.interest.mode === "percent" ? Math.round(l.principal * l.interest.value) / 100 : l.interest.value;

const chargeNote = (l, kind, n) =>
  (l.interest.mode === "percent"
    ? l.interest.value + "% of " + K(l.principal)
    : "Flat " + K(l.interest.value)) +
  ", " + l.interest.periodDays + " days" +
  (kind === "renewal" ? " — renewal " + n : "");

const terms = (l) =>
  (l.interest.mode === "percent" ? l.interest.value + "% per " : K(l.interest.value) + " per ") +
  l.interest.periodDays + " days";

function statusOf(l) {
  if (l.status === "cleared" || l.status === "forfeited") return l.status;
  if (owing(l) <= 0) return "cleared";
  return daysBetween(l.dueOn, iso(TODAY)) > 0 ? "overdue" : "active";
}
const daysLate = (l) => Math.max(0, daysBetween(l.dueOn, iso(TODAY)));
const canForfeit = (l) => daysLate(l) >= SETTINGS.forfeitAfterDays;
const graceLeft = (l) => SETTINGS.forfeitAfterDays - daysLate(l);

/* ---------- store ---------- */

const EMPTY = { borrowers: [], items: [], loans: [], events: [] };
const STORE_KEY = "pledgebook.v1";

// Saves to the browser so nothing is lost on refresh. When the Flask
// backend arrives, these two functions become fetch() calls.
function loadStore() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch (e) {
    return SEED;
  }
}
function saveStore(s) {
  try { window.localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
}

function useStore() {
  const [state, setState] = useState(loadStore);
  const write = (updater) => setState((s) => { const next = updater(s); saveStore(next); return next; });
  return [state, write];
}

/* ---------- app ---------- */

export default function PledgeBook() {
  const [db, write] = useStore();
  const [tab, setTab] = useState("today");
  const [screen, setScreen] = useState(null);   // {kind:"loan"|"borrower", id}
  const [form, setForm] = useState(null);       // {kind:"borrower"|"item"|"loan", prefill}
  const [ask, setAsk] = useState(null);         // {msg, yes, run}

  // window.confirm is blocked inside sandboxed previews, so the app asks for
  // itself rather than relying on the browser.
  const confirmThen = (msg, yes, run) => setAsk({ msg, yes, run });

  const openLoan = (id) => { setForm(null); setScreen({ kind: "loan", id }); };
  const openBorrower = (id) => { setForm(null); setScreen({ kind: "borrower", id }); };
  const home = () => { setForm(null); setScreen(null); };

  const borrower = (id) => db.borrowers.find((b) => b.id === id);
  const item = (id) => db.items.find((c) => c.id === id);
  const loan = screen && screen.kind === "loan" ? db.loans.find((l) => l.id === screen.id) : null;
  const person = screen && screen.kind === "borrower" ? db.borrowers.find((b) => b.id === screen.id) : null;
  const openLoanFor = (itemId) =>
    db.loans.find((l) => l.itemId === itemId && ["active", "overdue"].includes(statusOf(l)));

  const log = (s, loanId, text) => ({
    ...s,
    events: [...s.events, { id: uid("e"), loanId, at: iso(TODAY) + " " + "09:00", text }],
  });

  const patchLoan = (s, id, fn) => ({ ...s, loans: s.loans.map((l) => (l.id === id ? fn(l) : l)) });
  const patchItem = (s, id, status) => ({ ...s, items: s.items.map((c) => (c.id === id ? { ...c, status } : c)) });

  /* actions */

  function recordRepayment(l, amount, method) {
    write((s) => {
      let next = patchLoan(s, l.id, (x) => ({
        ...x,
        repayments: [...x.repayments, { id: uid("r"), amount, on: iso(TODAY), method }],
      }));
      next = log(next, l.id, "Repayment " + K(amount) + " (" + method + ")");
      const after = owing({ ...l, repayments: [...l.repayments, { amount }] });
      if (after <= 0) {
        next = patchLoan(next, l.id, (x) => ({ ...x, status: "cleared" }));
        next = patchItem(next, l.itemId, "released");
        next = log(next, l.id, "Loan cleared. Collateral released to borrower");
      }
      return next;
    });
    setForm(null);
  }

  function renew(l) {
    const amt = nextCharge(l);
    const n = l.renewals + 1;
    write((s) => {
      let next = patchLoan(s, l.id, (x) => ({
        ...x,
        renewals: n,
        dueOn: addDays(x.dueOn, x.interest.periodDays),
        charges: [
          ...x.charges,
          { id: uid("ch"), kind: "renewal", amount: amt, on: iso(TODAY), note: chargeNote(x, "renewal", n) },
        ],
      }));
      return log(
        next, l.id,
        "Renewed " + l.interest.periodDays + " days. Interest charge " + K(amt) + " added. Principal unchanged"
      );
    });
  }

  function forfeit(l) {
    write((s) => {
      let next = patchLoan(s, l.id, (x) => ({ ...x, status: "forfeited" }));
      next = patchItem(next, l.itemId, "forfeited");
      return log(next, l.id, "Collateral forfeited after " + daysLate(l) + " days overdue. Balance " + K(owing(l)));
    });
  }

  function removeRepayment(l, r) {
    confirmThen(
      "Remove the repayment of " + K(r.amount) + " made on " + fmtDate(r.on) +
      "? The removal stays in the loan history.",
      "Remove it",
      () => write((s) => {
      let next = patchLoan(s, l.id, (x) => ({ ...x, repayments: x.repayments.filter((y) => y.id !== r.id) }));
      if (l.status === "cleared") {
        next = patchLoan(next, l.id, (x) => ({ ...x, status: "active" }));
        next = patchItem(next, l.itemId, "held");
      }
      return log(next, l.id, "Repayment " + K(r.amount) + " of " + fmtDate(r.on) + " removed — entered in error");
    }));
  }

  function removeLoan(l) {
    confirmThen("Delete this whole loan and everything in its history? This cannot be undone.", "Delete the loan", () => {
      write((s) => ({
        ...s,
        loans: s.loans.filter((x) => x.id !== l.id),
        events: s.events.filter((e) => e.loanId !== l.id),
        items: s.items.map((c) => (c.id === l.itemId && c.status !== "released" ? { ...c, status: "held" } : c)),
      }));
      setScreen({ kind: "borrower", id: l.borrowerId });
    });
  }

  function removeItem(c) {
    confirmThen("Remove " + c.desc + " from the register?", "Remove it", () =>
      write((s) => ({ ...s, items: s.items.filter((x) => x.id !== c.id) })));
  }

  function removeBorrower(b) {
    confirmThen("Remove " + b.name + " from the register?", "Remove them", () => {
      write((s) => ({ ...s, borrowers: s.borrowers.filter((x) => x.id !== b.id) }));
      setTab("borrowers");
      home();
    });
  }

  function resetTo(data, msg, yes) {
    confirmThen(msg, yes, () => { write(() => data); setTab("today"); home(); });
  }

  function addBorrower(v) {
    const id = uid("b");
    write((s) => ({ ...s, borrowers: [...s.borrowers, { id, ...v }] }));
    setForm(null);
    setScreen({ kind: "borrower", id });   // straight to their page
  }

  function addItem(v) {
    const id = uid("c");
    write((s) => ({ ...s, items: [...s.items, { id, status: "held", ...v }] }));
    setForm({ kind: "loan", prefill: { borrowerId: v.borrowerId, itemId: id } });
  }

  function addLoan(v) {
    const id = uid("l");
    const interest = { mode: v.mode, value: Number(v.value), periodDays: Number(v.periodDays) };
    const base = { id, borrowerId: v.borrowerId, itemId: v.itemId, principal: Number(v.principal), interest };
    const amt = nextCharge(base);
    const l = {
      ...base,
      issuedOn: iso(TODAY),
      dueOn: addDays(iso(TODAY), interest.periodDays),
      status: "active",
      renewals: 0,
      charges: [{ id: uid("ch"), kind: "initial", amount: amt, on: iso(TODAY), note: chargeNote(base, "initial") }],
      repayments: [],
    };
    write((s) => {
      let next = { ...s, loans: [...s.loans, l] };
      next = patchItem(next, v.itemId, "held");
      return log(next, id, "Loan issued — " + K(l.principal) + " against " + item(v.itemId).desc);
    });
    setForm(null);
    setScreen({ kind: "loan", id });
  }

  /* views */

  const sortedLoans = useMemo(() => {
    const rank = { overdue: 0, active: 1, cleared: 2, forfeited: 3 };
    return [...db.loans].sort((a, b) => {
      const ra = rank[statusOf(a)], rb = rank[statusOf(b)];
      if (ra !== rb) return ra - rb;
      return daysLate(b) - daysLate(a) || d(a.dueOn) - d(b.dueOn);
    });
  }, [db.loans]);

  return (
    <div className="pb">
      <style>{STYLES}</style>

      <div className="pb-top">
        <div className="pb-mark">FirstLink <span>PledgeBook</span></div>
        <div className="pb-sub">Collateral loan register</div>
      </div>

      <nav className="pb-nav">
        {["today", "loans", "borrowers", "collateral", "cashbook"].map((t) => (
          <button key={t} data-on={tab === t && !screen ? "1" : "0"}
            onClick={() => { setTab(t); home(); }}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {ask && (
        <div className="pb-modal" onClick={() => setAsk(null)}>
          <div className="pb-modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="pb-modal-msg">{ask.msg}</p>
            <div className="pb-actions">
              <button className="pb-btn warn" onClick={() => { ask.run(); setAsk(null); }}>{ask.yes}</button>
              <button className="pb-btn ghost" onClick={() => setAsk(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-body">
        {form && form.kind === "borrower" ? (
          <NewBorrower db={db} onCancel={() => setForm(null)} onSave={addBorrower} />
        ) : form && form.kind === "item" ? (
          <NewItem db={db} prefill={form.prefill} onCancel={() => setForm(null)} onSave={addItem} />
        ) : form && form.kind === "loan" ? (
          <NewLoan db={db} prefill={form.prefill} onCancel={() => setForm(null)} onSave={addLoan}
            onNeedItem={(bid) => setForm({ kind: "item", prefill: { borrowerId: bid } })} />
        ) : loan ? (
          <LoanDetail
            l={loan} b={borrower(loan.borrowerId)} it={item(loan.itemId)}
            events={db.events.filter((e) => e.loanId === loan.id)}
            form={form} setForm={setForm}
            onBack={() => openBorrower(loan.borrowerId)}
            onRepay={recordRepayment} onRenew={renew} onForfeit={forfeit}
            onDropRepayment={removeRepayment} onDropLoan={removeLoan}
          />
        ) : person ? (
          <BorrowerDetail
            b={person} db={db} openLoanFor={openLoanFor}
            onBack={() => { setTab("borrowers"); home(); }}
            onOpenLoan={openLoan}
            onTakeItem={() => setForm({ kind: "item", prefill: { borrowerId: person.id } })}
            onIssue={(itemId) => setForm({ kind: "loan", prefill: { borrowerId: person.id, itemId } })}
            onDropItem={removeItem} onDropBorrower={removeBorrower}
          />
        ) : tab === "today" ? (
          <Dashboard db={db} borrower={borrower} item={item} onOpen={openLoan}
            onAddBorrower={() => setForm({ kind: "borrower" })}
            onClear={() => resetTo(EMPTY,
              "Delete every borrower, item and loan and start with an empty book?", "Empty the book")}
            onRestore={() => resetTo(SEED,
              "Replace everything currently in the book with the sample records?", "Restore samples")} />
        ) : tab === "cashbook" ? (
          <Cashbook db={db} />
        ) : tab === "loans" ? (
          <>
            <div className="pb-head">
              <h2 className="pb-h1">Loans</h2>
              <button className="pb-btn" onClick={() => setForm({ kind: "loan", prefill: {} })}>Issue a loan</button>
            </div>
            <div className="pb-card">
              {sortedLoans.length === 0 && <div className="pb-empty">No loans on the book yet.</div>}
              {sortedLoans.map((l) => {
                const s = statusOf(l);
                return (
                  <button className="pb-row" key={l.id} onClick={() => openLoan(l.id)}>
                    <div className="pb-row-top">
                      <span className="pb-name">{borrower(l.borrowerId).name}</span>
                      <span className="pb-amt">{K(owing(l) > 0 ? owing(l) : 0)}</span>
                    </div>
                    <div className="pb-row-top" style={{ marginTop: 5 }}>
                      <span className="pb-meta">{item(l.itemId).desc}</span>
                      <span className="pb-chip" data-s={s}>
                        {s === "overdue" ? daysLate(l) + " days late" : s[0].toUpperCase() + s.slice(1)}
                      </span>
                    </div>
                    <div className="pb-meta">
                      Due {fmtDate(l.dueOn)}{l.renewals > 0 ? " · renewed " + l.renewals + "×" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : tab === "borrowers" ? (
          <>
            <div className="pb-head">
              <h2 className="pb-h1">Borrowers</h2>
              <button className="pb-btn" onClick={() => setForm({ kind: "borrower" })}>Add borrower</button>
            </div>
            <div className="pb-card">
              {db.borrowers.length === 0 && <div className="pb-empty">No borrowers yet.</div>}
              {db.borrowers.map((b) => {
                const open = db.loans.filter((l) => l.borrowerId === b.id && ["active", "overdue"].includes(statusOf(l)));
                const held = db.items.filter((c) => c.borrowerId === b.id && c.status === "held").length;
                return (
                  <button className="pb-row" key={b.id} onClick={() => openBorrower(b.id)}>
                    <div className="pb-row-top">
                      <span className="pb-name">{b.name}</span>
                      <span className="pb-meta">{open.length ? open.length + " open" : "no open loans"}</span>
                    </div>
                    <div className="pb-meta">{b.phone} · {b.area}</div>
                    <div className="pb-meta">NRC {fmtNrc(b.nrc)} · {held} item{held === 1 ? "" : "s"} in store</div>
                  </button>
                );
              })}
            </div>
            <p className="pb-note">Open a borrower to take in an item or issue them a loan.</p>
          </>
        ) : (
          <>
            <div className="pb-head">
              <h2 className="pb-h1">Collateral</h2>
              <button className="pb-btn" onClick={() => setForm({ kind: "item", prefill: {} })}>Take in an item</button>
            </div>
            <div className="pb-card">
              {db.items.length === 0 && <div className="pb-empty">Nothing on the register yet.</div>}
              {db.items.map((c) => {
                const ol = openLoanFor(c.id);
                return (
                  <button className="pb-row" key={c.id}
                    onClick={() => ol
                      ? openLoan(ol.id)
                      : c.status === "forfeited"
                      ? openBorrower(c.borrowerId)
                      : setForm({ kind: "loan", prefill: { borrowerId: c.borrowerId, itemId: c.id } })}>
                    <div className="pb-row-top">
                      <span className="pb-name">{c.desc}</span>
                      <span className="pb-chip" data-s={c.status === "forfeited" ? "forfeited" : c.status}>
                        {c.status === "held" ? (ol ? "On loan" : "In store") : c.status[0].toUpperCase() + c.status.slice(1)}
                      </span>
                    </div>
                    <div className="pb-meta">{borrower(c.borrowerId).name} · valued {K(c.value)}</div>
                    <div className="pb-meta">{c.condition} · {c.location}</div>
                    <div className="pb-meta">
                      {ol ? "Open the loan" : c.status === "forfeited" ? "Forfeited" : "Free — tap to lend against it"}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="pb-note">
              An item stays on the register after a loan closes, so the same TV pledged three times keeps one history.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- borrower detail ---------- */

function BorrowerDetail({ b, db, openLoanFor, onBack, onOpenLoan, onTakeItem, onIssue, onDropItem, onDropBorrower }) {
  const items = db.items.filter((c) => c.borrowerId === b.id);
  const loans = db.loans.filter((l) => l.borrowerId === b.id);
  const free = items.filter((c) => c.status !== "forfeited" && !openLoanFor(c.id));

  return (
    <>
      <button className="pb-back" onClick={onBack}>← All borrowers</button>
      <div className="pb-head">
        <h2 className="pb-h1">{b.name}</h2>
        <button className="pb-btn" onClick={onTakeItem}>Take in an item</button>
      </div>

      <div className="pb-block">
        <div className="pb-card">
          <div className="pb-kv"><span>Phone</span><span>{b.phone}</span></div>
          <div className="pb-kv"><span>Area</span><span>{b.area || "—"}</span></div>
          <div className="pb-kv"><span>NRC</span><span>{fmtNrc(b.nrc)}</span></div>
        </div>
      </div>

      <div className="pb-block">
        <h3>Items brought in</h3>
        <div className="pb-card">
          {items.length === 0 ? (
            <div className="pb-empty">Nothing yet. Take in an item to lend against.</div>
          ) : (
            items.map((c) => {
              const ol = openLoanFor(c.id);
              return (
                <div className="pb-line" key={c.id}>
                  <div>
                    {c.desc}
                    <em>{K(c.value)} · {c.location}</em>
                  </div>
                  {ol ? (
                    <button className="pb-btn ghost sm" onClick={() => onOpenLoan(ol.id)}>Open loan</button>
                  ) : c.status === "forfeited" ? (
                    <span className="pb-chip" data-s="forfeited">Forfeited</span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button className="pb-btn sm" onClick={() => onIssue(c.id)}>Issue a loan</button>
                      <button className="pb-x" title="Remove this item" onClick={() => onDropItem(c)}>×</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {free.length === 0 && items.length > 0 && (
          <p className="pb-note">Every item of theirs is already on loan. Take in another to lend again.</p>
        )}
      </div>

      <div className="pb-block">
        <h3>Loan history</h3>
        <div className="pb-card">
          {loans.length === 0 ? (
            <div className="pb-empty">No loans yet.</div>
          ) : (
            loans.map((l) => {
              const s = statusOf(l);
              return (
                <button className="pb-row" key={l.id} onClick={() => onOpenLoan(l.id)}>
                  <div className="pb-row-top">
                    <span className="pb-name">{K(l.principal)} on {fmtDate(l.issuedOn)}</span>
                    <span className="pb-chip" data-s={s}>
                      {s === "overdue" ? daysLate(l) + " days late" : s[0].toUpperCase() + s.slice(1)}
                    </span>
                  </div>
                  <div className="pb-meta">Balance {K(Math.max(0, owing(l)))} · due {fmtDate(l.dueOn)}</div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

/* ---------- cashbook ----------
   Every row below is derived from the loans themselves, so the book can
   never drift from the records. Repayments are applied to interest owed
   first, then to the principal — the split is shown on each row.      */

function allocate(l) {
  const paid = [...l.repayments].sort((a, b) => d(a.on) - d(b.on));
  const chargedBy = (on) => l.charges.filter((c) => d(c.on) <= d(on)).reduce((t, c) => t + c.amount, 0);
  let interestPaid = 0;
  return paid.map((r) => {
    const owed = Math.max(0, chargedBy(r.on) - interestPaid);
    const toInterest = Math.min(r.amount, owed);
    interestPaid += toInterest;
    return { ...r, interest: toInterest, principal: r.amount - toInterest };
  });
}

function ledger(db) {
  const rows = [];
  const who = (id) => (db.borrowers.find((b) => b.id === id) || {}).name || "—";
  const what = (id) => (db.items.find((c) => c.id === id) || {}).desc || "—";

  db.loans.forEach((l) => {
    rows.push({ on: l.issuedOn, kind: "Loan out", who: who(l.borrowerId), note: what(l.itemId),
                out: l.principal, cash: 0, interest: 0, charged: 0, loanId: l.id });
    l.charges.forEach((c) =>
      rows.push({ on: c.on, kind: c.kind === "renewal" ? "Interest on renewal" : "Interest charged",
                  who: who(l.borrowerId), note: c.note, out: 0, cash: 0, interest: 0, charged: c.amount, loanId: l.id }));
    allocate(l).forEach((r) =>
      rows.push({ on: r.on, kind: "Repayment", who: who(l.borrowerId),
                  note: r.method + " — " + K(r.interest) + " interest, " + K(r.principal) + " off the principal",
                  out: 0, cash: r.amount, interest: r.interest, charged: 0, loanId: l.id }));
  });

  db.events.filter((e) => e.text.indexOf("forfeited") === 0 || e.text.indexOf("Collateral forfeited") === 0)
    .forEach((e) => {
      const l = db.loans.find((x) => x.id === e.loanId);
      if (!l) return;
      rows.push({ on: e.at.slice(0, 10), kind: "Collateral taken", who: who(l.borrowerId),
                  note: what(l.itemId) + " — no cash until it is sold",
                  out: 0, cash: 0, interest: 0, charged: 0, loanId: l.id });
    });

  return rows.sort((a, b) => d(b.on) - d(a.on) || a.kind.localeCompare(b.kind));
}

const monthKey = (s) => s.slice(0, 7);
const monthName = (k) =>
  d(k + "-01").toLocaleDateString("en-GB", { month: "long", year: "numeric" });

const sum = (rows, f) => rows.reduce((t, r) => t + f(r), 0);

function Cashbook({ db }) {
  const rows = useMemo(() => ledger(db), [db]);
  const months = useMemo(() => {
    const seen = [];
    rows.forEach((r) => { const k = monthKey(r.on); if (seen.indexOf(k) < 0) seen.push(k); });
    return seen;
  }, [rows]);
  const [month, setMonth] = useState(months[0] || monthKey(iso(TODAY)));

  const inMonth = rows.filter((r) => monthKey(r.on) === month);
  const year = month.slice(0, 4);
  const inYear = rows.filter((r) => r.on.slice(0, 4) === year);

  const fig = (set) => ({
    lent: sum(set, (r) => r.out),
    received: sum(set, (r) => r.cash),
    interest: sum(set, (r) => r.interest),
    charged: sum(set, (r) => r.charged),
  });
  const m = fig(inMonth), y = fig(inYear);
  const openLoans = db.loans.filter((l) => ["active", "overdue"].includes(statusOf(l)));
  const onTheStreet = openLoans.reduce((t, l) => t + Math.max(0, owing(l)), 0);
  const stillOwedInterest = openLoans.reduce(
    (t, l) => t + Math.max(0, chargesTotal(l) - allocate(l).reduce((x, r) => x + r.interest, 0)), 0);

  function download() {
    const head = "Date,Entry,Borrower,Detail,Cash out,Cash in,Of which interest,Interest charged\n";
    const body = inYear
      .slice().sort((a, b) => d(a.on) - d(b.on))
      .map((r) => [r.on, r.kind, r.who, '"' + r.note.replace(/"/g, "'") + '"',
                   r.out || "", r.cash || "", r.interest || "", r.charged || ""].join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([head + body], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "cashbook-" + year + ".csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="pb-head">
        <h2 className="pb-h1">Cashbook</h2>
        <button className="pb-btn ghost" onClick={download}>Download {year}</button>
      </div>

      <div className="pb-months">
        {months.map((k) => (
          <button key={k} data-on={k === month ? "1" : "0"} onClick={() => setMonth(k)}>
            {d(k + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" })}
          </button>
        ))}
      </div>

      <div className="pb-strip">
        <div><b className="pb-out">{K(m.lent)}</b><span>Lent out</span></div>
        <div><b className="pb-in">{K(m.received)}</b><span>Taken in</span></div>
        <div><b>{K(m.interest)}</b><span>Interest earned</span></div>
      </div>

      <div className="pb-sec">
        <h3><span>{monthName(month)}</span><span>{inMonth.length} entries</span></h3>
        <div className="pb-card">
          {inMonth.length === 0 ? (
            <div className="pb-empty">Nothing recorded this month.</div>
          ) : (
            <table className="pb-ledger">
              <thead>
                <tr><th>Entry</th><th className="n">Out</th><th className="n">In</th></tr>
              </thead>
              <tbody>
                {inMonth.map((r, i) => (
                  <tr key={i}>
                    <td>
                      {r.kind} — {r.who}
                      <em>{fmtDate(r.on)} · {r.note}</em>
                    </td>
                    <td className="n pb-out">{r.out ? K(r.out) : r.charged ? "" : ""}</td>
                    <td className="n pb-in">{r.cash ? K(r.cash) : r.charged ? "+" + K(r.charged) + " owed" : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="pb-sec">
        <h3><span>{year} so far</span></h3>
        <div className="pb-card">
          <div className="pb-kv"><span>Lent out</span><span>{K(y.lent)}</span></div>
          <div className="pb-kv"><span>Taken in</span><span>{K(y.received)}</span></div>
          <div className="pb-kv"><span>Interest charged</span><span>{K(y.charged)}</span></div>
          <div className="pb-kv total"><span>Interest actually earned</span><span>{K(y.interest)}</span></div>
          <div className="pb-kv"><span>Still out with borrowers</span><span>{K(onTheStreet)}</span></div>
          <div className="pb-kv"><span>Interest charged but unpaid</span><span>{K(stillOwedInterest)}</span></div>
        </div>
        <p className="pb-note">
          Interest earned counts only what has actually been paid. Interest charged includes what is still owed,
          which is why the two differ — the gap is the money on paper that has not arrived yet.
        </p>
      </div>
    </>
  );
}

/* ---------- dashboard ---------- */

function Dashboard({ db, borrower, item, onOpen, onAddBorrower, onClear, onRestore }) {
  const open = db.loans.filter((l) => ["active", "overdue"].includes(statusOf(l)));
  const overdue = open.filter((l) => statusOf(l) === "overdue").sort((a, b) => daysLate(b) - daysLate(a));
  const today = open.filter((l) => l.dueOn === iso(TODAY));
  const week = open
    .filter((l) => { const n = daysBetween(iso(TODAY), l.dueOn); return n > 0 && n <= 7; })
    .sort((a, b) => d(a.dueOn) - d(b.dueOn));
  const outstanding = open.reduce((s, l) => s + Math.max(0, owing(l)), 0);
  const inStore = db.items.filter((c) => c.status === "held").length;
  const readyToForfeit = overdue.filter(canForfeit).length;

  const Row = ({ l, tail }) => (
    <button className="pb-row" key={l.id} onClick={() => onOpen(l.id)}>
      <div className="pb-row-top">
        <span className="pb-name">{borrower(l.borrowerId).name}</span>
        <span className="pb-amt">{K(Math.max(0, owing(l)))}</span>
      </div>
      <div className="pb-meta">{item(l.itemId).desc}</div>
      <div className="pb-meta">{tail}</div>
      {canForfeit(l) && (
        <div className="pb-flag">
          Past the {SETTINGS.forfeitAfterDays}-day grace period — item can be forfeited
        </div>
      )}
    </button>
  );

  const Section = ({ title, note, list, tail }) => (
    <div className="pb-sec">
      <h3><span>{title}</span><span>{note}</span></h3>
      <div className="pb-card">
        {list.length === 0 ? <div className="pb-empty">Nothing here.</div> : list.map((l) => <Row key={l.id} l={l} tail={tail(l)} />)}
      </div>
    </div>
  );

  return (
    <>
      <div className="pb-head">
        <div>
          <h2 className="pb-h1">{fmtDate(iso(TODAY))}</h2>
          <span className="pb-count">{open.length} open {open.length === 1 ? "loan" : "loans"}</span>
        </div>
        <button className="pb-btn" onClick={onAddBorrower}>Add borrower</button>
      </div>

      {db.borrowers.length === 0 && (
        <div className="pb-card" style={{ padding: 16, marginBottom: 18 }}>
          <div className="pb-name">An empty book.</div>
          <p className="pb-note">Add the first borrower, take in what they bring, then issue the loan.</p>
        </div>
      )}

      <div className="pb-strip">
        <div><b>{K(outstanding)}</b><span>Out on loan</span></div>
        <div data-alarm={overdue.length ? "1" : "0"}><b>{overdue.length}</b><span>Overdue</span></div>
        <div><b>{inStore}</b><span>Items in store</span></div>
      </div>

      <Section
        title="Overdue" note={readyToForfeit ? readyToForfeit + " past grace" : ""}
        list={overdue} tail={(l) => daysLate(l) + " days late · was due " + fmtDate(l.dueOn)}
      />
      <Section title="Due today" note="" list={today} tail={() => "Due today"} />
      <Section
        title="Due within seven days" note="" list={week}
        tail={(l) => "Due " + fmtDate(l.dueOn) + " · in " + daysBetween(iso(TODAY), l.dueOn) + " days"}
      />

      <p className="pb-note">
        Grace period is set to {SETTINGS.forfeitAfterDays} days past the due date. One line in the settings changes it.
      </p>

      <div className="pb-sec" style={{ marginTop: 26 }}>
        <h3><span>The book itself</span></h3>
        <div className="pb-card" style={{ padding: 14 }}>
          <p className="pb-note" style={{ marginTop: 0 }}>
            Everything is saved on this device. Clear the sample records before you start entering real ones.
          </p>
          <div className="pb-actions">
            <button className="pb-btn warn" onClick={onClear}>Start with an empty book</button>
            <button className="pb-btn ghost" onClick={onRestore}>Put the samples back</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- loan detail ---------- */

function LoanDetail({ l, b, it, events, form, setForm, onBack, onRepay, onRenew, onForfeit, onDropRepayment, onDropLoan }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const s = statusOf(l);
  const closed = s === "cleared" || s === "forfeited";

  return (
    <>
      <button className="pb-back" onClick={onBack}>← {b.name}</button>

      <div className="pb-head">
        <h2 className="pb-h1">{b.name}</h2>
        <span className="pb-chip" data-s={s}>
          {s === "overdue" ? daysLate(l) + " days late" : s[0].toUpperCase() + s.slice(1)}
        </span>
      </div>

      <div className="pb-block">
        <div className="pb-card">
          <div className="pb-kv"><span>Principal</span><span>{K(l.principal)}</span></div>
          <div className="pb-kv"><span>Interest charged</span><span>{K(chargesTotal(l))}</span></div>
          <div className="pb-kv"><span>Repaid</span><span>−{K(paidTotal(l))}</span></div>
          <div className="pb-kv total"><span>Balance</span><span>{K(Math.max(0, owing(l)))}</span></div>
          <div className="pb-kv">
            <span>Due</span>
            <span className={s === "overdue" ? "pb-late" : ""}>{fmtDate(l.dueOn)}</span>
          </div>
          <div className="pb-kv"><span>Terms</span><span>{terms(l)}</span></div>
        </div>
        <p className="pb-note">
          Every charge is shown as its own line below. Renewals never change the principal or the agreed rate.
        </p>
      </div>

      <div className="pb-block">
        <h3>Collateral held</h3>
        <div className="pb-card">
          <div className="pb-line">
            <div>
              {it.desc}
              <em>{it.condition}</em>
              <em>{it.location}</em>
            </div>
            <span className="pb-chip" data-s={it.status === "forfeited" ? "forfeited" : it.status}>
              {it.status === "held" ? "In store" : it.status[0].toUpperCase() + it.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="pb-block">
        <h3>Charges</h3>
        <div className="pb-card">
          {l.charges.map((c) => (
            <div className="pb-line" key={c.id}>
              <div>{fmtDate(c.on)}<em>{c.note}</em></div>
              <strong>{K(c.amount)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-block">
        <h3>Repayments</h3>
        <div className="pb-card">
          {l.repayments.length === 0 ? (
            <div className="pb-empty">Nothing repaid yet.</div>
          ) : (
            l.repayments.map((r) => (
              <div className="pb-line" key={r.id}>
                <div>{fmtDate(r.on)}<em>{r.method}</em></div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <strong>{K(r.amount)}</strong>
                  <button className="pb-x" title="Remove this repayment"
                    onClick={() => onDropRepayment(l, r)}>×</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {!closed && (
        form === "repay" ? (
          <div className="pb-block">
            <div className="pb-card" style={{ padding: 14 }}>
              <div className="pb-two">
                <div className="pb-field">
                  <label htmlFor="amt">Amount received</label>
                  <input id="amt" inputMode="decimal" value={amount}
                    onChange={(e) => setAmount(e.target.value)} placeholder={String(Math.max(0, owing(l)))} />
                </div>
                <div className="pb-field">
                  <label htmlFor="mth">Paid by</label>
                  <select id="mth" value={method} onChange={(e) => setMethod(e.target.value)}>
                    <option>Cash</option><option>Mobile money</option><option>Bank transfer</option>
                  </select>
                </div>
              </div>
              <div className="pb-actions">
                <button className="pb-btn" disabled={!(Number(amount) > 0)}
                  onClick={() => onRepay(l, Number(amount), method)}>Record repayment</button>
                <button className="pb-btn ghost" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-actions">
            <button className="pb-btn" onClick={() => { setAmount(""); setForm("repay"); }}>Record repayment</button>
            <button className="pb-btn ghost" onClick={() => onRenew(l)}>
              Renew {l.interest.periodDays} days · {K(nextCharge(l))}
            </button>
            <button className="pb-btn warn" disabled={!canForfeit(l)} onClick={() => onForfeit(l)}>
              {canForfeit(l)
                ? "Forfeit collateral"
                : s === "overdue"
                ? "Forfeit in " + graceLeft(l) + " days"
                : "Forfeit collateral"}
            </button>
          </div>
        )
      )}

      <div className="pb-block" style={{ marginTop: 22 }}>
        <h3>History</h3>
        <div className="pb-card">
          {events.map((e) => (
            <div className="pb-line" key={e.id}>
              <div>{e.text}<em>{e.at}</em></div>
            </div>
          ))}
        </div>
        <p className="pb-note">
          Removing a repayment leaves a line here saying so, so a corrected mistake never looks like a missing record.
        </p>
      </div>

      <div className="pb-actions" style={{ marginBottom: 20 }}>
        <button className="pb-btn warn" onClick={() => onDropLoan(l)}>Delete this loan</button>
      </div>
    </>
  );
}

/* ---------- forms ---------- */

function Shell({ title, children, onCancel, onSave, saveLabel, ok }) {
  return (
    <>
      <button className="pb-back" onClick={onCancel}>← Back</button>
      <h2 className="pb-h1" style={{ marginBottom: 12 }}>{title}</h2>
      <div className="pb-card" style={{ padding: 14 }}>
        {children}
        <div className="pb-actions">
          <button className="pb-btn" disabled={!ok} onClick={onSave}>{saveLabel}</button>
          <button className="pb-btn ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </>
  );
}

function Field({ label, id, ...rest }) {
  return (
    <div className="pb-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
    </div>
  );
}

function NewBorrower({ db, onCancel, onSave }) {
  const [v, setV] = useState({ name: "", phone: "", area: "", nrc: "" });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const digits = normNrc(v.nrc).length;
  const clash = db.borrowers.find((b) => sameNrc(b.nrc, v.nrc));
  const ok = v.name.trim() && v.phone.trim() && digits === 9 && !clash;

  return (
    <Shell title="Add borrower" onCancel={onCancel} saveLabel="Save and continue"
      ok={ok} onSave={() => onSave({ ...v, nrc: fmtNrc(v.nrc) })}>
      <Field label="Full name" id="bn" value={v.name} onChange={set("name")} />
      <div className="pb-two">
        <Field label="Phone" id="bp" value={v.phone} onChange={set("phone")} inputMode="tel" />
        <Field label="Area" id="ba" value={v.area} onChange={set("area")} />
      </div>
      <Field label="NRC number" id="bnrc" value={v.nrc} onChange={set("nrc")}
        inputMode="numeric" placeholder="284119/61/1" />
      {clash ? (
        <p className="pb-note pb-late">{clash.name} is already on the register with this NRC.</p>
      ) : digits > 0 && digits !== 9 ? (
        <p className="pb-note">An NRC has nine digits — {digits} entered so far.</p>
      ) : (
        <p className="pb-note">
          Checked against everyone already on the register, so the same person can't be entered twice.
        </p>
      )}
      <p className="pb-note">
        Saving takes you to their page, where you take in the item before the loan is issued.
      </p>
    </Shell>
  );
}

function NewItem({ db, prefill, onCancel, onSave }) {
  const fixed = prefill && prefill.borrowerId;
  const [v, setV] = useState({
    borrowerId: fixed || db.borrowers[0]?.id || "",
    desc: "", condition: "", value: "", location: "",
  });
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const who = db.borrowers.find((b) => b.id === v.borrowerId);

  if (db.borrowers.length === 0) {
    return (
      <>
        <button className="pb-back" onClick={onCancel}>← Back</button>
        <div className="pb-card" style={{ padding: 16 }}>
          <div className="pb-name">No borrowers yet.</div>
          <p className="pb-note">Add the borrower first — the item and the loan both hang off a person.</p>
        </div>
      </>
    );
  }

  return (
    <Shell title="Take in an item" onCancel={onCancel} saveLabel="Save and issue a loan"
      ok={v.desc.trim() && Number(v.value) > 0 && v.borrowerId}
      onSave={() => onSave({ ...v, value: Number(v.value) })}>
      {fixed ? (
        <div className="pb-field">
          <label>Brought in by</label>
          <div className="pb-fixed">{who ? who.name : "—"}</div>
        </div>
      ) : (
        <div className="pb-field">
          <label htmlFor="ib">Brought in by</label>
          <select id="ib" value={v.borrowerId} onChange={set("borrowerId")}>
            {db.borrowers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}
      <Field label="What it is" id="id1" value={v.desc} onChange={set("desc")} placeholder="Make, model, distinguishing marks" />
      <Field label="Condition on arrival" id="id2" value={v.condition} onChange={set("condition")} />
      <div className="pb-two">
        <Field label="Value (K)" id="id3" value={v.value} onChange={set("value")} inputMode="decimal" />
        <Field label="Where it is kept" id="id4" value={v.location} onChange={set("location")} placeholder="Safe A, shelf 2" />
      </div>
    </Shell>
  );
}

function NewLoan({ db, prefill, onCancel, onSave, onNeedItem }) {
  const pledged = db.loans
    .filter((l) => ["active", "overdue"].includes(statusOf(l)))
    .map((l) => l.itemId);
  const freeFor = (bid) =>
    db.items.filter((c) => c.borrowerId === bid && c.status !== "forfeited" && !pledged.includes(c.id));

  const firstB = (prefill && prefill.borrowerId) ||
    db.borrowers.find((b) => freeFor(b.id).length > 0)?.id ||
    db.borrowers[0]?.id || "";

  const [v, setV] = useState({
    borrowerId: firstB,
    itemId: (prefill && prefill.itemId) || freeFor(firstB)[0]?.id || "",
    principal: "", mode: "percent", value: "20", periodDays: "30",
  });

  const mine = freeFor(v.borrowerId);
  const pickBorrower = (e) => {
    const bid = e.target.value;
    setV({ ...v, borrowerId: bid, itemId: freeFor(bid)[0]?.id || "" });
  };
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });

  const preview = Number(v.principal) > 0
    ? v.mode === "percent"
      ? Math.round(Number(v.principal) * Number(v.value)) / 100
      : Number(v.value)
    : 0;
  const chosen = db.items.find((c) => c.id === v.itemId);

  if (db.borrowers.length === 0) {
    return (
      <>
        <button className="pb-back" onClick={onCancel}>← Back</button>
        <div className="pb-card" style={{ padding: 16 }}>
          <div className="pb-name">No borrowers yet.</div>
          <p className="pb-note">Add the borrower first — the item and the loan both hang off a person.</p>
        </div>
      </>
    );
  }

  return (
    <Shell title="Issue a loan" onCancel={onCancel} saveLabel="Issue loan"
      ok={Number(v.principal) > 0 && Number(v.value) > 0 && v.itemId && v.borrowerId}
      onSave={() => onSave(v)}>
      <div className="pb-field">
        <label htmlFor="lb">Borrower</label>
        <select id="lb" value={v.borrowerId} onChange={pickBorrower}>
          {db.borrowers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}{freeFor(b.id).length === 0 ? " — no free item" : ""}
            </option>
          ))}
        </select>
      </div>

      {mine.length === 0 ? (
        <div className="pb-field">
          <label>Held against</label>
          <div className="pb-fixed">Nothing of theirs is free to lend against.</div>
          <div className="pb-actions">
            <button className="pb-btn sm" onClick={() => onNeedItem(v.borrowerId)}>Take in an item first</button>
          </div>
        </div>
      ) : (
        <div className="pb-field">
          <label htmlFor="li">Held against</label>
          <select id="li" value={v.itemId} onChange={set("itemId")}>
            {mine.map((c) => <option key={c.id} value={c.id}>{c.desc} — {K(c.value)}</option>)}
          </select>
        </div>
      )}

      <Field label="Amount lent (K)" id="lp" value={v.principal} onChange={set("principal")} inputMode="decimal" />
      {chosen && Number(v.principal) > chosen.value && (
        <p className="pb-note pb-late">
          More than the item is valued at ({K(chosen.value)}). Check before issuing.
        </p>
      )}
      <div className="pb-two">
        <div className="pb-field">
          <label htmlFor="lm">Interest charged as</label>
          <select id="lm" value={v.mode} onChange={set("mode")}>
            <option value="percent">Percentage of the amount lent</option>
            <option value="fixed">Flat kwacha amount</option>
          </select>
        </div>
        <Field label={v.mode === "percent" ? "Rate (%)" : "Charge (K)"} id="lv"
          value={v.value} onChange={set("value")} inputMode="decimal" />
      </div>
      <Field label="Length of one period (days)" id="ld" value={v.periodDays}
        onChange={set("periodDays")} inputMode="numeric" />
      <p className="pb-note">
        Borrower pays {K(preview)} in interest for the first {v.periodDays || 30} days, on top of the{" "}
        {K(Number(v.principal) || 0)} lent. Each renewal adds the same charge again as its own line.
      </p>
    </Shell>
  );
}
