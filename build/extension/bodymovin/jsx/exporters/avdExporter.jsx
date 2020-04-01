/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, Folder, $*/

$.__bodymovin.bm_avdExporter = (function () {

	var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var exporterHelpers = $.__bodymovin.bm_exporterHelpers;

	var ob = {};
	var _callback;

    function saveAVDDataSuccess() {
        _callback(exporterHelpers.exportTypes.AVD, exporterHelpers.exportStatuses.SUCCESS);
    }

    function saveAVDFailed() {
        _callback(exporterHelpers.exportTypes.AVD, exporterHelpers.exportStatuses.FAILED);
    }

	function save(destinationPath, config, callback) {
		_callback = callback;

		if (config.export_modes.avd) {
			var destinationData = exporterHelpers.parseDestination(destinationPath, 'avd');

			var avdDestinationFileName = new File(destinationData.folder.fsName)
			avdDestinationFileName.changePath(destinationData.fileName + '.xml')

			var temporaryFolder = bm_fileManager.getTemporaryFolder();
			var jsonFile = new File(temporaryFolder.fsName);
			jsonFile.changePath('raw');
			jsonFile.changePath(destinationData.fileName + '.json');

			// var animationStringData = exporterHelpers.getJsonData(rawFiles);
			bm_eventDispatcher.sendEvent('bm:create:avd', {origin: jsonFile.fsName, destination: avdDestinationFileName.fsName});
		
		} else {
			_callback(exporterHelpers.exportTypes.AVD, exporterHelpers.exportStatuses.SUCCESS);
		}
	}


	ob.save = save;
    ob.saveAVDDataSuccess = saveAVDDataSuccess;
    ob.saveAVDFailed = saveAVDFailed;
    
    return ob;
}());