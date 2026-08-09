"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

async function jsonFetch(url: string, method: string, body?: object) {
  const response = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong");
  return payload;
}

async function imageFilesToDataUrls(files: File[]) {
  if (files.length > 6) throw new Error("Upload up to 6 photos");
  return Promise.all(files.filter(file => file.size > 0).map(file => new Promise<string>((resolve, reject) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) return reject(new Error("Photos must be JPEG, PNG, or WebP"));
    if (file.size > 8_000_000) return reject(new Error("Each original photo must be under 8 MB"));
    const image = new Image(); const objectUrl = URL.createObjectURL(file);
    image.onload = () => { const scale = Math.min(1, 1600 / image.width, 1200 / image.height); const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(objectUrl); const data = canvas.toDataURL("image/webp", .78); if (data.length > 1_600_000) reject(new Error("A compressed photo is still too large; choose a smaller image")); else resolve(data); };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("One photo could not be read")); }; image.src = objectUrl;
  })));
}

export function ApiButton({ url, body, label, method = "POST", className = "button", confirmText }: { url: string; body?: object; label: string; method?: string; className?: string; confirmText?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return <button className={className} disabled={busy} onClick={async () => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    try { await jsonFetch(url, method, body); router.refresh(); } catch (error) { alert((error as Error).message); } finally { setBusy(false); }
  }}>{busy ? "Working…" : label}</button>;
}

export function RedirectButton({url,label,className="button"}:{url:string;label:string;className?:string}){const[busy,setBusy]=useState(false);return <button className={className} disabled={busy} onClick={async()=>{setBusy(true);try{const result=await jsonFetch(url,"POST");if(!result.url)throw new Error("Provider did not return a secure URL");window.location.assign(result.url)}catch(error){alert((error as Error).message);setBusy(false)}}}>{busy?"Opening Stripe…":label}</button>}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const [error, setError] = useState("");
  return <form className="stack" onSubmit={async event => {
    event.preventDefault(); setError(""); const form = new FormData(event.currentTarget);
    if(mode==="register"&&form.get("password")!==form.get("confirmPassword")){setError("Passwords do not match");return} try { await jsonFetch(`/api/auth/${mode}`, "POST", { ...Object.fromEntries(form), isOwner: form.get("isOwner") === "on" }); router.push(mode === "login" ? "/browse" : "/verify-identity"); router.refresh(); } catch (e) { setError((e as Error).message); }
  }}>{mode === "register" && <><label>Name<input name="name" autoComplete="name" required minLength={2}/></label><label className="check"><input type="checkbox" name="isOwner"/> I plan to list vehicles</label></>}<label>Email<input name="email" type="email" autoComplete="email" required/></label><label>Password<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8}/></label>{mode==="register"&&<label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8}/></label>}{error && <p className="error" role="alert">{error}</p>}<button className="button">{mode === "login" ? "Log in" : "Create account"}</button></form>;
}

export function BookingForm({ listingId, price, feePayer="RENTER", feeRate=10 }: { listingId: string; price: number;feePayer?:"RENTER"|"OWNER"|"SPLIT";feeRate?:number }) {
  const router = useRouter(); const [error, setError] = useState(""); const [start,setStart]=useState("");const[end,setEnd]=useState("");const today = new Date().toISOString().slice(0, 10);const days=start&&end?Math.max(0,Math.round((new Date(`${end}T12:00:00`).getTime()-new Date(`${start}T12:00:00`).getTime())/86400000)):0,subtotal=price*days,marketplaceFee=Math.round(subtotal*feeRate)/100,renterFee=feePayer==="RENTER"?marketplaceFee:feePayer==="SPLIT"?marketplaceFee/2:0,total=subtotal+renterFee;
  return <form className="stack" onSubmit={async event => { event.preventDefault(); setError(""); try { await jsonFetch("/api/bookings", "POST", { ...Object.fromEntries(new FormData(event.currentTarget)), listingId }); router.push("/dashboard/trips?booked=1"); } catch (e) { setError((e as Error).message); } }}><h3>${price} <small>/ day</small></h3><div className="dategrid"><label>Start<input name="startDate" type="date" min={today} value={start} onChange={event=>{setStart(event.target.value);if(end&&end<=event.target.value)setEnd("")}} required/></label><label>End<input name="endDate" type="date" min={start||today} value={end} onChange={event=>setEnd(event.target.value)} required/></label></div>{days>0&&<div className="quote"><span>Rental subtotal</span><b>${subtotal.toLocaleString()}</b><span>Marketplace fee ({feeRate}%)</span><b>{renterFee?`$${renterFee.toLocaleString()}`:"Owner-paid"}</b><span>Total due after acceptance</span><b>${total.toLocaleString()}</b><small>{feePayer==="SPLIT"?"Owner and renter split the marketplace fee.":feePayer==="OWNER"?"The owner chose to absorb the marketplace fee.":"The owner chose a renter-paid marketplace fee."}</small></div>}<label>Note<textarea name="note" placeholder="Tell the owner about your trip"/></label>{error && <p className="error" role="alert">{error}</p>}<button className="button">Request to book</button><small>No charge yet. The owner reviews your request.</small></form>;
}

