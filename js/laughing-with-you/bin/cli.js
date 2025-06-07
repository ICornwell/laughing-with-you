#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { generateProxies, generateProxiesFromPackageJson } = require('../src/proxyGen').default;

const command = process.argv[2];
const args = process.argv.slice(3);

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
laughing-with-you CLI

Commands:
  generate-proxies [targetDir] [deps...]   Generate proxy modules for dependencies
  generate-from-package [packageJsonPath] [targetDir]   Generate proxies from package.json
  help                                    Show this help message
  version                                 Show version
  
Examples:
  npx laughing-with-you generate-proxies ./src/deps fs path http
  npx laughing-with-you generate-from-package ./package.json ./src/deps
`);
}

/**
 * Show version
 */
function showVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );
  console.log(`laughing-with-you v${packageJson.version}`);
}

/**
 * Main function
 */
async function main() {
  switch (command) {
    case 'generate-proxies': {
      const targetDir = args[0] || path.join(process.cwd(), 'src', 'deps');
      const deps = args.slice(1);
      
      if (deps.length === 0) {
        console.error('Error: No dependencies specified');
        printUsage();
        process.exit(1);
      }
      
      console.log(`Generating proxies for ${deps.join(', ')} in ${targetDir}`);
      generateProxies(targetDir, deps);
      break;
    }
    
    case 'generate-from-package': {
      const packageJsonPath = args[0] || path.join(process.cwd(), 'package.json');
      const targetDir = args[1] || path.join(process.cwd(), 'src', 'deps');
      
      if (!fs.existsSync(packageJsonPath)) {
        console.error(`Error: package.json not found at ${packageJsonPath}`);
        process.exit(1);
      }
      
      console.log(`Generating proxies from ${packageJsonPath} to ${targetDir}`);
      generateProxiesFromPackageJson(packageJsonPath, targetDir);
      break;
    }
    
    case 'help':
    case '--help':
    case '-h':
      printUsage();
      break;
    
    case 'version':
    case '--version':
    case '-v':
      showVersion();
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// Run main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
