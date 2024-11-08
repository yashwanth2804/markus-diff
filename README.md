# Markus-Diff

A powerful tool to analyze and reconstruct project structures. This tool helps you analyze existing projects and recreate them in different locations while preserving their structure and dependencies.

## Features

- 📊 Project Structure Analysis
- 🔄 Project Recreation
- 📁 Smart File Scanning
- 🎯 Framework Detection
- 📦 Dependencies Management
- 🚫 Respects .gitignore
- 🔍 Detailed Project Statistics
- 🔄 Git-based Analysis

## Installation

```bash
npm install -g markus-diff
```

## Usage

### Basic Analysis
```bash
markus-diff
```
This will analyze the current directory and generate `code.json`.

### Advanced Analysis
```bash
markus-diff -d ./my-project -o ./analysis.json -n "My Project" -v "2.0.0"
```

Options:
- `-d, --dir <directory>` - Project directory (default: current directory)
- `-o, --output <path>` - Output file path (default: ./code.json)
- `-n, --name <name>` - Project name
- `-v, --version-tag <version>` - Version tag for the analysis (default: "1.0.0")

### Project Recreation
```bash
markus-diff init -i ./analysis.json -d ./new-project
```

Options:
- `-i, --input <file>` - Analysis JSON file (required)
- `-d, --dir <directory>` - Target directory (default: current directory)

### Git-based Analysis
```bash
markus-diff --git -o ./analysis.json
```

This command will:
1. Safely stash any uncommitted changes
2. Switch to master branch
3. Create a temporary merge state with your current branch
4. Generate the analysis from this merged state
5. Clean up the merge and return to your original branch
6. Restore any stashed changes

This is particularly useful for:
- Analyzing changes before merging to master
- Reviewing the impact of your branch changes
- Generating documentation for pull requests
- Validating project structure modifications

Note: Ensure your git working directory is clean or has changes that can be safely stashed.

## Generated Output Structure

```json
{
  "name": "project-name",
  "type": "project:analysis",
  "version": "1.0.1",
  "generatorVersion": "1.0.1",
  "timestamp": "2024-03-21T10:00:00.000Z",
  "structure": {
    "framework": "react",
    "hasTypescript": true,
    "hasSrcDir": true
  },
  "stats": {
    "totalFiles": 42,
    "filesByType": {
      "javascript": 15,
      "typescript": 20,
      "css": 5,
      "json": 2
    },
    "totalSize": 150000
  },
  "dependencies": {
    "react": "^18.0.0",
    "next": "^13.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "files": [...]
}
```

The output includes two version fields:
- `version`: The schema version of the output JSON
- `generatorVersion`: The version of markus-diff that generated the analysis

## Supported Features

### File Types
- JavaScript (.js, .mjs, .cjs)
- TypeScript (.ts, .tsx)
- React (.jsx)
- Vue (.vue)
- Svelte (.svelte)
- CSS/SCSS/LESS
- JSON and configuration files

### Frameworks
- React
- Next.js
- Vue.js
- Svelte
- Angular

### Excluded by Default
- node_modules/
- dist/
- build/
- .git/
- Binary files
- Lock files (package-lock.json, yarn.lock)

## Quick Start Example

1. Analyze a project:
```bash
cd my-project
markus-diff -o analysis.json
```

2. Recreate it elsewhere:
```bash
markus-diff init -i analysis.json -d ../new-project
```

3. Setup the new project:
```bash
cd ../new-project
npm install
```

## Common Use Cases

- Project templating
- Structure analysis
- Dependency auditing
- Project migration
- Creating snapshots

## Limitations

- Binary files not included
- Some framework features need manual setup
- Large projects generate large JSON files

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues or questions, please file an issue on the GitHub repository.