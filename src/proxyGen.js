import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { proxyDep } from './proxyDeps';

/**
 * Generate proxy modules for common dependencies
 */
export function generateProxies(targetDir = join(__dirname, 'deps'), deps = ['fs', 'path']) {
  // Ensure directory exists
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  
  // Create each proxy file
  for (const name of deps) {
    const filePath = join(targetDir, `${name}.js`);
    
    if (!existsSync(filePath)) {
      writeFileSync(filePath, 
`// Auto-generated proxy for ${name}
const ${name} = require('${name}');
const { proxyDep } = require('../proxyDeps');

module.exports = proxyDep(${name}, '${name}');
`);
      console.log(`Created proxy for ${name} at ${filePath}`);
    }
  }
  
  // Create index file
  const indexPath = join(targetDir, 'index.js');
  const indexContent = deps
    .map(name => `exports.${name} = require('./${name}');`)
    .join('\n');
  
  writeFileSync(indexPath, 
`// Auto-generated index for proxied dependencies
${indexContent}
`);
  
  console.log(`Created index at ${indexPath}`);
}

/**
 * Create proxies from package.json dependencies
 */
export function generateProxiesFromPackageJson(
  packageJsonPath = resolve(process.cwd(), 'package.json'), 
  targetDir = join(__dirname, 'deps'),
  ignoreList = []
) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  
  // Collect all dependencies
  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };
  
  const depNames = Object.keys(allDeps)
    .filter(name => !ignoreList.includes(name));
  
  generateProxies(targetDir, depNames);
}

export default {
  generateProxies,
  generateProxiesFromPackageJson
};