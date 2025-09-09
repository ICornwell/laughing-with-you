"use strict";

var mockTimer = require("../mockTimer");
var proxyDep = require("../../srccjs/proxyDeps.js");

const getMockTimer = () => proxyDep(mockTimer, 'mockTimer');

module.exports = getMockTimer();