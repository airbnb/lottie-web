/*global anime, createElementID*/
function rgbaDataToString ([r, g, b, a]) {
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

function SVGCCPageTurnEffect(_, filterManager, elem) {
    this.options = filterManager.data.ef;
    this.defs = elem.globalData.defs;

    const filter = this.createPaperBackFilter();
    const { id, mask } = this.createMask();

    const el = elem.getBaseElement();
    el.setAttribute('mask', `url(#${id})`);

    const back = createNS('g');
    back.setAttribute('filter', `url(#${filter.id})`);

    let initialized = false;

    function initialize () {
        for (const child of el.children) {
            child.setAttribute('id', createElementID());
            const backContent = createNS('use');
            backContent.setAttribute('href', `#${child.id}`);
            back.appendChild(backContent);
        }
        el.appendChild(back);
        initialized = true;
    }

    const effectElements = filterManager.effectElements;
    const { w, h } = elem.globalData.compSize;
    const scale = `scale(${w + h})`;

    this.renderFrame = function () {
        if (!initialized) initialize();
        const [x, y] = effectElements[1].p.v;
        const xc = (x + w) / 2;
        const yc = y / 2;

        const rotate = Math.atan((x-w)/(-y));
        mask.style.transform = `translate(${xc}px,${yc}px) ${scale} rotate(${rotate}rad)`;
        back.style.transformOrigin = `${xc}px ${yc}px`;
        back.style.transform = `scaleY(-1) rotate(-${2 * rotate}rad)`;
    };
}

SVGCCPageTurnEffect.prototype.createPaperBackFilter = function () {
    const filter = createNS('filter');
    filter.setAttribute('id', createElementID());

    const feFlood = createNS('feFlood');
    const paperColor = rgbaDataToString(this.options[8].v.k);
    const paperOpcaity = this.options[7].v.k / 100;
    feFlood.setAttribute('flood-color', paperColor);
    feFlood.setAttribute('flood-opacity', paperOpcaity);
    feFlood.setAttribute('result', 'flood');
    filter.appendChild(feFlood);

    const feComposite = createNS('feComposite');
    feComposite.setAttribute('in', 'flood');
    feComposite.setAttribute('in2', 'SourceGraphic');
    feComposite.setAttribute('operator', 'in');
    feComposite.setAttribute('result', 'back');
    filter.appendChild(feComposite);

    const feBlend = createNS('feBlend');
    feBlend.setAttribute('in', 'back');
    feBlend.setAttribute('in2', 'SourceGraphic');
    filter.appendChild(feBlend);

    this.defs.appendChild(filter);
    return filter;
};

SVGCCPageTurnEffect.prototype.createMask = function () {
    const maskContainer = createNS('mask');
    maskContainer.setAttribute('id', createElementID());
    const mask = createNS('polygon');
    mask.setAttribute('fill', 'white');
    mask.setAttribute('points', '-1,0 1,0 1,1 -1,1');
    maskContainer.appendChild(mask);

    this.defs.appendChild(maskContainer);
    return { id: maskContainer.id, mask };
};

SVGCCPageTurnEffect.prototype.renderFrame = function () {};