import fs from "node:fs";
import path from "node:path";
import ignore from "ignore";

const DEFAULT_EXCLUDE_DIRS = [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".next",
    "coverage"
];

const DEFAULT_EXCLUDE_FILES = [
    ".DS_Store",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb"
];

const DEFAULT_INCLUDE_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".vue",
    ".svelte",
    ".css",
    ".scss",
    ".less",
    ".json",
    ".md",
    ".mdx"
];

function createIgnorer(projectDir) {
    const ignorer = ignore();

    // Add .gitignore patterns if exists
    const gitignorePath = path.join(projectDir, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
        ignorer.add(gitignoreContent);
    }

    return ignorer;
}

function scanDirectory(dir, options = {}) {
    const {
        excludeDirs = DEFAULT_EXCLUDE_DIRS,
        excludeFiles = DEFAULT_EXCLUDE_FILES,
        includeExtensions = DEFAULT_INCLUDE_EXTENSIONS,
        ignorer = null,
        baseDir = dir
    } = options;

    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (ignorer && ignorer.ignores(relativePath)) {
            continue;
        }

        if (entry.isDirectory()) {
            if (!excludeDirs.includes(entry.name)) {
                results.push(...scanDirectory(fullPath, { ...options, baseDir }));
            }
        } else {
            const ext = path.extname(entry.name);
            if (
                !excludeFiles.includes(entry.name) &&
                includeExtensions.includes(ext)
            ) {
                results.push({
                    path: relativePath,
                    content: fs.readFileSync(fullPath, "utf-8"),
                    type: getFileType(ext),
                    size: fs.statSync(fullPath).size
                });
            }
        }
    }

    return results;
}

function getFileType(extension) {
    const typeMap = {
        ".js": "javascript",
        ".jsx": "react",
        ".ts": "typescript",
        ".tsx": "react-typescript",
        ".vue": "vue",
        ".svelte": "svelte",
        ".css": "stylesheet",
        ".scss": "stylesheet",
        ".less": "stylesheet",
        ".json": "json",
        ".md": "markdown",
        ".mdx": "markdown"
    };
    return typeMap[extension] || "unknown";
}

function analyzeProjectStructure(projectDir) {
    const hasPackageJson = fs.existsSync(path.join(projectDir, "package.json"));
    const packageJson = hasPackageJson
        ? JSON.parse(fs.readFileSync(path.join(projectDir, "package.json"), "utf-8"))
        : null;

    return {
        hasPackageJson,
        packageJson,
        hasSrcDir: fs.existsSync(path.join(projectDir, "src")),
        hasTypescript: fs.existsSync(path.join(projectDir, "tsconfig.json")),
        framework: detectFramework(packageJson),
    };
}

function detectFramework(packageJson) {
    if (!packageJson) return "unknown";

    const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };

    if (deps["next"]) return "nextjs";
    if (deps["vue"]) return "vue";
    if (deps["svelte"]) return "svelte";
    if (deps["react"]) return "react";
    if (deps["@angular/core"]) return "angular";
    return "unknown";
}

export function scanProject(projectDir) {
    const ignorer = createIgnorer(projectDir);
    const structure = analyzeProjectStructure(projectDir);
    const files = scanDirectory(projectDir, { ignorer });

    return {
        structure,
        files,
        dependencies: structure.packageJson?.dependencies || {},
        devDependencies: structure.packageJson?.devDependencies || {}
    };
} 