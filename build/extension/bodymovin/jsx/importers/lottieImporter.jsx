/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, Folder, $, KeyframeEase, Shape, app, MaskMode, TrackMatteType, KeyframeInterpolationType, ImportOptions, TextDocument, ParagraphJustification */

$.__bodymovin.bm_lottieImporter = (function () {

	var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

	var ob = {};

	var mainFolder;
	var elements = {};
	var frameRate = 0;

	function getElementById(id) {
		if(elements[id]) {
			return elements[id].element;
		}
		return null;
	}

	function addElement(id, element) {
		elements[id] = {
			element: element
		}
	}

	function createFolder(name) {
		name = name || 'Imported_Lottie_Animation';
		mainFolder = app.project.items.addFolder(name);
	}

	function createComp(name, width, height, duration, id) {
		name = name || 'Lottie_Main_Comp';
		var comp = app.project.items.addComp(name, width, height, 1, duration / frameRate, frameRate);
		addElement(id, comp);
		comp.parentFolder = mainFolder;
		//'bm_charHelper', 1000, 1000, 1, 1, 1
	}

	function createNull(duration, elementId, parentCompId) {
		var comp = getElementById(parentCompId);

		var element = comp.layers.addNull(duration / frameRate);
		addElement(elementId, element);
	}

	function createSolid(color, name, width, height, duration, elementId, parentCompId) {
		var comp = getElementById(parentCompId);
		// comp.layers.addSolid(color, name, width, height, 1, duration);

		var element = comp.layers.addSolid(color, name, width, height, 1, duration / frameRate);
		addElement(elementId, element);
	}

	function createShapeLayer(elementId, parentCompId) {
		var comp = getElementById(parentCompId);

		var element = comp.layers.addShape();
		addElement(elementId, element);
	}

	function createTextLayer(elementId, parentCompId) {
		var comp = getElementById(parentCompId);

		var element = comp.layers.addText('');
		addElement(elementId, element);
	}

	function addComposition(compSourceId, parentCompId, elementId) {
		var comp = getElementById(compSourceId);
		var parentComp = getElementById(parentCompId);
		var compLayer = parentComp.layers.add(comp);
		addElement(elementId, compLayer);
	}

	function addImageLayer(imageSourceId, parentCompId, elementId) {
		var image = getElementById(imageSourceId);
		var parentComp = getElementById(parentCompId);
		var imageLayer = parentComp.layers.add(image);
		addElement(elementId, imageLayer);
	}

	function setFrameRate(value) {
		frameRate = value;
	}

	function setElementTemporalKeyAtIndex(propertyName, index, inInfluences, inSpeeds, outInfluences, outSpeeds, elementId) {
		var element = getElementById(elementId);
		var property = element.property(propertyName);
		var inEases = [];
		var outEases = [];
		for (var i = 0; i < inInfluences.length; i += 1) {
			var easeIn = new KeyframeEase(inSpeeds[i], inInfluences[i]);
			inEases.push(easeIn);
			var easeOut = new KeyframeEase(outSpeeds[i], outInfluences[i]);
			outEases.push(easeOut);
		}
		property.setTemporalEaseAtKey(index, inEases, outEases);

	}

	var keyInterpolatioTypes = {
		1: KeyframeInterpolationType.LINEAR,
		2: KeyframeInterpolationType.BEZIER,
		3: KeyframeInterpolationType.HOLD,
	}

	function getKeyInterpolationType(type) {
		return keyInterpolatioTypes[type] || keyInterpolatioTypes[1];
	}

	function setInterpolationTypeAtKey(propertyName, index, elementId, type) {
		var element = getElementById(elementId);
		var property = element.property(propertyName);
		property.setInterpolationTypeAtKey(index, getKeyInterpolationType(2), getKeyInterpolationType(type));
	}

	function separateDimensions(elementId) {
		var element = getElementById(elementId);
		var property = element.property('Position');
		property.dimensionsSeparated = true;
	}

	function setSpatialTangentsAtKey(propertyName, index, inTangents, outTangents, elementId) {
		var element = getElementById(elementId);
		var property = element.property(propertyName);
		property.setSpatialTangentsAtKey(index, inTangents, outTangents);
	}

	function formatValue(propertyName, value) {
		if (typeof value === 'object' && value.i) {
			var sVerts= value.v;
			var sITans= value.i;
			var sOTans = value.o;
			var sShape = new Shape(); 
			sShape.vertices = sVerts; 
			sShape.inTangents = sITans; 
			sShape.outTangents = sOTans; 
			sShape.closed = value.c;
			return sShape;
		} else {
			return value;
		}
	}

	function setElementPropertyValue(propertyName, value, elementId) {
		var element = getElementById(elementId);
		if (propertyName === 'name') {
			element[propertyName] = decodeURIComponent(value);
		} else {
			element[propertyName].setValue(formatValue(propertyName, value));
		}
	}

	function setElementPropertyExpression(propertyName, value, elementId) {
		var element = getElementById(elementId);
		// element[propertyName].expression = 'time';
		element[propertyName].expression = decodeURIComponent(value);
	}

	function setElementKey(propertyName, time, value, elementId) {
		var element = getElementById(elementId);
		// This case covers Grandients that can't be set via scripting
		if (propertyName === 'Colors') {
			element[propertyName].addKey(time / frameRate);
		} else {
			element[propertyName].setValueAtTime(time / frameRate, formatValue(propertyName, value));
		}
	}


	function setLayerParent(layerId, parentLayerId) {
		var layer = getElementById(layerId);
		var parent = getElementById(parentLayerId);
		layer.setParentWithJump(parent);
	}

	function setLayerStartTime(layerId, time) {
		var layer = getElementById(layerId);
		layer.startTime = time / frameRate;
	}

	function setLayerInPoint(layerId, time) {
		var layer = getElementById(layerId);
		layer.inPoint = time / frameRate;
	}

	function setLayerName(layerId, name) {
		var layer = getElementById(layerId);
		layer.name = decodeURIComponent(name);
	}

	function setElementAsDisabled(elementId, name) {
		var element = getElementById(elementId);
		element.enabled = false;
	}

	function setLayerOutPoint(layerId, time) {
		var layer = getElementById(layerId);
		layer.outPoint = time / frameRate;
	}

	function setLayerStretch(layerId, stretch) {
		var layer = getElementById(layerId);
		layer.stretch = stretch;
	}

	function createShapeGroup(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Group");
		addElement(elementId, elementProperty);
	}

	function createRectangle(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Shape - Rect");
		addElement(elementId, elementProperty);
	}

	function createEllipse(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Shape - Ellipse");
		addElement(elementId, elementProperty);
	}

	function createStar(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Shape - Star");
		addElement(elementId, elementProperty);
	}

	function createFill(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Graphic - Fill");
		addElement(elementId, elementProperty);
	}

	function createGradientFill(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Graphic - G-Fill");
		addElement(elementId, elementProperty);
	}

	function createGradientStroke(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Graphic - G-Stroke");
		addElement(elementId, elementProperty);
	}

	function createStroke(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Graphic - Stroke");
		addElement(elementId, elementProperty);
	}

	function createRepeater(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Filter - Repeater");
		addElement(elementId, elementProperty);
	}

	function createRoundedCorners(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Filter - RC");
		addElement(elementId, elementProperty);
	}

	function createTrimPath(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Filter - Trim");
		addElement(elementId, elementProperty);
	}

	function createShape(elementId, containerId) {
		var element = getElementById(containerId);
		var property = element.property("Contents");
		var elementProperty = property.addProperty("ADBE Vector Shape - Group");
		addElement(elementId, elementProperty);
	}

	function getJustification(value) {
        switch (value) {
        case 0:
            return ParagraphJustification.LEFT_JUSTIFY;
        case 1:
            return ParagraphJustification.RIGHT_JUSTIFY;
        case 2:
            return ParagraphJustification.CENTER_JUSTIFY;
        case 3:
            return ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT;
        case 4:
            return ParagraphJustification.FULL_JUSTIFY_LASTLINE_RIGHT;
        case 5:
            return ParagraphJustification.FULL_JUSTIFY_LASTLINE_CENTER;
        case 6:
            return ParagraphJustification.FULL_JUSTIFY_LASTLINE_FULL;
        default:
            return ParagraphJustification.LEFT_JUSTIFY;
        }
    }

    function buildTextDocument(textDocument, text, fontSize, font, fillColor, tracking, justification, baselineShift) {
    	try {
    		textDocument.text = text;
    		textDocument.justification = getJustification(justification);
    		textDocument.font = decodeURIComponent(font);
    		textDocument.baselineShift = baselineShift;
    		textDocument.fontSize = fontSize;
    		textDocument.fillColor = fillColor;
    		textDocument.tracking = tracking;
    	} catch(error) {
    		bm_eventDispatcher.log(error.message)
    	}
    }

	function setTextDocumentValue(sourceTextId, text, fontSize, font, fillColor, tracking, justification, baselineShift) {
		var layer = getElementById(sourceTextId);
		var textDocument = new TextDocument(text);
		layer.property("Source Text").setValue(textDocument);
		textDocument = layer.property("Source Text").value;
		buildTextDocument(textDocument, text, fontSize, font, fillColor, tracking, justification, baselineShift)
		layer.property("Source Text").setValue(textDocument);
	}

    function setTextDocumentValueAtTime(sourceTextId, time, text, fontSize, font, fillColor, tracking, justification, baselineShift) {
    	var layer = getElementById(sourceTextId);
    	var textDocument = new TextDocument(text);
    	layer.property("Source Text").setValueAtTime(time / frameRate, textDocument);
    	textDocument = layer.property("Source Text").value;
    	buildTextDocument(textDocument, text, fontSize, font, fillColor, tracking, justification, baselineShift)
    	layer.property("Source Text").setValueAtTime(time / frameRate, textDocument);
    }

	var maskModes = {
		a: MaskMode.ADD,
		s: MaskMode.SUBTRACT,
		i: MaskMode.INTERSECT,
		l: MaskMode.LIGHTEN,
		d: MaskMode.DARKEN,
		f: MaskMode.DIFFERENCE,
	}

	var trackMatteModes = {
		1: TrackMatteType.ALPHA,
		2: TrackMatteType.ALPHA_INVERTED,
		3: TrackMatteType.LUMA,
		4: TrackMatteType.LUMA_INVERTED,
	}


	function getMaskMode(mode) {
		return maskModes[mode] || maskModes.a;
	}

	function getTrackMatteMode(mode) {
		return trackMatteModes[mode] || trackMatteModes[1];
	}

	function createMask(maskId, layerId, maskMode, isInverted) {
		var element = getElementById(layerId);
		var mask = element.Masks.addProperty("Mask");
		addElement(maskId, mask);
		mask.maskMode = getMaskMode(maskMode);
		mask.inverted = isInverted;
	}

	function setTrackMatte(layerId, trackMatteMode) {
		var element = getElementById(layerId);
		element.trackMatteType = getTrackMatteMode(trackMatteMode);
	}

	function assignIdToProp(propName, elementId, containerId) {
		var element = getElementById(containerId);
		var elementProperty = element.property(propName);
		addElement(elementId, elementProperty);
	}

	function importFile(jsonPath, fileRelativePath, assetId) {
		var importFileOptions = new ImportOptions();
		var file = new File(decodeURIComponent(jsonPath));
		file.changePath(decodeURIComponent(fileRelativePath));
		if (file.exists) {
			importFileOptions.file = file;
		}
		var footage = app.project.importFile(importFileOptions);
		addElement(assetId, footage);
	}

	function addFootageToMainFolder(footageList) {
		var i, len = footageList.length;
		for (i = 0; i < len; i += 1) {
			var footage = getElementById(footageList[i]);
			footage.parentFolder = mainFolder;
		}
	}

	function reset() {
		elements = {};
		mainFolder = null;
	}

	ob.reset = reset;
	ob.createFolder = createFolder;
	ob.createComp = createComp;
	ob.createNull = createNull;
	ob.createSolid = createSolid;
	ob.createShapeLayer = createShapeLayer;
	ob.createTextLayer = createTextLayer;
	ob.addComposition = addComposition;
	ob.addImageLayer = addImageLayer;
	ob.setFrameRate = setFrameRate;
	ob.setElementPropertyValue = setElementPropertyValue;
	ob.setElementPropertyExpression = setElementPropertyExpression;
	ob.setElementKey = setElementKey;
	ob.setElementTemporalKeyAtIndex = setElementTemporalKeyAtIndex;
	ob.setInterpolationTypeAtKey = setInterpolationTypeAtKey;
	ob.separateDimensions = separateDimensions;
	ob.setSpatialTangentsAtKey = setSpatialTangentsAtKey;
	ob.setLayerParent = setLayerParent;
	ob.setLayerStartTime = setLayerStartTime;
	ob.setLayerStretch = setLayerStretch;
	ob.setLayerInPoint = setLayerInPoint;
	ob.setLayerName = setLayerName;
	ob.setElementAsDisabled = setElementAsDisabled;
	ob.setLayerOutPoint = setLayerOutPoint;
	ob.createShapeGroup = createShapeGroup;
	ob.createRectangle = createRectangle;
	ob.createEllipse = createEllipse;
	ob.createStar = createStar;
	ob.createFill = createFill;
	ob.createStroke = createStroke;
	ob.createGradientFill = createGradientFill;
	ob.createGradientStroke = createGradientStroke;
	ob.createShape = createShape;
	ob.createRepeater = createRepeater;
	ob.createRoundedCorners = createRoundedCorners;
	ob.createTrimPath = createTrimPath;
	ob.createMask = createMask;
	ob.setTrackMatte = setTrackMatte;
	ob.assignIdToProp = assignIdToProp;
	ob.importFile = importFile;
	ob.addFootageToMainFolder = addFootageToMainFolder;
	ob.setTextDocumentValue = setTextDocumentValue;
	ob.setTextDocumentValueAtTime = setTextDocumentValueAtTime;
    
    return ob;
}());