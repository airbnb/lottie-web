import NullElement from '../elements/NullElement';

// Shared `createNull` renderer method. Null layers (`ty: 3`) produce no visual
// output in any renderer, so every renderer creates the same `NullElement`.
// Keeping this in its own tiny module lets the canvas renderer reuse it without
// importing the whole SVG renderer (and the SVG element tree it drags in) just
// to borrow this one method. Assigned onto renderer prototypes, so it relies on
// `this` and must stay a regular function.
function createNull(data) {
  return new NullElement(data, this.globalData, this);
}

export default createNull;
