#!/usr/bin/env node

import { program } from "commander";
import { generateAnalysis } from "./commands/generate.mjs";
import { initializeProject } from "./commands/init.mjs";

// Default command (no subcommand needed)
program
    .name("project-differ")
    .description("CLI to analyze and reconstruct project structures")
    .version("1.0.0")
    .option("-d, --dir <directory>", "Project directory to analyze", process.cwd())
    .option("-o, --output <path>", "Output file path", "./code.json")
    .option("-n, --name <name>", "Project name")
    .option("-v, --version-tag <version>", "Version tag for the analysis", "1.0.0")
    .action(generateAnalysis);

// Init command
program
    .command("init")
    .description("Initialize project from analysis JSON")
    .requiredOption("-i, --input <file>", "Input JSON file path")
    .option("-d, --dir <directory>", "Output directory", process.cwd())
    .action(initializeProject);

program.parse(); 