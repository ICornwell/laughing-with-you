// src/deps/path.js
import resourceManager from '../resourceManager.js';
import {proxyDep} from '#lwy/proxyDeps.js';

export const getResourceManager = () => proxyDep(resourceManager, 'resourceManager');

export default getResourceManager()