import createNS from '../../../utils/helpers/svg_elements';

function SVGComposableEffect() {

}
SVGComposableEffect.prototype = {
  createMergeNode: (resultId, ins) => {
    var feMerge = createNS('feMerge');
    feMerge.setAttribute('result', resultId);
    var feMergeNode;
    var i;
    for (i = 0; i < ins.length; i += 1) {
      feMergeNode = createNS('feMergeNode');
      feMergeNode.setAttribute('in', ins[i]);
      feMerge.appendChild(feMergeNode);
      feMerge.appendChild(feMergeNode);
    }
    return feMerge;
  },
};

export default SVGComposableEffect;
