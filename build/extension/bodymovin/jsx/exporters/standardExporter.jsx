/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, Folder, $*/

$.__bodymovin.bm_standardExporter = (function () {

	var bm_fileManager = $.__bodymovin.bm_fileManager;
	var exporterHelpers = $.__bodymovin.bm_exporterHelpers;
	var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
	var ob = {}
	var _callback;
	var _destinationData;

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
					var destinationFolder = ['standard'];
					while (j < jLen) {
						destinationFolder.push(filePath[j]);
						j += 1;
					}
					var destinationFileData = bm_fileManager.createFile(fileData.name, destinationFolder);
					file.copy(destinationFileData.file.fsName);
				}
			}
			i += 1;
		}
	}

	function moveAssetsToDestination() {
		var rawFiles = bm_fileManager.getFilesOnPath(['standard']);
		var i = 0, len = rawFiles.length;
		while(i < len) {
			var fileData = bm_fileManager.getFileById(rawFiles[i].id);
			if (fileData) {
				var file = fileData.file;
				if(file.exists) {
					var filePath = fileData.path;
					var j = 1, jLen = filePath.length;
					var destinationFolder = new Folder(_destinationData.folder.fsName);
					while (j < jLen) {
						destinationFolder.changePath(filePath[j]);
						if (!destinationFolder.exists) {
							destinationFolder.create();
						}
						j += 1;
					}
					var destinationFile = new File(destinationFolder.fsName);
					destinationFile.changePath(fileData.name);
					file.copy(destinationFile.fsName);
				}
			}
			i += 1;
		}
		_callback(exporterHelpers.exportTypes.STANDARD, exporterHelpers.exportStatuses.SUCCESS);
	}
	
	function save(destinationPath, config, callback, data) {

		_callback = callback;

		if (config.export_modes.standard) {
			_destinationData = exporterHelpers.parseDestination(destinationPath, '');

			var destinationFile = new File(_destinationData.folder.fsName);
			destinationFile.changePath(_destinationData.fileName + '.json');

			copyAssets();

			if (config.segmented) {

				var temporaryFolder = bm_fileManager.getTemporaryFolder();
				var originFolder = new Folder(temporaryFolder.fsName);
				originFolder.changePath('raw');
				var destinationFolder = new Folder(temporaryFolder.fsName);
				destinationFolder.changePath('standard');

				bm_eventDispatcher.sendEvent('bm:split:animation', 
				{
					origin: originFolder.fsName, 
					destination: destinationFolder.fsName,
					fileName: _destinationData.fileName,
					time: config.segmentedTime,
				});
				
			} else {
				moveAssetsToDestination();
			}

		} else {
			_callback(exporterHelpers.exportTypes.STANDARD, exporterHelpers.exportStatuses.SUCCESS);
		}

	}

	function splitSuccess(totalSegments) {
		for (var i = 0; i < totalSegments; i += 1) {
			bm_fileManager.createFile(_destinationData.fileName  + '_' + i + '.json', ['standard']);
		}
		moveAssetsToDestination();
	}

	function splitFailed() {
		_callback(exporterHelpers.exportTypes.STANDARD, exporterHelpers.exportStatuses.FAILED);
	}

	ob.save = save;
	ob.splitSuccess = splitSuccess;
	ob.splitFailed = splitFailed;
	
	return ob;
}());