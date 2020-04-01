/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, Folder, $*/

$.__bodymovin.bm_exporterHelpers = (function () {

	var bm_fileManager = $.__bodymovin.bm_fileManager;
	var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
	var JSON = $.__bodymovin.JSON;

	var ob = {}

	function getJsonData(rawFiles) {
		var i = 0, len = rawFiles.length;
		while(i < len) {
			if(rawFiles[i].name.indexOf('.json') !== -1) {
				break;
			}
			i += 1;
		}
		var fileData = bm_fileManager.getFileById(rawFiles[i].id);
		var jsonFile = fileData.file;
		jsonFile.open('r');
		var content = jsonFile.read();
		jsonFile.close();
		return content;
	}

	function saveAssets(rawFiles, destinationFolder) {
		var i = 0, len = rawFiles.length;
		// TODO improve this solution
		while(i < len) {
			if(rawFiles[i].name.indexOf('.json') === -1) {
				var fileData = bm_fileManager.getFileById(rawFiles[i].id);
				if (fileData) {
					var file = fileData.file;
					if(file.exists) {
						var destinationFileFolder = new Folder(destinationFolder.fsName);
						// TODO improve this solution even more
						destinationFileFolder.changePath('images');
						if (!destinationFileFolder.exists) {
							destinationFileFolder.create();
						}
						var destinationFile = new File(destinationFileFolder.fsName);
						destinationFile.changePath(file.name);
						file.copy(destinationFile.fsName);
					}
				}
			}
			i += 1;
		}
	}

	function parseDestination(destinationPath, subFolder) {
		var destinationFile = new File(destinationPath);
		var destinationFolder = new Folder(destinationFile.parent);
		if (subFolder) {
			destinationFolder.changePath(subFolder);
			if(!destinationFolder.exists) {
				destinationFolder.create();
			}
		}
		var destinationFileName = destinationFile.name;
        var destinationFileNameWithoutExtension = destinationFileName.substr(0, destinationFileName.lastIndexOf('.'));
        var destinationExtension = destinationFileName.substr(destinationFileName.lastIndexOf('.') + 1);

        return {
        	extension: destinationExtension,
        	file: destinationFile,
        	fileName: destinationFileNameWithoutExtension,
        	folder: destinationFolder,
        	fullFileName: destinationFileName,
        }
	}


	ob.getJsonData = getJsonData;
	ob.saveAssets = saveAssets;
	ob.parseDestination = parseDestination;
	
	ob.exportTypes = {
		AVD: 'avd',
		BANNER: 'banner',
		DEMO: 'demo',
		RIVE: 'rive',
		STANDALONE: 'standalone',
		STANDARD: 'standard',
	};

	ob.exportStatuses = {
		IDLE: 'idle',
		SUCCESS: 'success',
		FAILED: 'failed',
	};
    
    return ob;
}());