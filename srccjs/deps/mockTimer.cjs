"use strict";

var mockTimer = require("../mockTimer");
var proxyDep = require("../../srccjs/proxyDeps.cjs");

const getMockTimer = () => proxyDep(mockTimer, 'mockTimer');

module.exports = getMockTimer();