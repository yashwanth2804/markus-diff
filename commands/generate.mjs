import fs from "node:fs";
import path from "node:path";
import { scanProject } from "../src/scanner.mjs";
import { generateOutput } from "../src/generator.mjs";

export function generateAnalysis(options) {
    const projectDir = path.resolve(options.dir);
    const outputPath = path.resolve(options.output);
    const name = options.name || path.basename(projectDir);
    const versionTag = options.versionTag;

    // Scan project directory
    const projectData = scanProject(projectDir);

    // Generate output
    const output = generateOutput({
        name,
        versionTag,
        ...projectData
    });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write output
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Generated code analysis at: ${outputPath}`);
} 