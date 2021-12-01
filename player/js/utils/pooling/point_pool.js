import {
  createTypedArray,
} from '../helpers/arrays';
import poolFactory from './pool_factory';

const pointPool = (function () {
  function create() {
    return createTypedArray('float32', 2);
  }
  return poolFactory(8, create);
}());

export default pointPool;
