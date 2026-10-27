// Builds the packwiz pack (../pack) from the CreateSurvival Lite Prism instance.
//   node tools/build-pack.mjs [instance .minecraft folder]
// Mods, resource packs and shader packs found on Modrinth (by SHA-1) become .pw.toml download entries; jars Modrinth
// doesn't know are handed to `packwiz curseforge detect`; what neither knows (our own mods) goes in as a file.
// Disabled jars are left out; of two jars with the same mod id only the newest goes in. Configs, KubeJS and the
// createsurvival folder (sync script, presets) are copied, then overrides/ (files players get as they are in this repo).
// options.txt stays out: players keep their own. Finally
// `packwiz refresh` writes the index.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process'; import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const { entries } = createRequire(import.meta.url)('./zipread.cjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// the instance the pack is made from (not the one the installer set up, folder createsurvival-lite)
const SOURCES = ['CreateSurvival Lite OG', 'CreateSurvival Lite'].map(f => path.join(process.env.APPDATA, 'PrismLauncher', 'instances', f, '.minecraft'));
const SRC = process.argv[2] || SOURCES.find(s => fs.existsSync(path.join(s, 'mods'))) || SOURCES[0];
const OUT = path.join(ROOT, 'pack');
const PACKWIZ = path.join(ROOT, 'tools', 'bin', 'packwiz.exe');
const UA = 'Rodistoo/createsurvival-lite-pack (pack builder)';

// what of the instance goes into the pack
const COPY_DIRS = ['config', 'kubejs', 'defaultconfigs', 'moonlight-global-datapacks', 'bivrik'];
const SKIP = [/\.bak$/i, /\.old$/i, /(^|\/)createsurvival_core-history(\/|$)/, /(^|\/)_0euphoria/i, /(^|\/)\.cache(\/|$)/,
  // not used: the edited Just Colored Lighting shaders (don't work), resource packs nobody has switched on
  /^shaderpacks\/Just Colored Lighting .*\+ CreateSurvival\.zip(\.txt)?$/, /^resourcepacks\/USWRP-10\.zip$/,
  /^config\/paxi\/resourcepacks\/(Better Grounds|Better SB Upgrades|Clear Glass Pack 1\.21|Lower Shield)\.zip$/,
  // state of the instance, not settings: Chunksmith's saved pregen tasks and fault log, spark's profiler history
  /^config\/chunksmith\/(tasks\/|worldgen-faults\.txt$)/, /^config\/spark\/activity\.json$/];
// mods only for the instance, never in the pack (by jar name), and their configs: Xaero's maps (testing), Axiom and
// Connector (only Axiom needs it)
const TEST_ONLY_MODS = [/^xaero/i, /^axiom/i, /^connector-/i];
SKIP.push(/^config\/xaero/i, /^config\/axiom/i, /^config\/connector/i);
const skipped = rel => SKIP.some(re => re.test(rel));

function copyTree(from, to, base = '') {
  if (!fs.existsSync(from)) return;
  for (const f of fs.readdirSync(from)) {
    const rel = base ? base + '/' + f : f, src = path.join(from, f), dst = path.join(to, f);
    if (skipped(rel)) continue;
    if (fs.statSync(src).isDirectory()) copyTree(src, dst, rel);
    else { fs.mkdirSync(to, { recursive: true }); fs.copyFileSync(src, dst); }
  }
}
const tomlString = s => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';

