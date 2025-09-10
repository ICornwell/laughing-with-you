"use strict";

const logger = require("../logger.js");
const proxyDep = require("../../srccjs/proxyDeps.js");

console.log(logger);
console.log(proxyDep);

const getLogger = () => proxyDep(logger, 'logger');

module.exports = getLogger()