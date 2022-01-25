import DynamicPropertyContainer from '../../../utils/helpers/dynamicProperties';

import {
  extendPrototype,
} from '../../../utils/functionExtensions';

function SVGNoStyleData(elem, data, styleOb) {
  this.initDynamicPropertyContainer(elem);
  this.getValue = this.iterateDynamicProperties;
  this.style = styleOb;
}

extendPrototype([DynamicPropertyContainer], SVGNoStyleData);

export default SVGNoStyleData;
