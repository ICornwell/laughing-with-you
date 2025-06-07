// src/deps/path.js
const path = require ('path');
const {proxyDep} = require('#lwy/proxyDeps.js');

getPath = () => proxyDep(path, 'path');

module.exports = getPath()