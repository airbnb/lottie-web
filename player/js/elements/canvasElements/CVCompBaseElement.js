import BaseRenderer from '../../renderers/BaseRenderer';
import {
  extendPrototype,
} from '../../utils/functionExtensions';

function CVCompBaseElement() {

}
extendPrototype([BaseRenderer], CVCompBaseElement);

export default CVCompBaseElement;
