"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.afterAllWithLocalDeps = afterAllWithLocalDeps;
exports.afterEachWithLocalDeps = afterEachWithLocalDeps;
exports.beforeAllWithLocalDeps = beforeAllWithLocalDeps;
exports.beforeEachWithLocalDeps = beforeEachWithLocalDeps;
exports.describeWithLocalDeps = describeWithLocalDeps;
exports.itWithLocalDeps = itWithLocalDeps;
exports.specWithLocalDeps = specWithLocalDeps;
exports.testWithLocalDeps = testWithLocalDeps;
var _asyncLocalDeps = require("../asyncLocalDeps.cjs");
function describeWithLocalDeps(name, fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  describe(name, () => {
    (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}
function itWithLocalDeps(name, fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  it(name, async () => {
    await (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}
function beforeEachWithLocalDeps(fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  beforeEach(async () => {
    await (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}
function beforeAllWithLocalDeps(fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  beforeAll(async () => {
    await (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}
function afterEachWithLocalDeps(fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  afterEach(async () => {
    await (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}
function afterAllWithLocalDeps(fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  afterAll(async () => {
    await (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}
function testWithLocalDeps(name, fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  test(name, async () => {
    await (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}
function specWithLocalDeps(fn, timeout = 5000) {
  var capturedDeps = (0, _asyncLocalDeps.getLocalDeps)();
  spec(async () => {
    await (0, _asyncLocalDeps.runWithLocalDeps)(capturedDeps, fn, timeout);
  }, timeout);
}