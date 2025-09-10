"use strict";

var resourceManager = require('../resourceManager.js');
var proxyDep = require("../../srccjs/proxyDeps.js");

const getResourceManager = () => proxyDep(resourceManager, 'resourceManager');

module.exports = getResourceManager();