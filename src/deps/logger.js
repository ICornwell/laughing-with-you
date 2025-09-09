// src/deps/path.js
import logger from '../logger.js';
import {proxyDep} from '#lwy/proxyDeps.js';

console.log(logger)

console.log(proxyDep)

export const getLogger = () => proxyDep(logger, 'logger');

export default getLogger()