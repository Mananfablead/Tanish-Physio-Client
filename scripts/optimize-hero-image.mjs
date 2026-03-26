import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const projectRoot = path.resolve(process.cwd());
const inputPath = path.join(projectRoot, "src", "assets", "hero-physio.png");
const outDir = path.join(projectRoot, "public", "images");

const widths = [480, 768, 960, 1200];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function run() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing input image: ${inputPath}`);
  }

  ensureDir(outDir);

  // Keep an original copy as an explicit fallback.
  fs.copyFileSync(inputPath, path.join(outDir, "hero-physio.png"));

  await Promise.all(
    widths.flatMap((w) => {
      const base = sharp(inputPath)
        .resize({ width: w, withoutEnlargement: true })
        .toColorspace("srgb");

      return [
        base
          .clone()
          .avif({ quality: 50, effort: 6 })
          .toFile(path.join(outDir, `hero-physio-${w}.avif`)),
        base
          .clone()
          .webp({ quality: 70, effort: 5 })
          .toFile(path.join(outDir, `hero-physio-${w}.webp`)),
      ];
    })
  );

  // Tiny blurred placeholder for instant paint.
  await sharp(inputPath)
    .resize({ width: 24 })
    .blur(8)
    .webp({ quality: 35 })
    .toFile(path.join(outDir, "hero-physio-lqip.webp"));

  // eslint-disable-next-line no-console
  console.log(`Wrote optimized images to ${path.relative(projectRoot, outDir)}`);
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

