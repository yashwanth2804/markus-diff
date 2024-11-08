#!/usr/bin/env node

import { program } from "commander";
import { generateAnalysis, analyzeWithGit } from "./commands/generate.mjs";
import { initializeProject } from "./commands/init.mjs";
import { execSync } from "child_process";

// Default command (no subcommand needed)
program
    .name("project-differ")
    .description("CLI to analyze and reconstruct project structures")
    .version("1.0.0")
    .option("-d, --dir <directory>", "Project directory to analyze", process.cwd())
    .option("-o, --output <path>", "Output file path", "./code.json")
    .option("-n, --name <name>", "Project name")
    .option("-v, --version-tag <version>", "Version tag for the analysis", "1.0.0")
    .option("--git", "Analyze changes from current branch against master")
    .action(async (options) => {
        if (options.git) {
            await analyzeWithGit(options);
        } else {
            generateAnalysis(options);
        }
    });

// Init command
program
    .command("init")
    .description("Initialize project from analysis JSON")
    .requiredOption("-i, --input <file>", "Input JSON file path")
    .option("-d, --dir <directory>", "Output directory", process.cwd())
    .action(initializeProject);

program.parse(); 