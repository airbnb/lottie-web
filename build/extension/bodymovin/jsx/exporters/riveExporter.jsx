/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, Folder, $*/

$.__bodymovin.bm_riveExporter = (function () {

	var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var exporterHelpers = $.__bodymovin.bm_exporterHelpers;

	var ob = {}
	var _callback;

    function saveSuccess() {
        _callback(exporterHelpers.exportTypes.RIVE, exporterHelpers.exportStatuses.SUCCESS);
    }

    function saveFailed() {
        _callback(exporterHelpers.exportTypes.RIVE, exporterHelpers.exportStatuses.FAILED);
    }

    function copyAssets() {

    	var rawFiles = bm_fileManager.getFilesOnPath(['raw']);

    	var i = 0, len = rawFiles.length;
    	while(i < len) {
			var fileData = bm_fileManager.getFileById(rawFiles[i].id);
			if (fileData) {
				var file = fileData.file;
				if(file.exists) {
					var filePath = fileData.path;
					var j = 1, jLen = filePath.length;
					var destinationFolder = ['rive'];
					while (j < jLen) {
						destinationFolder.push(filePath[j]);
						j += 1;
					}
					var destinationFileData = bm_fileManager.createFile(fileData.name, destinationFolder)
					file.copy(destinationFileData.file.fsName);
				}
			}
    		i += 1;
    	}
    }

	function save(destinationPath, config, callback) {
		_callback = callback;

		if (config.export_modes.rive) {

			var destinationData = exporterHelpers.parseDestination(destinationPath, 'rive');

			copyAssets();
			var temporaryFolder = bm_fileManager.getTemporaryFolder();
			var originFolder = new Folder(temporaryFolder.fsName);
			originFolder.changePath('rive');

			bm_eventDispatcher.sendEvent('bm:create:rive', 
				{
					origin: originFolder.fsName, 
					destination: destinationData.folder.fsName,
					fileName: destinationData.fileName + '.flr2d',
				});
		
		} else {
			_callback(exporterHelpers.exportTypes.RIVE, exporterHelpers.exportStatuses.SUCCESS);
		}
	}


	ob.save = save;
    ob.saveSuccess = saveSuccess;
    ob.saveFailed = saveFailed;
    
    return ob;
}());