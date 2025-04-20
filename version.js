import { fromFileUrl } from "https://deno.land/std/path/mod.ts";
import { parse, compare, format } from "https://deno.land/std@0.224.0/semver/mod.ts";

const version = Deno.args[0];

if (!version) {
  console.error("❌ Missing version argument. Usage: deno run inject_version.js 1.2.3");
  Deno.exit(1);
}

//const { version } = JSON.parse(await Deno.readTextFile("deno.json"));

updateJsonVersion(version)
updateVersion(new URL("./readme.md", import.meta.url))
const dir = new URL("./type/", import.meta.url);

for await (const entry of Deno.readDir(dir)) {
  if (entry.isFile && entry.name.endsWith(".d.ts")) {
    const path = `${dir}${entry.name}`;
    updateVersion(path)
  }
}

function updateVersion(path) {
  const filestr = Deno.readTextFileSync(fromFileUrl(path));
  const updated = filestr.replaceAll(
    /(@version\s+)(?:[\d.]+|__VERSION__)/g,
    `$1${version}`,
  );
  Deno.writeTextFileSync(fromFileUrl(path), updated);
  console.log(`Updated version in ${path}`);
}

function updateJsonVersion(version) {
  const denoJsonPath = fromFileUrl(new URL("./deno.json", import.meta.url))
  const denoJson = JSON.parse(Deno.readTextFileSync(denoJsonPath));
  compareVersions(denoJson.version, version)
  denoJson.version = version;
  Deno.writeTextFileSync(denoJsonPath, JSON.stringify(denoJson, null, 2));
  console.log(`✅ Updated version in ${denoJsonPath} to ${version}`);
}

function compareVersions(oldVer, newVer) {
  oldVer = parse(oldVer);
  newVer = parse(newVer);
  if (compare(oldVer, newVer) < 0) return
  console.error(`❌ new version ${format(newVer)} must be higher than old ones ${format(oldVer)}`);
  Deno.exit(1);
}
