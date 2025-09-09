// src/deps/path.js
import * as e2eDefault from '../e2e.js';
import {proxyDep} from '#lwy/proxyDeps.js';

console.log(e2eDefault, 'e2e dep loaded');

export const getE2e = () => proxyDep(e2eDefault, 'e2e');

export default getE2e()