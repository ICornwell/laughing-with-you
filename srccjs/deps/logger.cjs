"use strict";

const logger = require("../logger.cjs");
const proxyDep = require("../../srccjs/proxyDeps.cjs");

console.log(logger);
console.log(proxyDep);

const getLogger = () => proxyDep(logger, 'logger');

module.exports = getLogger()