"use strict";

var depSnapshot = require("../depSnapshot");
var proxyDep = require("../../srccjs/proxyDeps.js");

const getDepSnapshot = () => proxyDep(depSnapshot, 'depSnapshot');

module.exports = getDepSnapshot();