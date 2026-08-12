"use client";
import {useEffect,useState} from "react";

declare global{interface Window{adsbygoogle?:Record<string,unknown>[]}}

export function AdSense({publisherId,slotId}:{publisherId:string;slotId:string}){
  const configured=/^ca-pub-\d+$/.test(publisherId)&&/^\d+$/.test(slotId);
  const[consent,setConsent]=useState<"unknown"|"accepted"|"declined">("unknown");
  const[ready,setReady]=useState(false);
  useEffect(()=>{if(!configured)return;const saved=localStorage.getItem("vayro-ad-consent");setConsent(saved==="accepted"?"accepted":saved==="declined"?"declined":"unknown")},[configured]);
  useEffect(()=>{if(!configured||consent!=="accepted")return;const existing=document.querySelector<HTMLScriptElement>(`script[data-vayro-adsense="true"]`);if(existing){setReady(true);return}const script=document.createElement("script");script.async=true;script.crossOrigin="anonymous";script.dataset.vayroAdsense="true";script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;script.onload=()=>setReady(true);document.head.appendChild(script)},[configured,consent,publisherId]);
  useEffect(()=>{if(!ready)return;try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch{}},[ready]);
  if(!configured)return null;
  const choose=(choice:"accepted"|"declined")=>{localStorage.setItem("vayro-ad-consent",choice);setConsent(choice)};
  return <>{consent==="unknown"&&<aside className="adconsent" role="dialog" aria-label="Advertising choice"><div><b>Your advertising choice</b><p>Free Vayro pages can use Google ads. Accept to allow advertising technology, or decline to browse without it. Plus members never see ads.</p></div><div className="actions"><button className="outline" onClick={()=>choose("declined")}>Decline</button><button className="button" onClick={()=>choose("accepted")}>Accept ads</button></div></aside>}{consent==="accepted"&&<aside className="adunit" aria-label="Advertisement"><small>Advertisement</small><ins className="adsbygoogle" style={{display:"block"}} data-ad-client={publisherId} data-ad-slot={slotId} data-ad-format="auto" data-full-width-responsive="true"/></aside>}</>;
}
