import { createClient } from "@supabase/supabase-js";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  const lines = readFileSync(envPath, "utf8").split("\n");
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const TABLES = [
  "centres",
  "centre_links",
  "venue_numbers",
  "email_templates",
  "opening_hours",
  "sms_templates",
  "knowledge_library",
  "general_info",
];

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join(root, "backups", stamp);
mkdirSync(outDir, { recursive: true });

const summary = {};
for (const table of TABLES) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.error(`FAILED  ${table}: ${error.message}`);
    summary[table] = { error: error.message };
    continue;
  }
  writeFileSync(path.join(outDir, `${table}.json`), JSON.stringify(data, null, 2));
  console.log(`OK      ${table}: ${data.length} rows`);
  summary[table] = { rows: data.length };
}

writeFileSync(path.join(outDir, "_summary.json"), JSON.stringify(summary, null, 2));
console.log(`\nBackup written to backups/${stamp}/`);
