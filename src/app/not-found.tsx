import Link from "next/link";
export default function NotFound(){return <section className="auth"><div className="panel empty"><span className="eyebrow">404 · OFF THE MAP</span><h1>That road ends here.</h1><p>The ride or page you requested could not be found.</p><Link className="button" href="/browse">Explore available rides</Link></div></section>}
