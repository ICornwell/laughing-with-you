"use strict";

const proxyDeps = require("./proxyDeps");
/**
 * Auto-generate proxies for all exports of a module
 */
function proxyModule(module, name) {
  if (process.env.NODE_ENV === 'production') {
    return module;
  }
  return new Proxy(module, {
    get(target, prop, receiver) {
      if (prop === 'default') {
        return (0, proxyDeps.proxyDep)(target.default, name);
      }
      if (typeof target[prop] === 'function' || typeof target[prop] === 'object' && target[prop] !== null) {
        return (0, proxyDeps.proxyDep)(target[prop], `${name}.${String(prop)}`);
      }
      return target[prop];
    }
  });
}
module.exports = {
  proxyDep: proxyDeps.proxyDep,
  proxyModule
};