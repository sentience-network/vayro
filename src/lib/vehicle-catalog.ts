import { db } from "@/lib/db";

const NHTSA_API = "https://vpic.nhtsa.dot.gov/api/vehicles";
const NHTSA_SOURCE = "https://vpic.nhtsa.dot.gov/api/Home/Index";
type NhtsaMake = { Make_ID: number; Make_Name: string };
type NhtsaModel = NhtsaMake & { Model_ID: number; Model_Name: string };
const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toUpperCase();
const chunks = <T,>(items: T[], size = 750) => Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, (i + 1) * size));

async function nhtsa<T>(path: string) {
  const response = await fetch(`${NHTSA_API}/${path}${path.includes("?") ? "&" : "?"}format=json`, { headers: { accept: "application/json", "user-agent": "Vayro vehicle catalog/1.0" }, signal: AbortSignal.timeout(180_000), cache: "no-store" });
  if (!response.ok) throw new Error(`NHTSA returned ${response.status}`);
  const body = await response.json() as { Results?: T[] };
  if (!Array.isArray(body.Results)) throw new Error("NHTSA returned an invalid catalog response");
  return body.Results;
}

export async function syncNhtsaCatalog(scope: "makes" | "full" = "full") {
  const run = await db.vehicleCatalogSync.create({ data: { source: "NHTSA" } });
  try {
    const makes = (await nhtsa<NhtsaMake>("GetAllMakes")).filter(x => x.Make_ID && x.Make_Name?.trim());
    for (const batch of chunks(makes)) await db.vehicleCatalogMake.createMany({ data: batch.map(make => ({ source: "NHTSA", sourceId: String(make.Make_ID), name: make.Make_Name.trim(), normalizedName: normalize(make.Make_Name), vehicleTypes: [], sourceUrl: NHTSA_SOURCE })), skipDuplicates: true });
    await db.vehicleCatalogMake.updateMany({ where: { source: "NHTSA", sourceId: { in: makes.map(x => String(x.Make_ID)) } }, data: { active: true, lastSyncedAt: new Date() } });
    let modelsProcessed = 0;
    if (scope === "full") {
      const models = (await nhtsa<NhtsaModel>("GetModelsForMakeId/0")).filter(x => x.Make_ID && x.Model_ID && x.Model_Name?.trim());
      const makeRows = await db.vehicleCatalogMake.findMany({ where: { source: "NHTSA" }, select: { id: true, sourceId: true } });
      const makeIds = new Map(makeRows.map(x => [x.sourceId, x.id]));
      const unique = [...new Map(models.map(x => [`${x.Model_ID}`, x])).values()].filter(x => makeIds.has(String(x.Make_ID)));
      for (const batch of chunks(unique)) await db.vehicleCatalogModel.createMany({ data: batch.map(model => ({ source: "NHTSA", sourceId: String(model.Model_ID), makeId: makeIds.get(String(model.Make_ID))!, name: model.Model_Name.trim(), normalizedName: normalize(model.Model_Name), vehicleTypes: [], sourceUrl: NHTSA_SOURCE })), skipDuplicates: true });
      modelsProcessed = unique.length;
    }
    return await db.vehicleCatalogSync.update({ where: { id: run.id }, data: { status: "COMPLETED", makesProcessed: makes.length, modelsProcessed, completedAt: new Date() } });
  } catch (error) {
    await db.vehicleCatalogSync.update({ where: { id: run.id }, data: { status: "FAILED", error: String(error).slice(0, 1000), completedAt: new Date() } });
    throw error;
  }
}

export async function decodeNhtsaVin(vin: string, year?: number) {
  const clean = vin.trim().toUpperCase();
  const rows = await nhtsa<Record<string, string | null>>(`DecodeVinValues/${encodeURIComponent(clean)}?${year ? `modelyear=${year}&` : ""}`);
  const item = rows[0];
  if (!item) throw new Error("VIN was not found");
  return { vin: clean, make: item.Make, model: item.Model, year: item.ModelYear, vehicleType: item.VehicleType, bodyClass: item.BodyClass, fuelType: item.FuelTypePrimary, manufacturer: item.Manufacturer, errorCode: item.ErrorCode, errorText: item.ErrorText, source: "NHTSA vPIC", sourceUrl: NHTSA_SOURCE };
}