// the mod id and version a jar declares (newest wins among the same id)
function modInfo(file) {
  let id = null, version = '0', manifestVersion = null;
  try {
    const es = entries(file);
    for (const e of es) {
      if (e.name === 'META-INF/neoforge.mods.toml' || (e.name === 'META-INF/mods.toml' && !id)) {
        const s = e.read().toString();
        const m = s.match(/\[\[mods\]\][\s\S]*?modId\s*=\s*"([^"]+)"/); if (m) id = m[1];
        const v = s.match(/\[\[mods\]\][\s\S]*?\bversion\s*=\s*"([^"]+)"/); if (v) version = v[1];
      } else if (e.name === 'fabric.mod.json' && !id) {
        try { const j = JSON.parse(e.read().toString()); id = j.id; version = j.version; } catch {}
      } else if (e.name === 'META-INF/MANIFEST.MF') {
        const m = e.read().toString().match(/Implementation-Version:\s*(\S+)/); if (m) manifestVersion = m[1];
      }
    }
    es.close && es.close();
  } catch {}
  if (version.includes('${') && manifestVersion) version = manifestVersion;
  return { id, version };
}
// a Fabric mod (only runs through Sinytra Connector, which stays out of the pack): its fabric.mod.json id, else null
function fabricOnlyId(file) {
  try {
    const es = entries(file), names = es.map(e => e.name);
    if (names.includes('META-INF/neoforge.mods.toml') || names.includes('META-INF/mods.toml')) return null;
    const fmj = es.find(e => e.name === 'fabric.mod.json');
    return fmj ? JSON.parse(fmj.read().toString()).id || '?' : null;
  } catch { return null; }
}
function newer(a, b) { // whether version a > b
  const pa = String(a).split(/[^0-9]+/).filter(Boolean).map(Number), pb = String(b).split(/[^0-9]+/).filter(Boolean).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const x = pa[i] || 0, y = pb[i] || 0; if (x !== y) return x > y; }
  return false;
}

async function modrinth(files) { // file path -> {sha1, sha512, version}
  const info = {};
  for (const f of files) {
    const buf = fs.readFileSync(f);
    info[f] = { sha1: crypto.createHash('sha1').update(buf).digest('hex'), sha512: crypto.createHash('sha512').update(buf).digest('hex') };
  }
  if (!files.length) return info;
  const res = await fetch('https://api.modrinth.com/v2/version_files', { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ hashes: Object.values(info).map(i => i.sha1), algorithm: 'sha1' }) });
  if (!res.ok) throw new Error('Modrinth ' + res.status);
  const found = await res.json();
  for (const i of Object.values(info)) {
    const v = found[i.sha1]; if (!v) continue;
    i.version = v; i.file = v.files.find(x => x.hashes.sha1 === i.sha1);
  }
  const ids = [...new Set(Object.values(info).filter(i => i.version).map(i => i.version.project_id))];
  const titles = {};
  for (let k = 0; k < ids.length; k += 100) {
    const r = await fetch('https://api.modrinth.com/v2/projects?ids=' + encodeURIComponent(JSON.stringify(ids.slice(k, k + 100))), { headers: { 'User-Agent': UA } });
    if (r.ok) for (const p of await r.json()) titles[p.id] = p.title;
  }
  for (const i of Object.values(info)) if (i.version) i.title = titles[i.version.project_id] || i.file.filename;
  return info;
}
function writeModrinthEntry(dir, i) {
  const slug = i.file.filename.replace(/\.(jar|zip)$/i, '').replace(/[^A-Za-z0-9._-]+/g, '-').toLowerCase();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, slug + '.pw.toml'), [
    `name = ${tomlString(i.title)}`, `filename = ${tomlString(i.file.filename)}`, 'side = "both"', '',
    '[download]', `url = ${tomlString(i.file.url)}`, 'hash-format = "sha512"', `hash = ${tomlString(i.file.hashes.sha512)}`, '',
    '[update]', '[update.modrinth]', `mod-id = ${tomlString(i.version.project_id)}`, `version = ${tomlString(i.version.id)}`, ''
  ].join('\n'));
}
const packwiz = (...args) => execFileSync(PACKWIZ, args, { cwd: OUT, stdio: 'inherit' });

