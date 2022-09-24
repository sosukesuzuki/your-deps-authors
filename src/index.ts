import fs from "node:fs/promises";
import { pkgUp } from "pkg-up";
import { table } from "table";
// @ts-expect-error
import npmFetch from "npm-registry-fetch";

const args = process.argv.splice(2);
if (args.length > 1) {
  console.log("args must be less than 2.");
  process.exit(1);
}

let packageJsonPath: string | undefined;
if (args.length === 1) {
  packageJsonPath = args[0];
} else {
  packageJsonPath = await pkgUp();
}

if (packageJsonPath === undefined) {
  console.log("package.json not found.");
  process.exit(1);
}

const data = await fs.readFile(packageJsonPath, "utf-8");
const jsonData = JSON.parse(data);

const dependencies: Record<string, string> = Object.hasOwn(
  jsonData,
  "dependencies"
)
  ? jsonData.dependencies
  : {};

const devDependencies: Record<string, string> = Object.hasOwn(
  jsonData,
  "devDependencies"
)
  ? jsonData.devDependencies
  : {};

const tableData: string[][] = [["name", "author", "maintainers"]];

await Promise.all(
  [...Object.keys(dependencies), ...Object.keys(devDependencies)].map(
    async (packageName) => {
      const meta = await npmFetch.json(`/${packageName}`);
      const maintainers = meta.maintainers
        .map((maintainer: { name: string }) => maintainer.name)
        .join(",\n");
      const row: string[] = [
        meta.name,
        meta.author ? meta.author.name : "",
        maintainers,
      ];
      tableData.push(row);
    }
  )
);

process.stdout.write(table(tableData));
