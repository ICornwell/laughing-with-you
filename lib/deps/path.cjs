"use strict";

var path = require("path");
var proxyDep = require("../../srccjs/proxyDeps.cjs");

const getPath = () => proxyDep(path, 'path');

module.exports = getPath();