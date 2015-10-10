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
$.evalFile(extensionPath + 'utils/markerHelper.jsx');
