/* global poolFactory */
/* exported pointPool */
import {
  createTypedArray,
} from '../helpers/arrays';

const pointPool = (function () {
  function create() {
    return createTypedArray('float32', 2);
  }
  return poolFactory(8, create);
}());

export default pointPool;
