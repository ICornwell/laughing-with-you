const fs = require('fs');
const path = require('path');
const { proxyDep } = require('./proxyDeps');

/**
 * Generate proxy modules for common dependencies
 */
function generateProxies(targetDir = path.join(__dirname, 'deps'), deps = ['fs', 'path']) {
  // Ensure directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Create each proxy file
  for (const name of deps) {
    const filePath = path.join(targetDir, `${name}.js`);
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, 
`// Auto-generated proxy for ${name}
const ${name} = require('${name}');
const { proxyDep } = require('../proxyDeps');

module.exports = proxyDep(${name}, '${name}');
`);
      console.log(`Created proxy for ${name} at ${filePath}`);
    }
  }
  
  // Create index file
  const indexPath = path.join(targetDir, 'index.js');
  const indexContent = deps
    .map(name => `exports.${name} = require('./${name}');`)
    .join('\n');
  
  fs.writeFileSync(indexPath, 
`// Auto-generated index for proxied dependencies
${indexContent}
`);
  
  console.log(`Created index at ${indexPath}`);
}

/**
 * Create proxies from package.json dependencies
 */
function generateProxiesFromPackageJson(
  packageJsonPath = path.resolve(process.cwd(), 'package.json'), 
  targetDir = path.join(__dirname, 'deps'),
  ignoreList = []
) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Collect all dependencies
  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };
  
  const depNames = Object.keys(allDeps)
    .filter(name => !ignoreList.includes(name));
  
  generateProxies(targetDir, depNames);
}

module.exports = {
  generateProxies,
  generateProxiesFromPackageJson
};