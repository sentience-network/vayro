"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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

export function MobileNav({ links, loggedIn }: { links: { href: string; label: string }[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  return <div className="mobilenav">
    <button className="menubutton" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? "×" : "☰"}</button>
    {open && <div className="menubackdrop" onClick={() => setOpen(false)}><nav id="mobile-menu" aria-label="Mobile navigation" onClick={event => event.stopPropagation()}>
      <div className="spread"><b>Menu</b><button className="quiet" onClick={() => setOpen(false)}>Close ×</button></div>
      {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
      {loggedIn ? <ApiButton url="/api/auth/logout" label="Log out" className="outline" /> : <><Link href="/login" onClick={() => setOpen(false)}>Log in</Link><Link href="/register" className="button" onClick={() => setOpen(false)}>Join Vayro</Link></>}
    </nav></div>}
  </div>;
}

type RecentRide = { slug: string; title: string; location: string; price: number; photo: string };
export function ListingViewTracker({ ride }: { ride: RecentRide }) {
  useEffect(() => {
    try {
      const old = JSON.parse(localStorage.getItem("vayro-recent") || "[]") as RecentRide[];
      localStorage.setItem("vayro-recent", JSON.stringify([ride, ...old.filter(x => x.slug !== ride.slug)].slice(0, 4)));
    } catch { /* private browsing can disable storage */ }
  }, [ride]);
  return null;
}

export function RecentlyViewed() {
  const [rides, setRides] = useState<RecentRide[]>([]);
  useEffect(() => { try { setRides(JSON.parse(localStorage.getItem("vayro-recent") || "[]")); } catch { /* no storage */ } }, []);
  if (!rides.length) return null;
  return <section className="recent"><div className="sectionhead"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2></div></div><div className="recentgrid">{rides.map(ride => <Link href={`/listings/${ride.slug}`} key={ride.slug}><img src={ride.photo} alt="" loading="lazy"/><div><b>{ride.title}</b><small>{ride.location} · ${ride.price}/day</small></div></Link>)}</div></section>;
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
  const router = useRouter(); const [busy, setBusy] = useState(false),[body,setBody]=useState("");
  return <div><div className="quickreplies">{["Are these dates available?","Where is pickup?","Thanks — sounds good!"].map(text=><button type="button" className="quiet" key={text} onClick={()=>setBody(text)}>{text}</button>)}</div><form className="messageform" onSubmit={async event => { event.preventDefault(); setBusy(true); try { await jsonFetch("/api/messages", "POST", { recipientId, bookingId, body }); setBody(""); router.refresh(); } catch (e) { alert((e as Error).message); } finally { setBusy(false); } }}><input name="body" aria-label="Message" placeholder="Write a message…" value={body} maxLength={2000} onChange={e=>setBody(e.target.value)} required/><span className="charcount">{body.length}/2000</span><button className="button" disabled={busy}>{busy ? "Sending…" : "Send"}</button></form></div>;
}

export type ListingDraft = { id: string; slug: string; title: string; description: string; category: string; location: string; pricePerDay: number; securityDeposit: number; features: string[]; rules: string[]; deliveryOptions: string[]; details: Record<string, string>; photos: { url: string }[] };
export function ListingForm({ listing }: { listing?: ListingDraft }) {
  const router = useRouter(); const [error, setError] = useState(""); const list = (f: FormData, key: string) => String(f.get(key) || "").split(",").map(x => x.trim()).filter(Boolean);
  return <form className="stack panel" onSubmit={async event => { event.preventDefault(); setError(""); const f = new FormData(event.currentTarget); try { const uploaded=await imageFilesToDataUrls(f.getAll("photoFiles").filter(value=>value instanceof File) as File[]); const body = { title: f.get("title"), description: f.get("description"), category: f.get("category"), location: f.get("location"), pricePerDay: f.get("pricePerDay"), securityDeposit: f.get("securityDeposit"), features: list(f, "features"), rules: list(f, "rules"), deliveryOptions: list(f, "deliveryOptions"), photoUrls: [...uploaded,...list(f, "photos")], details: { make: String(f.get("make") || ""), model: String(f.get("model") || ""), year: String(f.get("year") || "") } }; const result = await jsonFetch(listing ? `/api/listings/${listing.id}` : "/api/listings", listing ? "PATCH" : "POST", body); router.push(`/listings/${listing?.slug || result.slug}`); } catch (e) { setError((e as Error).message); } }}><h2>{listing ? "Edit your ride" : "List your ride"}</h2><div className="formgrid"><label>Title<input name="title" defaultValue={listing?.title} required/></label><label>Category<select name="category" defaultValue={listing?.category}>{["Car","Truck","SUV","Luxury","RV","Camper van","Travel trailer","Boat","Jet ski","Motorcycle","ATV","UTV","Other"].map(x => <option key={x}>{x}</option>)}</select></label><label>Location<input name="location" defaultValue={listing?.location} required/></label><label>Price / day<input name="pricePerDay" type="number" min="1" defaultValue={listing?.pricePerDay} required/></label><label>Security deposit<input name="securityDeposit" type="number" min="0" defaultValue={listing?.securityDeposit ?? 0} required/></label><label>Year<input name="year" defaultValue={listing?.details?.year}/></label><label>Make<input name="make" defaultValue={listing?.details?.make}/></label><label>Model<input name="model" defaultValue={listing?.details?.model}/></label></div><label>Description<textarea name="description" defaultValue={listing?.description} minLength={30} required/></label><label className="uploadbox">Upload vehicle photos <small>Up to 6 JPEG, PNG, or WebP files. We resize them before saving.</small><input name="photoFiles" type="file" accept="image/jpeg,image/png,image/webp" multiple/></label><label>Or add photo URLs <small>(optional, comma separated)</small><textarea name="photos" defaultValue={listing?.photos.filter(x=>!x.url.startsWith("data:")).map(x => x.url).join(", ")}/></label><p className="notice">No photo? Vayro will add a representative category image and clearly label that it is not your actual vehicle.</p><label>Features <small>(comma separated)</small><input name="features" defaultValue={listing?.features.join(", ")}/></label><label>Rules <small>(comma separated)</small><input name="rules" defaultValue={listing?.rules.join(", ")}/></label><label>Delivery options <small>(comma separated)</small><input name="deliveryOptions" defaultValue={listing?.deliveryOptions.join(", ")}/></label>{error && <p className="error">{error}</p>}<button className="button">{listing ? "Save changes" : "Publish listing"}</button></form>;
}

export function ReviewForm({ listingId }: { listingId: string }) {
  const router = useRouter();const[rating,setRating]=useState(5),[error,setError]=useState("");
  return <form className="reviewform" onSubmit={async event => { event.preventDefault();setError(""); try { await jsonFetch(`/api/reviews/${listingId}`, "POST", Object.fromEntries(new FormData(event.currentTarget))); event.currentTarget.reset();setRating(5); router.refresh(); } catch (e) { setError((e as Error).message); } }}><fieldset><legend>Your tire rating</legend><div className="tirepicker">{[1,2,3,4,5].map(x=><label className={x<=rating?"selected":""} key={x} title={`${x} tire${x===1?"":"s"}`}><input type="radio" name="rating" value={x} checked={rating===x} onChange={()=>setRating(x)}/><i>●</i></label>)}</div><small>{rating} out of 5 tires · {rating===1?"Poor":rating===2?"Fair":rating===3?"Good":rating===4?"Great":"Excellent"}</small></fieldset><label>Comment<textarea name="comment" placeholder="Tell future renters about the vehicle and owner" required minLength={5} maxLength={1000}/></label>{error&&<p className="error" role="alert">{error}</p>}<button className="button">Post verified review</button></form>;
}
