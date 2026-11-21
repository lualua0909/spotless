/* eslint-disable @typescript-eslint/no-require-imports -- Run directly with Node. */
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

process.chdir(path.join(__dirname, ".."));

const quality = 70;
const includeWebp = process.argv.includes("--include-webp");
const imageExtension = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i;
const appIcon = "src/app/icon.png";

async function filesUnder(directory) {
  const entries = await fs.readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

async function main() {
  const [publicFiles, docsFiles, sourceFiles] = await Promise.all(
    ["public", "docs", "src"].map(filesUnder),
  );
  const images = [...publicFiles, ...docsFiles, ...sourceFiles].filter(
    (file) => imageExtension.test(file) && (includeWebp || !file.endsWith(".webp")),
  );
  const outputs = new Set(publicFiles.concat(docsFiles, sourceFiles));
  const references = new Map();
  const conversions = images.map((source) => {
    const target = source === appIcon ? "public/icon.webp" : source.replace(imageExtension, ".webp");
    if (target !== source && outputs.has(target)) throw new Error(`Image path collision: ${target}`);
    outputs.add(target);
    if (source.startsWith("public/") && target !== source) {
      references.set(source.slice("public".length), target.slice("public".length));
    }
    return { source, target, temp: `${target}.${process.pid}.tmp` };
  });
  const documents = [
    ...sourceFiles.filter((file) => /\.(?:css|json|tsx?)$/.test(file)),
    ...docsFiles.filter((file) => /\.(?:md|json)$/.test(file) && !file.includes("/source/")),
    "README.md",
  ];

  let originalBytes = 0;
  let outputBytes = 0;
  try {
    for (const { source, temp } of conversions) {
      originalBytes += (await fs.stat(source)).size;
      const input = sharp(source, { animated: true, autoOrient: true });
      const original = await input.metadata();
      const output = await input.webp({ quality }).toFile(temp);
      const converted = await sharp(temp, { animated: true }).metadata();
      if (converted.format !== "webp" || (converted.pages ?? 1) !== (original.pages ?? 1)) {
        throw new Error(`Could not preserve image format and frames: ${source}`);
      }
      outputBytes += output.size;
    }

    for (const { target, temp } of conversions) await fs.rename(temp, target);
    for (const document of documents) {
      const original = await fs.readFile(document, "utf8");
      let updated = original;
      for (const [source, target] of references) updated = updated.replaceAll(source, target);
      if (document.endsWith(".md")) {
        for (const { source, target } of conversions) {
          if (!source.startsWith("docs/") || source === target) continue;
          const directory = path.dirname(document);
          updated = updated.replaceAll(
            path.relative(directory, source),
            path.relative(directory, target),
          );
        }
      }
      if (updated !== original) await fs.writeFile(document, updated);
    }
    for (const { source, target } of conversions) {
      if (source !== target) await fs.unlink(source);
    }
  } finally {
    await Promise.all(conversions.map(({ temp }) => fs.rm(temp, { force: true })));
  }
  console.log(`${images.length} images at WebP quality ${quality}: ${originalBytes} → ${outputBytes} bytes`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
