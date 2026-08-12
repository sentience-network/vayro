"use client";

import { useState } from "react";

export function DemoBookingButton({ title }: { title: string }) {
  const [sent, setSent] = useState(false);
  return sent ? (
    <p className="demo-success" role="status">Demo request created for {title}. No reservation or payment was made.</p>
  ) : (
    <button className="button" type="button" onClick={() => setSent(true)}>Try demo booking flow</button>
  );
}
