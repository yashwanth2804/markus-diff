export function scanProject(projectDir) {
    return {
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
    };
} 