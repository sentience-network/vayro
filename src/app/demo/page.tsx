import Link from "next/link";
import { DEMO_FLEET } from "@/lib/demo-fleet";
import { DemoBookingButton } from "@/components/DemoBookingButton";

export const dynamic = "force-static";

export default function DemoPage() {
  return <section className="section page demo-page">
    <span className="eyebrow">VAYRO INVESTOR DEMO</span>
    <h1>See how every Vayro category comes to life.</h1>
    <p className="lede">Explore a representative sample fleet, open a vehicle experience, and try the booking flow. These are illustrative demo vehicles—not live inventory and not available to rent.</p>
    <div className="demo-notice"><b>DEMO CONTENT:</b> Every image and listing below is a category-matched stock/reference image. No demo card accepts a real booking, payment, favorite, message, or reservation.</div>
    <div className="demofleet">
      {DEMO_FLEET.map(vehicle => <article className="democard" key={vehicle.slug}>
        <div className="democardphoto"><img src={vehicle.image} alt={vehicle.title + " demo vehicle"} loading="lazy" /><span>DEMO VEHICLE</span></div>
        <div className="democardbody"><div className="spread"><span className="pill">{vehicle.category === "Luxury" ? "Vayro Lux" : vehicle.category}</span><small>Photo: {vehicle.source}</small></div><h2>{vehicle.title}</h2><p>{vehicle.description}</p><p className="muted">{vehicle.location} · {"$"}{vehicle.price}/day sample price</p><DemoBookingButton title={vehicle.title} /></div>
      </article>)}
    </div>
    <div className="demoactions"><Link className="button bright" href="/register">Create a real account</Link><Link className="outline" href="/">Back to Vayro</Link></div>
    <p className="muted">Investor demo metrics and booking actions are illustrative product data, not claimed traction.</p>
  </section>;
}
