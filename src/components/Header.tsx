import Link from "next/link";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MobileNav, ApiButton } from "./ClientActions";

export async function Header() {
  const user = await getUser();
  const unread = user ? await db.notification.count({ where: { userId: user.id, readAt: null } }) : 0;
  const links = [
    { href: "/browse", label: "Explore" },
    { href: "/pricing", label: "Plus" },
    { href: "/lux", label: "Vayro Lux" },
    { href: "/perks", label: "Perks" },
    { href: "/demo", label: "Demo" },
    { href: "/safety", label: "Safety" },
    ...(user ? [
      { href: "/saved-searches", label: "Saved" },
      { href: "/dashboard/trips", label: "Trips" },
      { href: "/messages", label: "Messages" },
      { href: "/notifications", label: `Alerts${unread ? ` (${unread})` : ""}` },
      ...(user.isOwner ? [{ href: "/owner", label: "Owner" }, { href: "/owner/tools", label: "Tools" }] : []),
      ...(user.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
      { href: "/support", label: "Support" },
    ] : []),
  ];
  return <header>
    <Link href="/" className="logo" aria-label="Vayro home">Vayro<span>↗</span></Link>
    <nav className="desktopnav" aria-label="Primary navigation">
      {links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      <Link href="/owner/new" className="button small ownercta">List a vehicle</Link>
      {user ? <ApiButton url="/api/auth/logout" label="Log out" className="quiet" /> : <><Link href="/login">Log in</Link><Link href="/register" className="button small">Join Vayro</Link></>}
    </nav>
    <MobileNav links={links} loggedIn={!!user} />
  </header>;
}
