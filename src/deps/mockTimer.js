// src/deps/path.js
import mockTimer from '../mockTimer';
import {proxyDep} from '#lwy/proxyDeps.js';

export const getMockTimer = () => proxyDep(mockTimer, 'mockTimer');

export default getMockTimer()