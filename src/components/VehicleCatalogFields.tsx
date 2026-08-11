"use client";
import { useEffect, useMemo, useState } from "react";
type Item = { id: string; name: string; source: string };
export function VehicleCatalogFields({ details, catalogModelId }: { details?: Record<string, string>; catalogModelId?: string | null }) {
  const [makes, setMakes] = useState<Item[]>([]), [models, setModels] = useState<Item[]>([]), [make, setMake] = useState(details?.make || ""), [model, setModel] = useState(details?.model || ""), [modelId, setModelId] = useState(catalogModelId || ""), [year, setYear] = useState(details?.year || ""), [vin, setVin] = useState(details?.vin || ""), [lookup, setLookup] = useState("");
  const makeId = useMemo(() => makes.find(x => x.name.toLowerCase() === make.toLowerCase())?.id, [makes, make]);
  useEffect(() => { const timer = setTimeout(() => fetch(`/api/vehicle-catalog?q=${encodeURIComponent(make)}`).then(x => x.json()).then(x => setMakes(x.items || [])).catch(() => {}), 180); return () => clearTimeout(timer); }, [make]);
  useEffect(() => { if (!makeId) { setModels([]); return; } fetch(`/api/vehicle-catalog?resource=models&makeId=${encodeURIComponent(makeId)}&q=${encodeURIComponent(model)}`).then(x => x.json()).then(x => setModels(x.items || [])).catch(() => {}); }, [makeId, model]);
  return <>
    <label>Year<input name="year" inputMode="numeric" minLength={4} maxLength={4} value={year} onChange={e => setYear(e.target.value)} required/></label>
    <label>Make<input name="make" list="vayro-makes" value={make} onChange={e => { setMake(e.target.value); setModelId(""); }} autoComplete="off" required/><datalist id="vayro-makes">{makes.map(x => <option value={x.name} key={x.id}>{x.source}</option>)}</datalist></label>
    <label>Model<input name="model" list="vayro-models" value={model} onChange={e => { const value = e.target.value; setModel(value); setModelId(models.find(x => x.name.toLowerCase() === value.toLowerCase())?.id || ""); }} autoComplete="off" required/><datalist id="vayro-models">{models.map(x => <option value={x.name} key={x.id}>{x.source}</option>)}</datalist><input type="hidden" name="catalogModelId" value={modelId}/></label>
    <label>VIN<input name="vin" minLength={17} maxLength={17} value={vin} onChange={e => setVin(e.target.value.toUpperCase())}/><button type="button" className="textbutton" onClick={async () => { setLookup("Checking NHTSA…"); const response = await fetch(`/api/vehicle-catalog/vin/${encodeURIComponent(vin)}?year=${encodeURIComponent(year)}`), result = await response.json(); if (!response.ok) { setLookup(result.error); return; } if (result.make) setMake(result.make); if (result.model) setModel(result.model); if (result.year) setYear(result.year); setLookup(result.errorCode === "0" ? `Verified against ${result.source}` : result.errorText || "Decoded with warnings"); }}>{lookup || "Decode with NHTSA"}</button></label>
  </>;
}
