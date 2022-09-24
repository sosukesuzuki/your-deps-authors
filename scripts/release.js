#!/usr/bin/env node

import fs from "node:fs/promises";
import { parseArgs } from "node:util";
import { execa } from "execa";

const {
  values: { release },
} = parseArgs({
  options: {
    release: {
      type: "string",
    },
  },
});

assertRelease(release);

await execa("npm", ["version", release]);

console.log("Running 'git push origin HEAD'...");
await execa("git", ["push", "origin", "HEAD"]);

console.log("Running 'git push origin --tags'...");
await execa("git", ["push", "origin", "--tags"]);

const pkg = JSON.parse(
  await fs.readFile(new URL("../package.json", import.meta.url), "utf-8")
);

console.log("Done!");

console.log(
  `Open https://github.com/sosukesuzuki/your-deps-authors/releases/new?tag=v${pkg.version} and create new release.`
);

function assertRelease(value) {
  if (!["major", "minor", "patch"].includes(value)) {
    throw new Error(
      `${value} is not valid release. Must be 'major' or 'minor' or 'patch'.`
    );
  }
}
