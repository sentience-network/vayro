import { db } from "@/lib/db";
export async function resolveCatalogSelection(value: unknown, details: Record<string,string>) {
  if (typeof value !== "string" || !value) return { catalogModelId: null, details };
  const model = await db.vehicleCatalogModel.findFirst({ where: { id: value, active: true }, include: { make: true } });
  if (!model) throw new Error("Selected catalog vehicle is unavailable");
  return { catalogModelId: model.id, details: { ...details, make: model.make.name, model: model.name, _catalogSource: model.source, _catalogSourceUrl: model.sourceUrl } };
}
