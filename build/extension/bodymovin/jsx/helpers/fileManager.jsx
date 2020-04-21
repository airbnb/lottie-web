/*global $, Folder */

$.__bodymovin.bm_fileManager = (function () {

    var temporaryFolder, renderFiles = [];
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;

    var _isLocked = false;

	var ob = {
        createTemporaryFolder: createTemporaryFolder,
        getTemporaryFolder: getTemporaryFolder,
        addFile: addFile,
        createFile: createFile,
        getFilesOnPath: getFilesOnPath,
        getFileById: getFileById,
        replaceFileExtension: replaceFileExtension,
        removeFile: removeFile,
		removeOldTemporaryFolder: removeOldTemporaryFolder,
	};

    function createTemporaryFolder() {
        var folder_random_name = bm_generalUtils.random(10);
        temporaryFolder = new Folder(Folder.temp.absoluteURI);
        temporaryFolder.changePath('Bodymovin/' + folder_random_name);
        if (!temporaryFolder.exists) {
            if (!temporaryFolder.create()) {
                bm_eventDispatcher.sendEvent('alert', 'folder failed to be created at: ' + temporaryFolder.fsName);
                return false;
            }
        }
        renderFiles = [];
        return true;
    }

    function getTemporaryFolder() {
        return temporaryFolder;
    }

    function addFile(fileName, path, content) {
        var renderFileData = createFile(fileName, path);
        var dataFile = renderFileData.file;
        dataFile.open('w', 'TEXT', '????');
        dataFile.encoding = 'UTF-8';
        try {
            dataFile.write(content); //DO NOT ERASE, JSON UNFORMATTED
            //dataFile.write(JSON.stringify(ob.renderData.exportData, null, '  ')); //DO NOT ERASE, JSON FORMATTED
            dataFile.close();
        } catch (err) {
            bm_eventDispatcher.sendEvent('bm:alert', {message: 'Could not write file.<br /> Make sure you have enabled scripts to write files. <br /> Edit > Preferences > General > Allow Scripts to Write Files and Access Network '});
        }
        return renderFileData;
    }

    function createFile(fileName, path) {
        var i = 0, len = path.length;
        var fileFolder = new Folder(temporaryFolder.absoluteURI);
        while (i < len) {
            fileFolder.changePath(path[i]);
            if (!fileFolder.exists) {
                fileFolder.create();
            }
            i += 1;
        }
        var file = new File(fileFolder.absoluteURI);
        file.changePath(decodeURIComponent(fileName));
        
        var renderFile = {
            name: fileName,
            path: path,
            id: bm_generalUtils.random(10),
            file: file
        }
        renderFiles.push(renderFile);
        return renderFile;
    }

    function isRenderFileOnPath(file, path) {
        var filePath = file.path;
        for(var i = 0; i < path.length; i += 1) {
            if(filePath[i] !== path[i]) {
                return false;
            }
        }
        return true;
    }

    function getFilesOnPath(path) {
        var files = [];
        var i, len = renderFiles.length;
        for (i = 0; i < len; i += 1) {
            if(isRenderFileOnPath(renderFiles[i], path)) {
                files.push(renderFiles[i])
            }
        }
        return files;
    }

    function getFileById(id) {
        var i, len = renderFiles.length, renderFile;
        for (i = 0; i < len; i += 1) {
            renderFile = renderFiles[i];
            if (renderFile.id === id) {
                return renderFile;
            }
        }
    }

    function getIndexById(id) {
        var i, len = renderFiles.length, renderFile;
        for (i = 0; i < len; i += 1) {
            renderFile = renderFiles[i];
            if (renderFile.id === id) {
                return i;
            }
        }
    }

    function replaceFileExtension(id, extension) {
        var renderFileData = getFileById(id);
        renderFileData.name = renderFileData.name.substr(0, renderFileData.name.lastIndexOf('.') + 1);
        renderFileData.name += extension;
        var file = renderFileData.file;
        file.changePath(file.parent.fsName);
        file.changePath(renderFileData.name);
    }

    function removeFile(id) {
        var renderFileIndex = getIndexById(id);
        var renderFileData = getFileById(id);
        var file = renderFileData.file;
        file.remove();
        renderFiles.splice(renderFileIndex, 1);
    }

    function removeFolderContent(folder) {
        var folderFiles = folder.getFiles();
        var fileOrFolder;
        for(var i = 0; i < folderFiles.length; i += 1) {
            fileOrFolder = folderFiles[i];
            if (fileOrFolder.constructor === Folder) {
                removeFolderContent(fileOrFolder);
            } else {
                fileOrFolder.remove();
            }
        }
        folder.remove();
    }

    function removeOldTemporaryFolder() {
        if(_isLocked) {
            return;
        }
        _isLocked = true;
        var currentDate = new Date();
        var appTemporaryFolder = new Folder(Folder.temp.absoluteURI);
        appTemporaryFolder.changePath('Bodymovin');
        var appFolderFiles = appTemporaryFolder.getFiles();
        var temporaryRemovableFolder;
        for(var i = 0; i < appFolderFiles.length; i += 1) {
            temporaryRemovableFolder = appFolderFiles[i];
            if (temporaryRemovableFolder.getFiles) {
                var createdDate = temporaryRemovableFolder.created;
                var elapsedTime = (currentDate.getTime() - createdDate.getTime()) / 1000;
                if (elapsedTime > 60 * 60 * 24) { // 1 day keeping temp files
                    removeFolderContent(temporaryRemovableFolder);
                }
            }
        }
        _isLocked = false;
    }

	return ob;
}())