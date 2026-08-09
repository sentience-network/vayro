"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
export function Analytics() { const path = usePathname(), query = useSearchParams(); useEffect(() => { let id = localStorage.getItem("vayro-session"); if (!id) { id = crypto.randomUUID(); localStorage.setItem("vayro-session", id); } navigator.sendBeacon("/api/analytics", new Blob([JSON.stringify({ sessionId: id, name: path === "/browse" ? "SEARCH" : "PAGE_VIEW", path: `${path}?${query}` })], { type: "application/json" })); }, [path, query]); return null; }
