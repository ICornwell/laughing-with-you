import { proxyDep } from './proxyDeps';

/**
 * Auto-generate proxies for all exports of a module
 */
export function proxyModule(module, name) {
  if (process.env.NODE_ENV === 'production') {
    return module;
  }
  
  return new Proxy(module, {
    get(target, prop, receiver) {
      if (prop === 'default') {
        return proxyDep(target.default, name);
      }
      
      if (typeof target[prop] === 'function' || 
          typeof target[prop] === 'object' && target[prop] !== null) {
        return proxyDep(target[prop], `${name}.${String(prop)}`);
      }
      
      return target[prop];
    }
  });
}

export default { 
  proxyDep,
  proxyModule
};