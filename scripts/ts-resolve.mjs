/**
 * Module-resolution hook that lets plain `node` import the app's TypeScript
 * catalog directly. Node 24 strips types itself, but its ESM resolver won't
 * follow the extensionless relative imports the `lib/` files use
 * (`import { ... } from "./hnm-products"`). This maps `./foo` -> `./foo.ts`
 * (or `./foo/index.ts`) when such a file exists, so seed scripts can pull real
 * product data out of lib/catalog.ts instead of duplicating its logic.
 *
 * Preload it:  node --import ./scripts/ts-resolve.mjs scripts/seed-products.mjs
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    const hasExtension = /\.[a-z0-9]+$/i.test(specifier);

    if (relative && !hasExtension && context.parentURL) {
      try {
        const path = fileURLToPath(new URL(specifier, context.parentURL));
        if (existsSync(`${path}.ts`)) return nextResolve(`${specifier}.ts`, context);
        if (existsSync(`${path}/index.ts`)) {
          return nextResolve(`${specifier}/index.ts`, context);
        }
      } catch {
        // Fall through to Node's default resolution below.
      }
    }

    return nextResolve(specifier, context);
  },
});
