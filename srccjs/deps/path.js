"use strict";

var path = require("path");
var proxyDep = require("../../srccjs/proxyDeps.js");

const getPath = () => proxyDep(path, 'path');

module.exports = getPath();