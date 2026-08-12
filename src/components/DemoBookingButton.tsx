"use client";

import { useMemo, useState } from "react";

type Step = 1 | 2 | 3 | 4 | 5;
function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function DemoBookingButton({ title, price, category }: { title: string; price: number; category: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [startDate, setStartDate] = useState(dateOffset(7));
  const [endDate, setEndDate] = useState(dateOffset(10));
  const [name, setName] = useState("Investor Guest");
  const [email, setEmail] = useState("investor@example.com");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(0, Math.round((new Date(endDate + "T12:00:00").getTime() - new Date(startDate + "T12:00:00").getTime()) / 86400000));
  }, [startDate, endDate]);
  const feeRate = category === "Luxury" ? 12.5 : 10;
  const subtotal = days * price;
  const fee = Math.round(subtotal * feeRate) / 100;
  const total = subtotal + fee;
  const reset = () => { setStep(1); setError(""); setVerified(false); };

  if (!open) return <button className="button" type="button" onClick={() => setOpen(true)}>Try complete demo booking</button>;
  return <div className="demobooking" aria-label={"Demo booking flow for " + title}>
    <div className="demobookinghead"><div><b>Sandbox booking</b><small>No real account, reservation, or payment</small></div><button className="quiet" type="button" onClick={() => { setOpen(false); reset(); }}>Close ×</button></div>
    <div className="demosteps" aria-label="Booking progress">{["Dates", "Review", "Request", "Accepted", "Checkout"].map((label, index) => <span className={step >= index + 1 ? "active" : ""} key={label}><i>{index + 1}</i>{label}</span>)}</div>
    {step === 1 && <div className="demostep"><h3>1. Choose dates</h3><p className="muted">The live flow checks availability before moving to the quote.</p><div className="demoformrow"><label>Start date<input type="date" value={startDate} min={dateOffset(1)} onChange={event => setStartDate(event.target.value)} /></label><label>End date<input type="date" value={endDate} min={startDate || dateOffset(1)} onChange={event => setEndDate(event.target.value)} /></label></div>{error && <p className="error">{error}</p>}<button className="button" type="button" onClick={() => { if (days < 1) { setError("Choose an end date after the start date."); return; } setError(""); setStep(2); }}>Check availability →</button></div>}
    {step === 2 && <div className="demostep"><h3>2. Review trip and renter details</h3><div className="demoquote"><span>{startDate} → {endDate} ({days} {days === 1 ? "day" : "days"})</span><b>Rental subtotal {"$"}{subtotal.toLocaleString()}</b><span>Marketplace fee ({feeRate}%) {"$"}{fee.toLocaleString()}</span><strong>Total after owner acceptance {"$"}{total.toLocaleString()}</strong></div><div className="demoformrow"><label>Your name<input value={name} onChange={event => setName(event.target.value)} /></label><label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} /></label></div><label className="check"><input type="checkbox" checked={verified} onChange={event => setVerified(event.target.checked)} /> I understand this is a simulated investor walkthrough.</label>{error && <p className="error">{error}</p>}<button className="button" type="button" onClick={() => { if (!name.trim() || !email.includes("@")) { setError("Enter a name and valid email to continue."); return; } if (!verified) { setError("Confirm the simulated walkthrough to continue."); return; } setError(""); setStep(3); }}>Request to book →</button></div>}
    {step === 3 && <div className="demostep"><h3>3. Booking request sent</h3><p>Your request is now in the renter dashboard and the owner has been notified. In the live product, this is where the owner can accept or decline.</p><div className="demotimeline"><b>✓ Request submitted</b><span>Owner reviewing dates</span><span>Payment not started</span></div><button className="button" type="button" onClick={() => setStep(4)}>Simulate owner acceptance →</button></div>}
    {step === 4 && <div className="demostep"><h3>4. Owner accepted</h3><p>The dates are held and the renter can continue to secure checkout. The live product would now create a Stripe Checkout session.</p><div className="demoquote"><span>Accepted by demo owner</span><b>Total ready for checkout {"$"}{total.toLocaleString()}</b><small>Security deposit and final Stripe terms would appear here.</small></div><button className="button" type="button" onClick={() => setStep(5)}>Continue to secure checkout →</button></div>}
    {step === 5 && <div className="demostep"><h3>5. Checkout handoff</h3><div className="demo-success"><b>Stripe handoff simulated</b><br />In the live site this button opens Stripe Checkout. In this investor demo, no payment window opens and no charge or reservation is created.</div><button className="outline" type="button" onClick={() => { setOpen(false); reset(); }}>Restart demo flow</button></div>}
  </div>;
}
