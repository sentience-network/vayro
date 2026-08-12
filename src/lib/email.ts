import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]!);
export async function deliverEmail(input: { userId?: string; to: string; template: string; subject: string; payload?: Record<string, unknown>;replyTo?:string }) {
  const delivery = await db.emailDelivery.create({ data: { userId: input.userId, toEmail: input.to, template: input.template, subject: input.subject, payload: (input.payload || {}) as Prisma.InputJsonValue } });
  const key = process.env.RESEND_API_KEY;
  if (!key) return delivery;
  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM || "Vayro <notifications@vayro.com>", to: input.to, reply_to:input.replyTo,subject: input.subject, html: `<div style="font-family:Arial;line-height:1.6;color:#18231d"><h1>${escapeHtml(input.subject)}</h1><p>${escapeHtml(String(input.payload?.message || "You have an update in Vayro.")).replace(/\n/g,"<br>")}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://vayro.onrender.com"}">Open Vayro</a></p></div>` }) });
    const result = await response.json();
    return db.emailDelivery.update({ where: { id: delivery.id }, data: response.ok ? { status: "SENT", sentAt: new Date(), attempts: 1, providerMessageId: result.id } : { status: "FAILED", attempts: 1, lastError: JSON.stringify(result).slice(0, 500) } });
  } catch (error) {
    return db.emailDelivery.update({ where: { id: delivery.id }, data: { status: "FAILED", attempts: 1, lastError: String(error).slice(0, 500) } });
  }
}
