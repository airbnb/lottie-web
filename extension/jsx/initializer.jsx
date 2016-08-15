/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $*/

var extensionPath = $.fileName.split('/').slice(0, -1).join('/') + '/';
$.evalFile(extensionPath + 'JSON.jsx');
$.evalFile(extensionPath + 'eventManager.jsx');
$.evalFile(extensionPath + 'projectManager.jsx');
$.evalFile(extensionPath + 'compsManager.jsx');
$.evalFile(extensionPath + 'renderManager.jsx');
$.evalFile(extensionPath + 'downloadManager.jsx');
$.evalFile(extensionPath + 'dataManager.jsx');
$.evalFile(extensionPath + 'elements/layerElement.jsx');
$.evalFile(extensionPath + 'utils/generalUtils.jsx');
$.evalFile(extensionPath + 'utils/sourceHelper.jsx');
$.evalFile(extensionPath + 'utils/transformHelper.jsx');
$.evalFile(extensionPath + 'utils/keyframeHelper.jsx');
$.evalFile(extensionPath + 'utils/maskHelper.jsx');
$.evalFile(extensionPath + 'utils/timeremapHelper.jsx');
$.evalFile(extensionPath + 'utils/shapeHelper.jsx');
$.evalFile(extensionPath + 'utils/textHelper.jsx');
$.evalFile(extensionPath + 'utils/textAnimatorHelper.jsx');
$.evalFile(extensionPath + 'utils/textShapeHelper.jsx');
$.evalFile(extensionPath + 'utils/effectsHelper.jsx');
$.evalFile(extensionPath + 'utils/layerStylesHelper.jsx');
$.evalFile(extensionPath + 'utils/expressionHelper.jsx');
$.evalFile(extensionPath + 'utils/cameraHelper.jsx');
$.evalFile(extensionPath + 'utils/XMPParser.jsx');
$.evalFile(extensionPath + 'utils/ProjectParser.jsx');
$.evalFile(extensionPath + 'esprima.jsx');
$.evalFile(extensionPath + 'escodegen.jsx');
$.evalFile(extensionPath + 'utils/markerHelper.jsx');
$.evalFile(extensionPath + 'utils/bez.jsx');
$.evalFile(extensionPath + 'utils/transformation-matrix.jsx');
$.evalFile(extensionPath + 'utils/PropertyFactory.jsx');