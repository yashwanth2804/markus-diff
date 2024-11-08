export function generateOutput({
    name,
    structure,
    files,
    dependencies,
    devDependencies,
    versionTag
}) {
    return {
        name,
        type: "project:analysis",
        version: versionTag,
        generatorVersion: "1.0.1",
        timestamp: new Date().toISOString(),
        structure: {
            framework: structure.framework,
            hasTypescript: structure.hasTypescript,
            hasSrcDir: structure.hasSrcDir
        },
        stats: {
            totalFiles: files.length,
            filesByType: files.reduce((acc, file) => {
                acc[file.type] = (acc[file.type] || 0) + 1;
                return acc;
            }, {}),
            totalSize: files.reduce((acc, file) => acc + file.size, 0)
        },
        dependencies,
        devDependencies,
        files: files
            .filter(file => !file.path.endsWith('package.json'))
            .map(file => ({
                path: file.path,
                type: file.type,
                size: file.size,
                content: file.content
            }))
    };
} 