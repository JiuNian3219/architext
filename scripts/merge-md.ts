import fs from "fs";
import path from "path";

const inputDir = process.argv[2];
const outputFile = process.argv[3] || "merged_output.md";

if (!inputDir) {
  console.error("Please provide an input directory path.");
  console.error("Usage: npm run merge-md <input-dir> [output-file]");
  process.exit(1);
}

const absoluteInputDir = path.resolve(process.cwd(), inputDir);
const absoluteOutputFile = path.resolve(process.cwd(), outputFile);

async function getMdFilesRecursive(dir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getMdFilesRecursive(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function mergeMarkdownFiles() {
  try {
    const mdFiles = (await getMdFilesRecursive(absoluteInputDir)).sort();

    if (mdFiles.length === 0) {
      console.log("No Markdown files found in the specified directory.");
      return;
    }

    let mergedContent = "";

    for (const filePath of mdFiles) {
      const content = await fs.promises.readFile(filePath, "utf-8");
      // Calculate relative path for the title
      const relativePath = path
        .relative(absoluteInputDir, filePath)
        .replace(/\\/g, "/");

      // 添加文件标题和空格
      // Add file title and spacing
      mergedContent += `\n\n# ${relativePath}\n\n${content}\n`;
    }

    await fs.promises.writeFile(
      absoluteOutputFile,
      mergedContent.trim(),
      "utf-8",
    );
    console.log(
      `Successfully merged ${mdFiles.length} files into ${outputFile}`,
    );
  } catch (error) {
    console.error("Error merging files:", error);
    process.exit(1);
  }
}

mergeMarkdownFiles();
