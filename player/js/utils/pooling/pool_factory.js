import {
  createSizedArray,
} from '../helpers/arrays';
import pooling from './pooling';

const poolFactory = (function () {
  return function (initialLength, _create, _release) {
    let _length = 0;
    let _maxLength = initialLength;
    let pool = createSizedArray(_maxLength);

    const ob = {
      newElement: newElement,
      release: release,
    };

    function newElement() {
      let element;
      if (_length) {
        _length -= 1;
        element = pool[_length];
      } else {
        element = _create();
      }
      return element;
    }

    function release(element) {
      if (_length === _maxLength) {
        pool = pooling.double(pool);
        _maxLength *= 2;
      }
      if (_release) {
        _release(element);
      }
      pool[_length] = element;
      _length += 1;
    }

    return ob;
  };
}());

export default poolFactory;
