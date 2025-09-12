"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.generateProxies = generateProxies;
exports.generateProxiesFromPackageJson = generateProxiesFromPackageJson;
var _fs = require("fs");
var _path = require("path");
var _proxyDeps = require("./proxyDeps");
/**
 * Generate proxy modules for common dependencies
 */
function generateProxies(targetDir = (0, _path.join)(__dirname, 'deps'), deps = ['fs', 'path']) {
  // Ensure directory exists
  if (!(0, _fs.existsSync)(targetDir)) {
    (0, _fs.mkdirSync)(targetDir, {
      recursive: true
    });
  }

  // Create each proxy file
  for (const name of deps) {
    const filePath = (0, _path.join)(targetDir, `${name}.js`);
    if (!(0, _fs.existsSync)(filePath)) {
      (0, _fs.writeFileSync)(filePath, `// Auto-generated proxy for ${name}
const ${name} = require('${name}');
const { proxyDep } = require('../proxyDeps');

module.exports = proxyDep(${name}, '${name}');
`);
      console.log(`Created proxy for ${name} at ${filePath}`);
    }
  }

  // Create index file
  const indexPath = (0, _path.join)(targetDir, 'index.cjs');
  const indexContent = deps.map(name => `exports.${name} = require('./${name}');`).join('\n');
  (0, _fs.writeFileSync)(indexPath, `// Auto-generated index for proxied dependencies
${indexContent}
`);
  console.log(`Created index at ${indexPath}`);
}

/**
 * Create proxies from package.json dependencies
 */
function generateProxiesFromPackageJson(packageJsonPath = (0, _path.resolve)(process.cwd(), 'package.json'), targetDir = (0, _path.join)(__dirname, 'deps'), ignoreList = []) {
  const packageJson = JSON.parse((0, _fs.readFileSync)(packageJsonPath, 'utf8'));

  // Collect all dependencies
  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };
  const depNames = Object.keys(allDeps).filter(name => !ignoreList.includes(name));
  generateProxies(targetDir, depNames);
}
var _default = exports.default = {
  generateProxies,
  generateProxiesFromPackageJson
};