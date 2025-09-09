// src/deps/path.js
import depSnapshot from '../depSnapshot';
import {proxyDep} from '#lwy/proxyDeps.js';

export const getDepSnapshot = () => proxyDep(depSnapshot, 'depSnapshot');

export default getDepSnapshot()