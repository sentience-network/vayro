import { syncNhtsaCatalog } from "../src/lib/vehicle-catalog";
import { db } from "../src/lib/db";
const scope = process.argv.includes("--makes-only") ? "makes" : "full";
syncNhtsaCatalog(scope).then(run => console.log({ status: run.status, makes: run.makesProcessed, models: run.modelsProcessed })).finally(() => db.$disconnect());
