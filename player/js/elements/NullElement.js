function NullElement(data,parentContainer,globalData,comp){
    this.initFrame();
	this.initBaseData(data, globalData, comp);
    this.initTransform(data, globalData, comp);
    this.initHierarchy();
}

NullElement.prototype.prepareFrame = function(num) {
    this.prepareProperties(num, true);
};

NullElement.prototype.renderFrame = function() {
};

NullElement.prototype.getBaseElement = function() {
	return null;
};

extendPrototype(BaseElement, NullElement);
extendPrototype(TransformElement, NullElement);
extendPrototype(HierarchyElement, NullElement);
extendPrototype(FrameElement, NullElement);
