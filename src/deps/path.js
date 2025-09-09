// src/deps/path.js
import path from 'path';
import {proxyDep} from '#lwy/proxyDeps.js';

export const getPath = () => proxyDep(path, 'path');

export default getPath()