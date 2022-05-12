import BaseRenderer from '../../renderers/BaseRenderer';
import {
  extendPrototype,
} from '../../utils/functionExtensions';

function PXCompBaseElement() {

}
extendPrototype([BaseRenderer], PXCompBaseElement);

export default PXCompBaseElement;