export function ShareButton({title}:{title:string}){const[done,setDone]=useState(false);return <button className="outline" onClick={async()=>{const data={title,text:`Check out ${title} on Vayro`,url:window.location.href};if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(window.location.href);setDone(true);setTimeout(()=>setDone(false),1800)}}}>{done?"Link copied ✓":"Share ↗"}</button>}

export function MessageForm({ recipientId, bookingId }: { recipientId: string; bookingId?: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false);
  return <form className="messageform" onSubmit={async event => { event.preventDefault(); setBusy(true); const form = event.currentTarget; const data = new FormData(form); try { await jsonFetch("/api/messages", "POST", { recipientId, bookingId, body: data.get("body") }); form.reset(); router.refresh(); } catch (e) { alert((e as Error).message); } finally { setBusy(false); } }}><input name="body" aria-label="Message" placeholder="Write a message…" required/><button className="button" disabled={busy}>{busy ? "Sending…" : "Send"}</button></form>;
}

export type ListingDraft = { id: string; slug: string; title: string; description: string; category: string; location: string; pricePerDay: number; securityDeposit: number; features: string[]; rules: string[]; deliveryOptions: string[]; details: Record<string, string>; photos: { url: string }[] };
export function ListingForm({ listing }: { listing?: ListingDraft }) {
  const router = useRouter(); const [error, setError] = useState(""); const list = (f: FormData, key: string) => String(f.get(key) || "").split(",").map(x => x.trim()).filter(Boolean);
  return <form className="stack panel" onSubmit={async event => { event.preventDefault(); setError(""); const f = new FormData(event.currentTarget); try { const uploaded=await imageFilesToDataUrls(f.getAll("photoFiles").filter(value=>value instanceof File) as File[]); const body = { title: f.get("title"), description: f.get("description"), category: f.get("category"), location: f.get("location"), pricePerDay: f.get("pricePerDay"), securityDeposit: f.get("securityDeposit"), features: list(f, "features"), rules: list(f, "rules"), deliveryOptions: list(f, "deliveryOptions"), photoUrls: [...uploaded,...list(f, "photos")], details: { make: String(f.get("make") || ""), model: String(f.get("model") || ""), year: String(f.get("year") || "") } }; const result = await jsonFetch(listing ? `/api/listings/${listing.id}` : "/api/listings", listing ? "PATCH" : "POST", body); router.push(`/listings/${listing?.slug || result.slug}`); } catch (e) { setError((e as Error).message); } }}><h2>{listing ? "Edit your ride" : "List your ride"}</h2><div className="formgrid"><label>Title<input name="title" defaultValue={listing?.title} required/></label><label>Category<select name="category" defaultValue={listing?.category}>{["Car","Truck","SUV","Luxury","RV","Camper van","Travel trailer","Boat","Jet ski","Motorcycle","ATV","UTV","Other"].map(x => <option key={x}>{x}</option>)}</select></label><label>Location<input name="location" defaultValue={listing?.location} required/></label><label>Price / day<input name="pricePerDay" type="number" min="1" defaultValue={listing?.pricePerDay} required/></label><label>Security deposit<input name="securityDeposit" type="number" min="0" defaultValue={listing?.securityDeposit ?? 0} required/></label><label>Year<input name="year" defaultValue={listing?.details?.year}/></label><label>Make<input name="make" defaultValue={listing?.details?.make}/></label><label>Model<input name="model" defaultValue={listing?.details?.model}/></label></div><label>Description<textarea name="description" defaultValue={listing?.description} minLength={30} required/></label><label className="uploadbox">Upload vehicle photos <small>Up to 6 JPEG, PNG, or WebP files. We resize them before saving.</small><input name="photoFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple/></label><label>Or add photo URLs <small>(optional, comma separated)</small><textarea name="photos" defaultValue={listing?.photos.filter(x=>!x.url.startsWith("data:")).map(x => x.url).join(", ")}/></label><p className="notice">No photo? Vayro will add a representative category image and clearly label that it is not your actual vehicle.</p><label>Features <small>(comma separated)</small><input name="features" defaultValue={listing?.features.join(", ")}/></label><label>Rules <small>(comma separated)</small><input name="rules" defaultValue={listing?.rules.join(", ")}/></label><label>Delivery options <small>(comma separated)</small><input name="deliveryOptions" defaultValue={listing?.deliveryOptions.join(", ")}/></label>{error && <p className="error">{error}</p>}<button className="button">{listing ? "Save changes" : "Publish listing"}</button></form>;
}

export function ReviewForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  return <form className="reviewform" onSubmit={async event => { event.preventDefault(); try { await jsonFetch(`/api/reviews/${listingId}`, "POST", Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset(); router.refresh(); } catch (e) { alert((e as Error).message); } }}><select name="rating" defaultValue="5">{[5,4,3,2,1].map(x => <option key={x} value={x}>{x} stars</option>)}</select><input name="comment" placeholder="Share your experience" required minLength={5}/><button className="button">Add review</button></form>;
}
