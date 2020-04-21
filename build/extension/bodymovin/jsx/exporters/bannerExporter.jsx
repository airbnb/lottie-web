/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, Folder, $*/

$.__bodymovin.bm_bannerExporter = (function () {

	var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
	var bm_downloadManager = $.__bodymovin.bm_downloadManager;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var exporterHelpers = $.__bodymovin.bm_exporterHelpers;
	var bm_projectManager;
	var ob = {};
	var lottiePaths = [];
	var _callback;

	function getLottiePath(bannerConfig) {
		var sourcePath = '';
		if (bannerConfig.lottie_origin === 'local' || bannerConfig.lottie_origin === 'cdnjs') {
			var i = 0, len = lottiePaths.length;
			while ( i < len) {
				if(lottiePaths[i].value === bannerConfig.lottie_library) {
					sourcePath = lottiePaths[i][bannerConfig.lottie_origin];
				}
				i += 1;
			}
		} else if (bannerConfig.lottie_origin === 'file system') {
			sourcePath = 'lottie.js'
		} else {
			sourcePath = bannerConfig.lottie_path
		}
		return sourcePath;
	}

	function getSizes(bannerConfig) {
		return {
			width: bannerConfig.use_original_sizes ? bannerConfig.original_width : bannerConfig.width,
			height: bannerConfig.use_original_sizes ? bannerConfig.original_height : bannerConfig.height,
		}
	}

	function createTemplate(config, filePathName, animationStringData) {
		var bannerConfig = config.banner
		var templateData = bm_downloadManager.getTemplateData()
		var sizes = getSizes(bannerConfig)

		templateData = templateData
		.replace(/__CONTENT_WIDTH__/g, sizes.width)
		.replace(/__CONTENT_HEIGHT__/g, sizes.height)
		.replace(/__LOTTIE_RENDERER__/g, bannerConfig.lottie_renderer)
		.replace(/__CLICK_TAG__/g, bannerConfig.click_tag)
		.replace(/__LOTTIE_SOURCE__/g, getLottiePath(bannerConfig))

		if (bannerConfig.shouldIncludeAnimationDataInTemplate) {
			templateData = templateData
			.replace(/__DATA_LOAD__/g, 'animationData: ' + animationStringData)
		} else {
			templateData = templateData
			.replace(/__DATA_LOAD__/g, 'path: \'' + filePathName + '\'')
			
		}

		if (bannerConfig.shouldLoop) {
			templateData = templateData
			.replace(/__LOOP__/g, 'true')
		} else if (bannerConfig.loopCount === 0 || bannerConfig.loopCount === '0') {
			templateData = templateData
			.replace(/__LOOP__/g, 'false')
		} else {
			templateData = templateData
			.replace(/__LOOP__/g, bannerConfig.loopCount)
		}

		var indexFile = bm_fileManager.addFile('index.html', ['banner'], templateData)

		return [indexFile];

		// var dataFile = new File(savingFolder.fullName + '/index.html');
		// dataFile.open('w', 'TEXT', '????');
		// dataFile.encoding = 'UTF-8';
		// dataFile.write(templateData);
		// dataFile.close();

	}

	function includeLottiePlayer(bannerConfig) {
		var i = 0, len = lottiePaths.length, sourcePath;
		while ( i < len) {
			if(lottiePaths[i].value === bannerConfig.lottie_library) {
				sourcePath = lottiePaths[i][bannerConfig.lottie_origin];
			}
			i += 1;
		}
		var file = bm_projectManager.getFile('/assets/player/' + sourcePath)

		var lottieFileData = bm_fileManager.createFile(sourcePath, ['banner'])

		file.copy(lottieFileData.file.fsName);

		return [lottieFileData];
	}

	function includeLocalFilePlayer(bannerConfig) {

		if (bannerConfig.localPath) {

			var file = new File(bannerConfig.localPath.absoluteURI)

			var lottieFileData = bm_fileManager.createFile('lottie.js', ['banner'])

			file.copy(lottieFileData.file.fsName);

			return [lottieFileData];
		} else {
			return [];
		}
	}

	function copyAssets() {

		var rawFiles = bm_fileManager.getFilesOnPath(['raw']);
		var copiedFiles = [];

		var i = 0, len = rawFiles.length;
		// TODO improve this solution
		while(i < len) {
			if(rawFiles[i].name.indexOf('.json') === -1) {
				var fileData = bm_fileManager.getFileById(rawFiles[i].id);
				if (fileData) {
					var file = fileData.file;
					if(file.exists) {
						var destinationFileData = bm_fileManager.createFile(fileData.name, ['banner', 'images'])
						file.copy(destinationFileData.file.fsName)
						copiedFiles.push(destinationFileData);
					}
				}
			}
			i += 1;
		}

		return copiedFiles;
	}

	function includeAdditionalFiles(config) {

		var additionalFiles = [];

		if (!bm_projectManager) {
			bm_projectManager = $.__bodymovin.bm_projectManager;
		}
		var bannerConfig = config.banner
		if (bannerConfig.lottie_origin === 'local') {
			additionalFiles = additionalFiles.concat(includeLottiePlayer(bannerConfig));
		} else if (bannerConfig.lottie_origin === 'file system') {
			additionalFiles = additionalFiles.concat(includeLocalFilePlayer(bannerConfig));
		}
		additionalFiles = additionalFiles.concat(copyAssets());

		return additionalFiles;
	}

	function copyBannerFolder(destinationFolder) {
		var bannerFiles = bm_fileManager.getFilesOnPath(['banner']);
		var i, len = bannerFiles.length;
		var j, jLen;
		var copiedFile, copiedDestinationFolder, bannerFileData, bannerFile;
		for (i = 0; i < len; i += 1) {
			bannerFileData = bannerFiles[i];
			bannerFile = bannerFileData.file;
			jLen = bannerFileData.path.length;
			j = 1;
			copiedDestinationFolder = new Folder(destinationFolder.fsName);
			while (j < jLen) {
				copiedDestinationFolder.changePath(bannerFileData.path[j]);
				if(!copiedDestinationFolder.exists) {
					copiedDestinationFolder.create();
				}
				j += 1;
			}
			copiedFile = new File(copiedDestinationFolder.fsName);
			copiedFile.changePath(bannerFileData.name);
			bannerFile.copy(copiedFile.fsName);
		}
		_callback(exporterHelpers.exportTypes.BANNER, exporterHelpers.exportStatuses.SUCCESS);
	}

	function save(destinationPath, config, callback) {

		_callback = callback;

		if (config.export_modes.banner) {
			var destinationData = exporterHelpers.parseDestination(destinationPath, 'banner');

			var rawFiles = bm_fileManager.getFilesOnPath(['raw']);

			var animationStringData = exporterHelpers.getJsonData(rawFiles);

			var bannerConfig = config.banner;


			var bannerFiles = [];
			bannerFiles = bannerFiles.concat(createTemplate(config, destinationData.fileName + '.json', animationStringData));
			bannerFiles = bannerFiles.concat(includeAdditionalFiles(config));

			if(!bannerConfig.shouldIncludeAnimationDataInTemplate) {
				var jsonFile =  bm_fileManager.addFile(destinationData.fileName + '.json', ['banner'], animationStringData);
				bannerFiles.push(jsonFile);
			}
			
			if (bannerConfig.zip_files) {
				var temporaryFolder = bm_fileManager.getTemporaryFolder();
				var bannerFolder = new Folder(temporaryFolder.fsName);
				bannerFolder.changePath('banner');
				bm_eventDispatcher.sendEvent(
					'bm:zip:banner', 
					{
						destinationPath: destinationData.folder.fsName + '/' + destinationData.fileName + '.zip', 
						folderPath: bannerFolder.fsName
					}
				);
			} else {
				copyBannerFolder(destinationData.folder)
			}
		} else {
			_callback(exporterHelpers.exportTypes.BANNER, exporterHelpers.exportStatuses.SUCCESS);
		}
	}

	function setLottiePaths(paths) {
		lottiePaths = paths
	}

	function bannerFinished() {
		_callback(exporterHelpers.exportTypes.BANNER, exporterHelpers.exportStatuses.SUCCESS);
	}

	function bannerFailed() {
		_callback(exporterHelpers.exportTypes.BANNER, exporterHelpers.exportStatuses.FAILED);
	}

	ob.save = save;
	ob.setLottiePaths = setLottiePaths;
	ob.bannerFinished = bannerFinished;
	ob.bannerFailed = bannerFailed;
    
    return ob;
}());