var createNS = (function() {

	function createDOMElement(type) {
		// return {appendChild:function(){},insertBefore:function(){},setAttribute:function(){},style:{}}
		return document.createElementNS(svgNS, type);
	}

	function VirtualElement(type) {
		this.DOMElement = null
		this.type = type
		this.children = []
		this.attributes = {}
		this.attributesNS = {}
		this.styleData = {}
		this.style = {}
	}

	var virtualElementPrototype = {
		appendChild: function(element) {
			if (!this.DOMElement) {
				this.children.push(element);
			} else {
				this.DOMElement.appendChild(element.convert());
			}
		},

		insertBefore: function(element, child) {
			if (!this.DOMElement) {
				var i = 0, len = this.children.length;
				while (i < len) {
					if (this.children[i] === child) {
						this.children.splice(i, 0, element);
						break;
					}
					i += 1
				}
			} else {
				this.DOMElement.insertBefore(element.convert(), child.convert());
			}
			
		},

		setAttribute: function(key, value) {
			if(value != this.attributes[key]) {
				this.attributes[key] = value;
				if (this.DOMElement) {
					this.DOMElement.setAttribute(key, value);
				}
			}
		},

		setAttributeNS: function(namespace, key, value) {
			if(value != this.attributes[key]) {
				this.attributesNS[namespace + '---' + key] = value;
				if (this.DOMElement) {
					this.DOMElement.attributesNS(namespace, key, value);
				}
			}
		},

		convert: function() { 
			if (!this.DOMElement) {
				var DOMElement = createDOMElement(this.type)
				this.DOMElement = DOMElement

				for (var attr in this.attributes) {
					DOMElement.setAttribute(attr, this.attributes[attr]);
				}

				for (var attr in this.attributesNS) {
					var nsValue = attr.split('---');
					DOMElement.setAttributeNS(nsValue[0], nsValue[1], this.attributesNS[attr]);
				}

				for (var styleKey in this.style) {
					DOMElement.style[styleKey] = this.style[styleKey]
				}

				var i, len = this.children.length;
				for (i = 0; i < len; i += 1) {
					DOMElement.appendChild(this.children[i].convert());
				}

				this.setAttribute = DOMElement.setAttribute.bind(DOMElement)
				this.setAttributeNS = DOMElement.setAttributeNS.bind(DOMElement)
				this.style = DOMElement.style
				// this.appendChild = DOMElement.appendChild.bind(DOMElement)
				// this.insertBefore = DOMElement.insertBefore.bind(DOMElement)

			}
			return this.DOMElement
		}
	}

	/*Object.defineProperty(virtualElementPrototype, 'style', {
        get: function() {
            if (!this.DOMElement) {
            	return this.styleData;
            } else {
            	return this.DOMElement.style;
            }
        }
    });*/

	VirtualElement.prototype = virtualElementPrototype;

	return function(type, isMounted) {
		if (isMounted) {
			return createDOMElement(type)
		} else {
			return new VirtualElement(type)
		}
	}
}())


/*function createNS(type) {
	return {appendChild:function(){},insertBefore:function(){},setAttribute:function(){},style:{}}
	// return document.createElementNS(svgNS, type);
}*/