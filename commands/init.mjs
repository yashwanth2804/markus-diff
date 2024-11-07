import fs from "node:fs";
import path from "node:path";

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writePackageJson(targetDir, dependencies, devDependencies) {
    const packageJson = {
        name: path.basename(targetDir),
        version: "1.0.0",
        dependencies: dependencies || {},
        devDependencies: devDependencies || {}
    };

    fs.writeFileSync(
        path.join(targetDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );
}

export function initializeProject(options) {
    try {
        const inputPath = path.resolve(options.input);
        const targetDir = path.resolve(options.dir);

        if (!fs.existsSync(inputPath)) {
            console.error(`Error: Input file not found: ${inputPath}`);
            process.exit(1);
        }

        const jsonContent = fs.readFileSync(inputPath, 'utf-8');
        const jsonData = JSON.parse(jsonContent);

        if (!jsonData.files || !Array.isArray(jsonData.files)) {
            console.error('Error: Invalid JSON structure. Missing or invalid "files" array.');
            process.exit(1);
        }

        console.log(`Reconstructing project in: ${targetDir}`);

        // Create the target directory if it doesn't exist
        ensureDirectoryExists(targetDir);

        // Write package.json with dependencies
        writePackageJson(targetDir, jsonData.dependencies, jsonData.devDependencies);

        // Process all files
        for (const file of jsonData.files) {
            const filePath = path.join(targetDir, file.path);
            const fileDir = path.dirname(filePath);

            // Create directory structure if needed
            ensureDirectoryExists(fileDir);

            // Write file content
            fs.writeFileSync(filePath, file.content);
            console.log(`Created: ${file.path}`);
        }

        // Create src directory if project uses it
        if (jsonData.structure.hasSrcDir) {
            ensureDirectoryExists(path.join(targetDir, 'src'));
        }

        // Create tsconfig.json if project uses TypeScript
        if (jsonData.structure.hasTypescript) {
            const tsConfig = {
                compilerOptions: {
                    target: "es5",
                    lib: ["dom", "dom.iterable", "esnext"],
                    allowJs: true,
                    skipLibCheck: true,
                    strict: true,
                    forceConsistentCasingInFileNames: true,
                    noEmit: true,
                    esModuleInterop: true,
                    module: "esnext",
                    moduleResolution: "node",
                    resolveJsonModule: true,
                    isolatedModules: true,
                    jsx: "preserve",
                    incremental: true
                },
                include: ["**/*.ts", "**/*.tsx"],
                exclude: ["node_modules"]
            };
            fs.writeFileSync(
                path.join(targetDir, 'tsconfig.json'),
                JSON.stringify(tsConfig, null, 2)
            );
        }

        console.log('\nProject reconstruction completed!');
        console.log(`\nFramework detected: ${jsonData.structure.framework}`);
        console.log(`Total files created: ${jsonData.stats.totalFiles}`);
        console.log('\nNext steps:');
        console.log('1. cd', path.relative(process.cwd(), targetDir));
        console.log('2. npm install');
        if (jsonData.structure.framework !== 'unknown') {
            console.log(`3. Follow ${jsonData.structure.framework} setup instructions`);
        }

    } catch (error) {
        console.error('Error during project reconstruction:', error.message);
        process.exit(1);
    }
} 