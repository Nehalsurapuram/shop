/**
 * Pushes the variables in .env.local to the linked Vercel project's Production
 * environment, so a deploy has the same config the app runs with locally.
 *
 * Prereqs (run these once, they're interactive so this script can't do them):
 *   npx vercel login
 *   npx vercel link            # pick the existing "shop" project
 *
 * Then:
 *   node scripts/push-vercel-env.mjs
 *
 * BETTER_AUTH_URL is rewritten to the production URL — the localhost value that
 * works in dev would break sign-in and Google OAuth in production.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const PROD_URL = "https://shop-pearl-nine.vercel.app";
const TARGET = "production";

// Values that must differ from .env.local when running on Vercel.
const OVERRIDES = {
  BETTER_AUTH_URL: PROD_URL,
};

// Per-variable value transforms applied on push. Unlike OVERRIDES (a fixed
// replacement), these rewrite the local value so it stays correct in production.
const TRANSFORMS = {
  // Force full TLS verification. pg currently treats require/prefer/verify-ca as
  // verify-full, but pg v9 drops that alias — pinning verify-full keeps Neon
  // connections verifying the cert chain + hostname and silences the SSL warning.
  DATABASE_URL: (value) =>
    value.replace(/([?&]sslmode=)(require|prefer|verify-ca)\b/i, "$1verify-full"),
};

// Secrets are masked in all output so nothing sensitive lands in a log.
const SECRETS = new Set([
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "RAZORPAY_KEY_SECRET",
]);

function mask(name, value) {
  if (!SECRETS.has(name)) return value;
  if (value.length <= 6) return "••••••";
  return value.slice(0, 3) + "…" + value.slice(-2);
}

function parseEnv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    // Strip one layer of surrounding quotes if present.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value) out[m[1]] = value;
  }
  return out;
}

function vercel(args, input) {
  // shell:true so `vercel` resolves via PATH / npx shim on Windows too.
  return spawnSync("npx", ["vercel", ...args], {
    input,
    encoding: "utf8",
    shell: true,
  });
}

// --- preflight ------------------------------------------------------------

if (!existsSync(".env.local")) {
  console.error("No .env.local found in the current directory. Run this from the project root.");
  process.exit(1);
}

if (!existsSync(".vercel/project.json")) {
  console.error(
    "This project isn't linked to Vercel yet.\n" +
      "Run:  npx vercel login   then   npx vercel link\n" +
      "and pick your existing project, then re-run this script.",
  );
  process.exit(1);
}

const whoami = vercel(["whoami"]);
if (whoami.status !== 0) {
  console.error("Not logged in to Vercel. Run:  npx vercel login");
  process.exit(1);
}

const env = parseEnv(readFileSync(".env.local", "utf8"));
const names = Object.keys(env);
if (names.length === 0) {
  console.error(".env.local has no variables to push.");
  process.exit(1);
}

console.log(`Pushing ${names.length} variable(s) to Vercel [${TARGET}]:\n`);

let ok = 0;
let failed = 0;

for (const name of names) {
  const raw = OVERRIDES[name] ?? env[name];
  const value = TRANSFORMS[name] ? TRANSFORMS[name](raw) : raw;
  const note = OVERRIDES[name]
    ? "  (overridden for production)"
    : value !== raw
      ? "  (normalized for production)"
      : "";

  // `vercel env add` errors if the name already exists, so remove first. The
  // remove is best-effort — a missing var just means nothing to replace.
  vercel(["env", "rm", name, TARGET, "-y"]);
  const add = vercel(["env", "add", name, TARGET], value);

  if (add.status === 0) {
    ok++;
    console.log(`  ✓ ${name} = ${mask(name, value)}${note}`);
  } else {
    failed++;
    console.log(`  ✗ ${name} — ${(add.stderr || add.stdout || "failed").trim().split("\n").pop()}`);
  }
}

console.log(`\n${ok} set, ${failed} failed.`);
console.log(
  failed === 0
    ? "\nNext: redeploy so the new values take effect —\n  npx vercel --prod\n" +
        "Then add this Google OAuth redirect URI in Google Cloud Console:\n" +
        `  ${PROD_URL}/api/auth/callback/google`
    : "\nSome variables failed — check the messages above and re-run.",
);

process.exit(failed === 0 ? 0 : 1);
