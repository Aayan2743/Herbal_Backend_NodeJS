



import sharp from "sharp";
import path from "path";
import fs from "fs";

export const convertToWebp = async (inputPath, outputDir) => {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${filename}.webp`);

  // ✅ Convert to webp
  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(outputPath);

  // ✅ SAFE DELETE (async + delayed)
  setTimeout(() => {
    fs.unlink(inputPath, (err) => {
      if (err) {
        console.warn("Original file delete skipped:", err.message);
      }
    });
  }, 500); // delay avoids EBUSY on Windows

  return `${filename}.webp`;
};
