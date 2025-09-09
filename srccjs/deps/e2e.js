"use strict";

const e2e = require("../e2e.js");
const proxyDep = require("../../srccjs/proxyDeps.js");

console.log(e2e, 'e2e dep loaded');
const getE2e = () => proxyDep(e2e, 'e2e');

module.exports = getE2e();