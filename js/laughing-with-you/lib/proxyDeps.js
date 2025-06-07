const { getLocalDeps } = require('./asyncLocalDeps')

function proxyDep (dep, name) {
  //  console.log(`als: ${als}`)
  const handler = {
    get (target, prop, receiver) {
      const localDeps = getLocalDeps()

      // Then access the specific dependency by name, and the property on that dependency
      if (
        localDeps &&
        localDeps[name] &&
        typeof localDeps[name][prop] !== 'undefined'
      ) {
        return localDeps[name][prop]
      }

      // Fall back to the original implementation
      return target[prop]
    }
  }
  const proxy = new Proxy(dep, handler)
  return proxy
}

module.exports = { proxyDep }
