import {
  getLocalDeps,
  runWithLocalDeps 
} from '../asyncLocalDeps.js'

export function describeWithLocalDeps (name, fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  describe(
    name,
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}

export function itWithLocalDeps (name, fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  it(
    name,
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}

export function beforeEachWithLocalDeps (fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  beforeEach(
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}

export function beforeAllWithLocalDeps (fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  beforeAll(
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}

export function afterEachWithLocalDeps (fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  afterEach(
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}

export function afterAllWithLocalDeps (fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  afterAll(
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}

export function testWithLocalDeps (fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  test(
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}

export function specWithLocalDeps (fn, timeout = 5000) {
  var capturedDeps = getLocalDeps()
  spec(
    async () => {
      await runWithLocalDeps(capturedDeps, fn, timeout)
    },
    timeout
  )
}



