export function ClockMark() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.2" /><path d="M16 8v8l5 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="16" cy="16" r="1.7" fill="currentColor" /></svg>;
}
// Tenant: a terminal prompt, the agent you run yourself.
export function AgentMark() {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m9 11 6 5-6 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 21h6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>;
}

export function BowlMark() {
  return <svg viewBox="0 0 120 120" fill="none" aria-hidden="true"><path d="m76 24 24-10M79 34l27-4" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /><path d="M23 57h74c-2 24-15 38-37 38S25 81 23 57Z" fill="currentColor" /><path d="M19 57h82M46 100h28" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /><path d="M60 43S43 35 43 26c0-9 13-12 17-3 4-9 17-6 17 3 0 9-17 17-17 17Z" fill="currentColor" /></svg>;
}

export function FlameMark() {
  return <svg viewBox="0 0 120 140" fill="none" aria-hidden="true"><path d="M68 7c8 31-18 39-9 59 6-4 13-15 15-24 24 22 35 41 27 63-6 18-21 28-41 28-26 0-44-16-44-40 0-20 13-34 26-45-1 14 3 20 8 22C37 39 65 31 68 7Z" fill="currentColor" /><path d="M64 85c1 13-12 18-12 28 0 8 4 14 10 18-16-1-25-9-25-21 0-10 7-17 13-23 0 8 2 12 5 13 2-5 7-10 9-15Z" fill="#231913" /></svg>;
}

export function PrincipleMark({ type }) {
  return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'privacy' ? <><rect x="9" y="18" width="22" height="17" rx="4" /><path d="M13 18v-6a7 7 0 0 1 14 0v6M20 25v4" /></> : type === 'money' ? <><circle cx="20" cy="20" r="15" /><path d="M25 14h-7a4 4 0 0 0 0 8h4a4 4 0 0 1 0 8h-8M20 10v24" /></> : <><path d="M34 19a14 14 0 0 1-14 14h-6l-8 4 2-9A14 14 0 1 1 34 19Z" /><path d="M13 19h.1M20 19h.1M27 19h.1" strokeWidth="3" /></>}
  </svg>;
}
