import fs from "node:fs";
import path from "node:path";
import { scanProject } from "../src/scanner.mjs";
import { generateOutput } from "../src/generator.mjs";
import { getCurrentBranch, stashChanges, popStashedChanges, setupTemporaryMerge, cleanupTemporaryMerge, getGitInfo } from "../src/gitUtils.mjs";

export function generateAnalysis(options) {
    const projectDir = path.resolve(options.dir);
    const outputPath = path.resolve(options.output);
    const name = options.name || path.basename(projectDir);
    const versionTag = options.versionTag;

    // Get Git info if --git flag is used
    const gitInfo = options.git ? getGitInfo() : null;

    // Scan project directory
    const projectData = scanProject(projectDir);

    // Generate output
    const output = generateOutput({
        name,
        versionTag,
        gitInfo,
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

export async function analyzeWithGit(options) {
    const originalBranch = getCurrentBranch();
    const hadStashedChanges = stashChanges();

    try {
        // Setup temporary merge
        const mergeSuccess = setupTemporaryMerge();
        if (!mergeSuccess) {
            console.error('Error: Could not create temporary merge. Please resolve conflicts first.');
            process.exit(1);
        }

        // Generate analysis from the merged state
        await generateAnalysis(options);

        // Cleanup
        cleanupTemporaryMerge(originalBranch);

    } catch (error) {
        console.error('Error during Git-based analysis:', error.message);
        cleanupTemporaryMerge(originalBranch);
        process.exit(1);
    } finally {
        // Restore any stashed changes
        if (hadStashedChanges) {
            popStashedChanges();
        }
    }
} 