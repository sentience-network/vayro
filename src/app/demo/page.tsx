import Link from "next/link";
export const dynamic = "force-static";

export default function DemoPage() {
  return <main className="section page demo-page">
    <span className="eyebrow">VAYRO PRODUCT DEMO</span>
    <h1>Rent anything that moves.</h1>
    <p className="lede">A short walkthrough of Vayro’s peer-to-peer vehicle marketplace for renters and owners.</p>
    <video className="demovideo" controls playsInline preload="metadata" poster="/icons/vayro-app.svg">
      <source src="/demo/Vayro-YC-Demo.mp4" type="video/mp4" />
      Your browser does not support embedded video. <a href="/demo/Vayro-YC-Demo.mp4">Download the MP4</a>.
    </video>
    <div className="demoactions"><a className="button" href="/demo/Vayro-YC-Demo.mp4" download>Download MP4</a><Link className="outline" href="/">Visit Vayro</Link></div>
    <p className="muted">Demo dashboard numbers and booking records are illustrative product data, not claimed traction.</p>
  </main>;
}
