import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-change-me");
export async function createSession(userId:string){ const token=await new SignJWT({userId}).setProtectedHeader({alg:"HS256"}).setExpirationTime("14d").sign(key()); (await cookies()).set("vayro_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:1209600}); }
export async function getUser(){ try { const token=(await cookies()).get("vayro_session")?.value; if(!token)return null; const {payload}=await jwtVerify(token,key()); return await db.user.findUnique({where:{id:String(payload.userId)},select:{id:true,email:true,name:true,role:true,isOwner:true,disabled:true,subscriptionStatus:true,subscriptionEndsAt:true}}); } catch { return null; } }
export async function requireUser(){const u=await getUser(); if(!u||u.disabled) throw new Error("UNAUTHORIZED"); return u;}
export async function requireAdmin(){const u=await requireUser(); if(u.role!=="ADMIN")throw new Error("FORBIDDEN"); return u;}
