"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
export function Analytics() { const path = usePathname(), query = useSearchParams(); useEffect(() => { if (navigator.doNotTrack === "1") return; let id = localStorage.getItem("vayro-session"); if (!id) { id = crypto.randomUUID(); localStorage.setItem("vayro-session", id); } const body=JSON.stringify({ sessionId: id, name: path === "/browse" ? "SEARCH" : "PAGE_VIEW", path: `${path}?${query}` }); try { if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" })); else void fetch("/api/analytics", {method:"POST",headers:{"content-type":"application/json"},body,keepalive:true}); } catch {} }, [path, query]); return null; }
