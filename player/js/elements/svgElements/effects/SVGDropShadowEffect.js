function SVGDropShadowEffect(filter, filterManager){
    /*<feGaussianBlur in="SourceAlpha" stdDeviation="3"/> <!-- stdDeviation is how much to blur -->
  <feOffset dx="2" dy="2" result="offsetblur"/> <!-- how much to offset -->
  <feMerge> 
    <feMergeNode/> <!-- this contains the offset blurred image -->
    <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->
  </feMerge>*/
  /*<feFlood flood-color="#3D4574" flood-opacity="0.5" result="offsetColor"/>*/
    filter.setAttribute('x','-100%');
    filter.setAttribute('y','-100%');
    filter.setAttribute('width','400%');
    filter.setAttribute('height','400%');
    this.filterManager = filterManager;

    var feGaussianBlur = document.createElementNS(svgNS,'feGaussianBlur');
    feGaussianBlur.setAttribute('in','SourceAlpha');
    feGaussianBlur.setAttribute('result','drop_shadow_1');
    feGaussianBlur.setAttribute('stdDeviation','0');
    this.feGaussianBlur = feGaussianBlur;
    filter.appendChild(feGaussianBlur);

    var feOffset = document.createElementNS(svgNS,'feOffset');
    feOffset.setAttribute('dx','25');
    feOffset.setAttribute('dy','0');
    feOffset.setAttribute('in','drop_shadow_1');
    feOffset.setAttribute('result','drop_shadow_2');
    this.feOffset = feOffset;
    filter.appendChild(feOffset);
    var feFlood = document.createElementNS(svgNS,'feFlood');
    feFlood.setAttribute('flood-color','#00ff00');
    feFlood.setAttribute('flood-opacity','1');
    feFlood.setAttribute('result','drop_shadow_3');
    this.feFlood = feFlood;
    filter.appendChild(feFlood);

    var feComposite = document.createElementNS(svgNS,'feComposite');
    feComposite.setAttribute('in','drop_shadow_3');
    feComposite.setAttribute('in2','drop_shadow_2');
    feComposite.setAttribute('operator','in');
    feComposite.setAttribute('result','drop_shadow_4');
    filter.appendChild(feComposite);


    var feMerge = document.createElementNS(svgNS,'feMerge');
    filter.appendChild(feMerge);
    var feMergeNode;
    feMergeNode = document.createElementNS(svgNS,'feMergeNode');
    feMerge.appendChild(feMergeNode);
    feMergeNode = document.createElementNS(svgNS,'feMergeNode');
    feMergeNode.setAttribute('in','SourceGraphic');
    this.feMergeNode = feMergeNode;
    this.feMerge = feMerge;
    this.originalNodeAdded = false;
    feMerge.appendChild(feMergeNode);
}

SVGDropShadowEffect.prototype.renderFrame = function(forceRender){
    if(forceRender || this.filterManager.mdf){
        if(forceRender || this.filterManager.effectElements[4].p.mdf){
            this.feGaussianBlur.setAttribute('stdDeviation', this.filterManager.effectElements[4].p.v / 4);
        }
        if(forceRender || this.filterManager.effectElements[0].p.mdf){
            var col = this.filterManager.effectElements[0].p.v;
            this.feFlood.setAttribute('flood-color',rgbToHex(Math.round(col[0]*255),Math.round(col[1]*255),Math.round(col[2]*255)));
        }
        if(forceRender || this.filterManager.effectElements[1].p.mdf){
            this.feFlood.setAttribute('flood-opacity',this.filterManager.effectElements[1].p.v/255);
        }
        if(forceRender || this.filterManager.effectElements[2].p.mdf || this.filterManager.effectElements[3].p.mdf){
            var distance = this.filterManager.effectElements[3].p.v
            var angle = (this.filterManager.effectElements[2].p.v - 90) * degToRads
            var x = distance * Math.cos(angle)
            var y = distance * Math.sin(angle)
            this.feOffset.setAttribute('dx', x);
            this.feOffset.setAttribute('dy', y);
        }
        /*if(forceRender || this.filterManager.effectElements[5].p.mdf){
            if(this.filterManager.effectElements[5].p.v === 1 && this.originalNodeAdded) {
                this.feMerge.removeChild(this.feMergeNode);
                this.originalNodeAdded = false;
            } else if(this.filterManager.effectElements[5].p.v === 0 && !this.originalNodeAdded) {
                this.feMerge.appendChild(this.feMergeNode);
                this.originalNodeAdded = true;
            }
        }*/
    }
};