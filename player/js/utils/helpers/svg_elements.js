import { svgNS } from '../../main';

function createNS(type) {
  // return {appendChild:function(){},setAttribute:function(){},style:{}}
  return document.createElementNS(svgNS, type);
}

export default createNS;
