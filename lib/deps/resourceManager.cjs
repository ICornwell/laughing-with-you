"use strict";

var resourceManager = require('../resourceManager.cjs');
var proxyDep = require("../../srccjs/proxyDeps.cjs");

const getResourceManager = () => proxyDep(resourceManager, 'resourceManager');

module.exports = getResourceManager();