// ---- build ----
if (!fs.existsSync(path.join(SRC, 'mods'))) throw new Error('No instance at ' + SRC);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const mmc = JSON.parse(fs.readFileSync(path.join(SRC, '..', 'mmc-pack.json'), 'utf8'));
const neoforge = mmc.components.find(c => c.uid === 'net.neoforged').version;
const minecraft = mmc.components.find(c => c.uid === 'net.minecraft').version;
const now = new Date(), pad = n => String(n).padStart(2, '0');
const packVersion = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}.${pad(now.getHours())}${pad(now.getMinutes())}`;
packwiz('init', '--name', 'CreateSurvival Lite', '--author', 'Rodistoo', '--version', packVersion, '--mc-version', minecraft,
  '--modloader', 'neoforge', '--neoforge-version', neoforge, '-r', '-y');

// mods: enabled jars, newest per mod id
const modsDir = path.join(SRC, 'mods');
const byId = {}, plain = [];
for (const f of fs.readdirSync(modsDir).filter(f => /\.(jar|zip)$/i.test(f))) {
  const full = path.join(modsDir, f);
  if (!f.toLowerCase().endsWith('.jar')) { console.log(`(${f} left out: only jars load from mods)`); continue; }
  if (TEST_ONLY_MODS.some(re => re.test(f))) { console.log(`(${f} left out: only for testing)`); continue; }
  const fabric = fabricOnlyId(full);
  if (fabric) {
    // and its configs (config/<id>.toml, config/<id>/...)
    console.log(`(${f} left out: a Fabric mod, needs Connector)`);
    const escaped = fabric.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    SKIP.push(new RegExp(`^config/${escaped}([._-]|/|$)`, 'i'));
    continue;
  }
  const { id, version } = modInfo(full);
  if (!id) { plain.push(full); continue; }
  if (!byId[id] || newer(version, byId[id].version)) {
    if (byId[id]) console.log(`(${path.basename(byId[id].file)} left out: ${f} is newer)`);
    byId[id] = { file: full, version };
  } else console.log(`(${f} left out: ${path.basename(byId[id].file)} is newer)`);
}
const modFiles = [...new Set(Object.values(byId).map(m => m.file))].concat(plain);
const mods = await modrinth(modFiles);
const unknown = [];
for (const f of modFiles) {
  if (mods[f].version) writeModrinthEntry(path.join(OUT, 'mods'), mods[f]);
  else { fs.mkdirSync(path.join(OUT, 'mods'), { recursive: true }); fs.copyFileSync(f, path.join(OUT, 'mods', path.basename(f))); unknown.push(path.basename(f)); }
}
console.log(`mods: ${modFiles.length - unknown.length} from Modrinth, ${unknown.length} to look up on CurseForge`);

// resource packs and shader packs
for (const kind of ['resourcepacks', 'shaderpacks']) {
  const dir = path.join(SRC, kind); if (!fs.existsSync(dir)) continue;
  const zips = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.zip') && !skipped(kind + '/' + f)).map(f => path.join(dir, f));
  const found = await modrinth(zips);
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (skipped(kind + '/' + f)) continue;
    if (found[full] && found[full].version) writeModrinthEntry(path.join(OUT, kind), found[full]);
    else if (fs.statSync(full).isDirectory()) copyTree(full, path.join(OUT, kind, f), kind + '/' + f);
    else { fs.mkdirSync(path.join(OUT, kind), { recursive: true }); fs.copyFileSync(full, path.join(OUT, kind, f)); }
  }
}

for (const d of COPY_DIRS) copyTree(path.join(SRC, d), path.join(OUT, d), d);
// packs inside the copied folders (Paxi's global resource and data packs): linked when Modrinth has them
const zips = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(zip|jar)$/i.test(f)) zips.push(p); } })
  (path.join(OUT, 'config'));
const linked = await modrinth(zips);
for (const z of zips) if (linked[z].version) { writeModrinthEntry(path.dirname(z), linked[z]); fs.rmSync(z); }
console.log(`packs in config: ${zips.filter(z => linked[z].version).length} of ${zips.length} linked from Modrinth`);
copyTree(path.join(ROOT, 'createsurvival'), path.join(OUT, 'createsurvival'), 'createsurvival');
// files players get as they are in this repo, not as they are in the instance (where Paul has his own settings):
// overrides/config/DistantHorizons.toml (distant generation on, CPU left at DH's own Balanced default)
copyTree(path.join(ROOT, 'overrides'), OUT);
fs.writeFileSync(path.join(OUT, 'createsurvival', 'mmc-pack.json'), JSON.stringify(mmc, null, 4));
fs.writeFileSync(path.join(OUT, '.packwizignore'), '.packwizignore\n');

// what Modrinth doesn't have: CurseForge, else the file itself
packwiz('curseforge', 'detect', '-y');
packwiz('refresh');
const left = fs.readdirSync(path.join(OUT, 'mods')).filter(f => /\.(jar|zip)$/i.test(f));
console.log(`\nPack ${packVersion} (Minecraft ${minecraft}, NeoForge ${neoforge}) built in ${OUT}`);
console.log(`Uploaded as files (on neither Modrinth nor CurseForge): ${left.join(', ') || 'none'}`);
