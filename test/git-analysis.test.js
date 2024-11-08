import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'child_process';
import { analyzeWithGit } from '../commands/generate.mjs';

// Mock the scanner module
vi.mock('../src/scanner.mjs', () => {
    return {
        scanProject: (projectDir) => ({
            structure: {
                framework: 'unknown',
                hasTypescript: false,
                hasSrcDir: true,
                packageJson: {
                    dependencies: {},
                    devDependencies: {}
                }
            },
            files: [
                {
                    path: 'file1.js',
                    type: 'javascript',
                    size: 100,
                    content: 'console.log("Modified content");'
                },
                {
                    path: 'file2.js',
                    type: 'javascript',
                    size: 100,
                    content: 'console.log("Another file");'
                }
            ],
            dependencies: {},
            devDependencies: {}
        })
    };
});

describe('Git Analysis Tests', () => {
    const testDir = path.resolve(process.cwd(), 'test/__markus_tests');
    const testProjectDir = path.resolve(testDir, 'test-project');
    const outputDir = path.resolve(testDir, 'output');
    const outputFile = path.resolve(outputDir, 'analysis.json');

    console.log("@@@ testDir", testDir);
    console.log("@@@ testProjectDir", testProjectDir);
    console.log("@@@ outputDir", outputDir);
    console.log("@@@ outputFile", outputFile);

    // Setup test project and git repo before each test
    beforeEach(() => {
        // Create test project directory and output directory
        fs.mkdirSync(testProjectDir, { recursive: true });
        fs.mkdirSync(outputDir, { recursive: true });

        // Initialize git repo
        process.chdir(testProjectDir);
        execSync('git init');
        execSync('git config user.name "Test User"');
        execSync('git config user.email "test@example.com"');

        // Create some test files
        fs.writeFileSync('file1.js', 'console.log("Initial content");');
        fs.writeFileSync('file2.js', 'console.log("Another file");');

        // Initial commit
        execSync('git add .');
        execSync('git commit -m "Initial commit"');

        // Create and switch to feature branch
        execSync('git checkout -b feature/test-branch');

        // Make some changes
        fs.writeFileSync('file1.js', 'console.log("Modified content");');
        fs.writeFileSync('file3.js', 'console.log("New file");');

        // Commit changes
        execSync('git add .');
        execSync('git commit -m "Feature changes"');
    });

    // Cleanup after each test
    afterEach(() => {
        try {
            // Make sure we're not in the directory we're trying to delete
            process.chdir(process.cwd());
            fs.rmSync(testDir, { recursive: true, force: true });
        } catch (error) {
            console.warn('Cleanup warning:', error.message);
        }
    });

    it('should generate analysis with git information', async () => {
        const options = {
            dir: testProjectDir,
            output: outputFile,
            git: true
        };

        await analyzeWithGit(options);

        // Verify the output file exists
        expect(fs.existsSync(outputFile)).toBe(true);
        // log the output file content
        console.log("@@@ outputFile content", fs.readFileSync(outputFile, 'utf-8'));

        // Read and parse the output file
        const analysis = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));

        // Verify git information
        expect(analysis.git).toBeDefined();
        expect(analysis.git.sourceBranch).toBe('feature/test-branch');
        expect(analysis.git.targetBranch).toBe('master');
        expect(analysis.git.branchStatus).toBeDefined();
        expect(analysis.git.branchStatus.ahead).toBeGreaterThan(0);
        expect(analysis.git.lastCommit).toBeDefined();
        expect(analysis.git.lastCommit.subject).toBe('Feature changes');
    });

    it('should handle merge conflicts gracefully', async () => {
        // Create conflicting changes in master
        execSync('git checkout master');
        fs.writeFileSync('file1.js', 'console.log("Master change");');
        execSync('git add .');
        execSync('git commit -m "Master changes"');
        execSync('git checkout feature/test-branch');

        const options = {
            dir: testProjectDir,
            output: outputFile,
            git: true
        };

        // The analysis should handle the conflict and exit gracefully
        await expect(analyzeWithGit(options)).rejects.toThrow();
    });

    it('should restore working directory state after analysis', async () => {
        // Create some uncommitted changes
        fs.writeFileSync('uncommitted.js', 'console.log("Uncommitted");');

        const options = {
            dir: testProjectDir,
            output: outputFile,
            git: true
        };

        await analyzeWithGit(options);

        // Verify we're back on the original branch
        const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
        expect(currentBranch).toBe('feature/test-branch');

        // Verify uncommitted changes are preserved
        expect(fs.existsSync('uncommitted.js')).toBe(true);
    });
}); 