/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global layerElement, $, RQItemStatus, File, app, PREFType */
$.__bodymovin.bm_sourceHelper = (function () {
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_compsManager = $.__bodymovin.bm_compsManager;
    var bm_renderManager = $.__bodymovin.bm_renderManager;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var compSources = [], imageSources = [], videoSources = [], fonts = []
    , currentExportingImage, assetsArray, folder, currentCompID
    , originalNamesFlag, originalAssetsFlag, imageCount = 0, videoCount = 0, imageNameIndex = 0;
    var currentSavingAsset;
    var queue, playSound, autoSave, canEditPrefs = true;
    var _lastSecond = -1;
    var _lastMilliseconds = -1;

    function checkCompSource(item) {
        var arr = compSources;
        var i = 0, len = arr.length, isRendered = false;
        while (i < len) {
            if (arr[i].source === item.source) {
                isRendered = true;
                break;
            }
            i += 1;
        }
        if (isRendered) {
            return arr[i].id;
        }
        arr.push({
            source: item.source
        });
        return false;
    }

    function checkVideoSource(item) {
        var i = 0, len = videoSources.length;
        while (i < len) {
            if (videoSources[i].source === item.source) {
                return videoSources[i].id;
            }
            i += 1;
        }
        videoSources.push({
            source: item.source,
            width: item.source.width,
            height: item.source.height,
            source_name: item.source.name,
            name: item.name,
            id: 'video_' + videoCount,
        });
        videoCount += 1;
        return videoSources[videoSources.length - 1].id;
    }
    
    function checkImageSource(item) {
        var arr = imageSources;
        var i = 0, len = arr.length;
        while (i < len) {
            if (arr[i].source === item.source) {
                return arr[i].id;
            }
            i += 1;
        }
        arr.push({
            source: item.source,
            width: item.source.width,
            height: item.source.height,
            source_name: item.source.name,
            name: item.name,
            id: 'image_' + imageCount,
        });
        imageCount += 1;
        return arr[arr.length - 1].id;
    }
    
    function setCompSourceId(source, id) {
        var i = 0, len = compSources.length;
        while (i < len) {
            if (compSources[i].source === source) {
                compSources[i].id = id;
            }
            i += 1;
        }
    }

    //                  A-Z      - .    0 - 9     _      a-z
    var validRanges = [[65,90],[45,46],[48,57],[95,95],[97,122]]

    function isValidChar(charCode) {
        var i = 0, len = validRanges.length;
        while(i < len) {
            if(charCode >= validRanges[i][0] && charCode <= validRanges[i][1]){
                return true
            }
            i += 1;
        }
        return false
    }

    function checkSanitizedNameExists(name) {
        var i = 0, len = assetsArray.length;
        while (i < len) {
            if(assetsArray[i].p === name) {
                return true
            }
            i += 1;
        }
        return false
    }

    function incrementSanizitedName(name) {
        return name + '_' + imageNameIndex++
    }

    function formatImageName(name) {
        var sanitizedName = '';
        var totalChars = name.lastIndexOf('.');
        var extensionIndex = name.lastIndexOf('.')
        var extension = extensionIndex !== -1 ? name.substr(extensionIndex) : '.png'
        if(totalChars < 0){
            totalChars = name.length;
        }
        var i;
        for(i = 0; i < totalChars; i += 1) {
            var charCode = name.charCodeAt(i)
            if(isValidChar(charCode)) {
                sanitizedName += name.substr(i,1)
            } else {
                sanitizedName += '_'
            }
            if(checkSanitizedNameExists(sanitizedName + extension)){
                sanitizedName = incrementSanizitedName(sanitizedName)
            }
        }
        return sanitizedName + extension;
    }

    function getImageName(originalName, generatedName, extension) {
        
        var imageName;

        if (originalNamesFlag) {
            imageName = formatImageName(originalName);
        } else {
            imageName = generatedName;
            if (originalAssetsFlag) {
                imageName += originalName.substr(originalName.lastIndexOf('.')) || '.' + extension
            } else {
                imageName += '.' + extension;
            }
        }

        return imageName;
    }

    function saveFilesToFolder() {
        /***
        var temporaryFolder = bm_fileManager.getTemporaryFolder();
        bm_eventDispatcher.log('saveFilesToFolder')
        var i, len = assetsArray.length;
        var copyingFile;
        for(i = 0; i < len; i += 1) {
            bm_eventDispatcher.log('saveFilesToFolder: ' + i);
            if(!assetsArray[i].e) {
                bm_eventDispatcher.log('saveFilesToFolder: ' + temporaryFolder.absoluteURI+'/'+assetsArray[i].p);
                copyingFile = new File(temporaryFolder.absoluteURI+'/'+assetsArray[i].p);
                if(copyingFile.exists) {
                    if(!folder.exists) {
                        folder.create()
                    }
                    copyingFile.copy(folder.absoluteURI+'/'+copyingFile.name);
                }
            }
        }
        
        var files = temporaryFolder.getFiles();
        len = files.length;
        for(i = 0; i < len; i += 1) {
            files[i].remove();
        }
        temporaryFolder.remove();
        ***/
    }

    //// IMAGE SEQUENCE FUNCTIONS

    var sequenceSources = [], sequenceSourcesStills = []
    var currentExportingImageSequenceIndex = 0;
    var currentExportingVideoIndex = 0;
    var sequenceSourcesStillsCount = 0;
    var currentStillIndex = 0;
    var currentSequenceTotalFrames = 0;
    var sequenceCount = 0;
    var helperSequenceComp = null;

    function searchSequenceSource(item) {
        var i = 0, len = sequenceSources.length;
        while (i < len) {
            if (sequenceSources[i].source === item.source) {
                return sequenceSources[i].id;
            }
            i += 1;
        }
        return false;
    }

    function addSequenceSource(item) {
        var sequenceSource = {
            source: item.source,
            id: 'sequence_' + sequenceCount++,
        }
        sequenceSources.push(sequenceSource);
        return sequenceSource.id;
    }

    function addImageSequenceStills(source, totalFrames) {

        var i = 0;
        var sequenceRange = []
        for(i = 0; i < totalFrames; i += 1) {
            sequenceRange.push('imgSeq_' + sequenceSourcesStillsCount++)
        }

        var sequenceStills = {
            totalFrames: totalFrames,
            source: source,
            name: source.name,
            source_name: source.name,
            range: sequenceRange,
            width: source.width,
            height: source.height,
            
        }
        sequenceSourcesStills.push(sequenceStills);
        sequenceSourcesStillsCount += totalFrames;
        return sequenceStills.range;
    }

    function getSequenceSourceBySource(source) {
        var i = 0, len = sequenceSources.length;
        while (i < len) {
            if (sequenceSources[i].source === source) {
                return sequenceSources[i].id;
            }
            i += 1;
        }
    }

    // Adding time offset between renders to prevent AE bug when saving logs with the same name.
    function scheduleNextSaveStilInSequence() {

        var now = new Date();
        var newSecond = now.getSeconds();
        var newMilliSeconds = now.getMilliseconds();
        if (newSecond !== _lastSecond || originalAssetsFlag) {
            _lastSecond = newSecond;
            _lastMilliseconds = newMilliSeconds;
            saveNextStillInSequence();
        } else {
            app.scheduleTask('$.__bodymovin.bm_sourceHelper.scheduleNextSaveStilInSequence();', (1000 - _lastMilliseconds), false);
        }
    }

    // Adding time offset between renders to prevent AE bug when saving logs with the same name.
    function scheduleNextSaveImage() {

        var now = new Date();
        var newSecond = now.getSeconds();
        var newMilliSeconds = now.getMilliseconds();
        if (newSecond !== _lastSecond) {
            _lastSecond = newSecond;
            _lastMilliseconds = newMilliSeconds;
            saveNextImage();
        } else {
            app.scheduleTask('$.__bodymovin.bm_sourceHelper.scheduleNextSaveImage();', (1000 - _lastMilliseconds), false);
        }
    }

    function updateCurrentSecond() {
        var now = new Date();
        var newSecond = now.getSeconds();
        _lastSecond = newSecond;
    }

    function saveNextStillInSequence() {

        if (currentStillIndex === currentSequenceTotalFrames) {
            currentExportingImageSequenceIndex += 1;
            if (helperSequenceComp) {
                helperSequenceComp.remove();
            }
            saveNextImageSequence();
            return;
        }

        var currentSourceData = sequenceSourcesStills[currentExportingImageSequenceIndex];
        var totalFrames = currentSourceData.totalFrames;

        bm_eventDispatcher.sendEvent('bm:render:update', 
            {
                type: 'update', 
                message: 'Exporting sequence: ' + currentSourceData.name,
                compId: currentCompID,
                progress: currentStillIndex / totalFrames
            }
        );

        var imageName = getImageName(currentSourceData.source_name, 'seq_' + currentExportingImageSequenceIndex + '_' + currentStillIndex, 'png');

        var renderFileData = bm_fileManager.createFile(imageName, ['raw','images']);
        var file = renderFileData.file;

        currentSavingAsset = {
            id: currentSourceData.range[currentStillIndex],
            w: currentSourceData.width,
            h: currentSourceData.height,
            t: 'seq',
            u: 'images/',
            p: imageName,
            e: 0,
            fileId: renderFileData.id,
        }
        assetsArray.push(currentSavingAsset);

        if (!originalAssetsFlag) {

            helperSequenceComp.workAreaStart = Math.max(0, Math.min(totalFrames - 3, currentStillIndex - 1)) / currentSourceData.source.frameRate;
            helperSequenceComp.workAreaDuration = 3 / currentSourceData.source.frameRate;

            // Add composition item to render queue and set to render.
            var item = app.project.renderQueue.items.add(helperSequenceComp);
            item.render = true;

            // Set output parameters.
            // NOTE: Use hidden template '_HIDDEN X-Factor 8 Premul', which exports png with alpha.
            var outputModule = item.outputModule(1);
            outputModule.applyTemplate("_HIDDEN X-Factor 8 Premul");
            outputModule.file = file;

            // Set cleanup.
            item.onStatusChanged = function() {
                if (item.status === RQItemStatus.DONE) {
                    updateCurrentSecond();
                    // Due to an apparent bug, "00000" is appended to the file extension.
                    // NOTE: This appears to be related to the "File Template" setting's
                    //       frame number parameter ('[#####]').
                    //       However, attempts to fix this by setting the "File Template"
                    //       and/or "File Name" parameter of the output module's "Output
                    //       File Info" setting had no effect.
                    // NOTE: Also tried setting output module's "Use Comp Frame Number"
                    //       setting to false.
                    // NOTE: Bug confirmed in Adobe After Effects CC v15.0.1 (build 73).


                    var imgIndex = currentStillIndex.toString();
                    while(imgIndex.length < 5) {
                        imgIndex = '0' + imgIndex;
                    }

                    var bug = new File(file.fsName + imgIndex);
                    if (bug.exists) {
                        bug.rename(imageName);
                    }

                    bm_eventDispatcher.sendEvent('bm:image:process', {
                        /***
                        path: temporaryFolder.fsName + '/' + imageName, 
                        ***/
                        path: file.fsName, 
                        should_compress: bm_renderManager.shouldCompressImages(), 
                        compression_rate: bm_renderManager.getCompressionQuality()/100,
                        should_encode_images: bm_renderManager.shouldEncodeImages()
                    })

                }
            };

            // Render.
            app.project.renderQueue.render();
        } else {

            var currentSourceFile = currentSourceData.source.file;
            var currentSourceFilePath = currentSourceFile.fsName;
            var newName = getNextImageName(currentSourceFilePath, currentStillIndex)
            var copyingFile = new File(newName)
            if (copyingFile.exists) {
                copyingFile.copy(file.fsName)
            } else {
                // This will copy the original file in all sequence.
                // Adding it so nothing break for a missing file
                // But this would mean that the sequence has not been found.
                // TODO: inform the user about this and stop render
                currentSourceFile.copy(file.fsName)
            }
            updateCurrentSecond();

            bm_eventDispatcher.sendEvent('bm:image:process', {
                /***
                path: temporaryFolder.fsName + '/' + imageName, 
                ***/
                path: file.fsName, 
                should_compress: bm_renderManager.shouldCompressImages(), 
                compression_rate: bm_renderManager.getCompressionQuality()/100,
                should_encode_images: bm_renderManager.shouldEncodeImages()
            })
        }
        
    }

    function getNextImageName(text, index) {
        var regex = /[0-9]+/g
        var flag = true;
        var lastMatch;
        while (flag) {
            var match = regex.exec(text)
            if (!match) {
                flag = false;
            } else {
                lastMatch = match
            }
        }
        if (lastMatch) {
            var value = lastMatch[0]
            var num = parseInt(value) + index
            var newValue = num.toString()
            var count = 0;
            while(newValue.length < value.length) {
                newValue = value.substr(count, 1) + newValue
            }
            var newTexto = text.substr(0, lastMatch.index)
            newTexto += newValue
            newTexto += text.substr(lastMatch.index + value.length)
            return newTexto;
        }
        return '';
    }

    function saveSequence() {
        var currentSourceData = sequenceSourcesStills[currentExportingImageSequenceIndex];
        currentStillIndex = 0;
        currentSequenceTotalFrames = currentSourceData.totalFrames;
        var frameRate = currentSourceData.source.frameRate;

        if (!originalAssetsFlag) {
            helperSequenceComp = app.project.items.addComp('tempConverterComp', Math.max(4, currentSourceData.width), Math.max(4, currentSourceData.height), 1, (currentSourceData.totalFrames + 1) / frameRate, frameRate);
            helperSequenceComp.layers.add(currentSourceData.source);
        }
        scheduleNextSaveStilInSequence();

    }

    function saveVideo() {

        var currentSourceData = videoSources[currentExportingVideoIndex];
        var sourceExtension = currentSourceData.source_name.substr(currentSourceData.source_name.lastIndexOf('.') + 1) || 'mp4';
        var imageName = getImageName(currentSourceData.source_name, 'vid_' + currentExportingVideoIndex, sourceExtension);
        var renderFileData = bm_fileManager.createFile(imageName, ['raw','images']);
        var file = renderFileData.file;
        var currentSourceFile = currentSourceData.source.file;
        currentSourceFile.copy(file.fsName);
        assetsArray.push({
            id: currentSourceData.id,
            w: currentSourceData.width,
            h: currentSourceData.height,
            u: 'images/',
            p: imageName,
            e: 0,
            fileId: renderFileData.id
        });

        currentExportingVideoIndex += 1;
        app.scheduleTask('$.__bodymovin.bm_sourceHelper.saveNextVideo();', 20, false);
        
    }

    function saveNextVideo() {
        if (currentExportingVideoIndex === videoSources.length) {
            finishImageSave();
        } else {
            saveVideo();
        }
    }

    function saveNextImageSequence() {
        if (currentExportingImageSequenceIndex === sequenceSourcesStills.length) {
            saveNextVideo();
        } else {
            saveSequence();
        }
    }

    //// IMAGE SEQUENCE FUNCTIONS END

    function finishImageSave() {

        saveFilesToFolder();
        restoreRenderQueue(queue);

        if(canEditPrefs) {
            app.preferences.savePrefAsLong("Misc Section", "Play sound when render finishes", playSound, PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            app.preferences.savePrefAsLong("Auto Save", "Enable Auto Save RQ2", autoSave, PREFType.PREF_Type_MACHINE_INDEPENDENT);   
        }
        bm_renderManager.imagesReady();
    }
    
    function saveNextImage() {
        if (bm_compsManager.cancelled) {
            return;
        }
        if (currentExportingImage === imageSources.length) {
            saveNextImageSequence();
            return;
        }
        var currentSourceData = imageSources[currentExportingImage];
        bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Exporting image: ' + currentSourceData.name, compId: currentCompID, progress: currentExportingImage / imageSources.length});
        var currentSource = currentSourceData.source;
        var imageName = getImageName(currentSourceData.source_name, 'img_' + currentExportingImage, 'png');
        
        var renderFileData = bm_fileManager.createFile(imageName, ['raw','images']);
        var file = renderFileData.file;

        currentSavingAsset = {
            id: currentSourceData.id,
            w: currentSourceData.width,
            h: currentSourceData.height,
            u: 'images/',
            p: imageName,
            e: 0,
            fileId: renderFileData.id
        }
        assetsArray.push(currentSavingAsset);

        if (!originalAssetsFlag) {
            var helperComp = app.project.items.addComp('tempConverterComp', Math.max(4, currentSource.width), Math.max(4, currentSource.height), 1, 1, 1);
            helperComp.layers.add(currentSource);



            // Add composition item to render queue and set to render.
            var item = app.project.renderQueue.items.add(helperComp);
            item.render = true;

            // Set output parameters.
            // NOTE: Use hidden template '_HIDDEN X-Factor 8 Premul', which exports png with alpha.
            var outputModule = item.outputModule(1);
            outputModule.applyTemplate("_HIDDEN X-Factor 8 Premul");
            outputModule.file = file;

            // Set cleanup.
            item.onStatusChanged = function() {
                if (item.status === RQItemStatus.DONE) {
                    updateCurrentSecond();
                    // Due to an apparent bug, "00000" is appended to the file extension.
                    // NOTE: This appears to be related to the "File Template" setting's
                    //       frame number parameter ('[#####]').
                    //       However, attempts to fix this by setting the "File Template"
                    //       and/or "File Name" parameter of the output module's "Output
                    //       File Info" setting had no effect.
                    // NOTE: Also tried setting output module's "Use Comp Frame Number"
                    //       setting to false.
                    // NOTE: Bug confirmed in Adobe After Effects CC v15.0.1 (build 73).
                    /***
                    var bug = new File(temporaryFolder.absoluteURI + '/' + imageName + '00000');
                    ***/
                    var bug = new File(file.fsName + '00000');
                    if (bug.exists) {
                        bug.rename(imageName);
                    }

                    bm_eventDispatcher.sendEvent('bm:image:process', {
                        /***
                        path: temporaryFolder.fsName + '/' + imageName, 
                        ***/
                        path: file.fsName, 
                        should_compress: bm_renderManager.shouldCompressImages(), 
                        compression_rate: bm_renderManager.getCompressionQuality()/100,
                        should_encode_images: bm_renderManager.shouldEncodeImages()
                    })
                }
            };

            // Render.
            app.project.renderQueue.render();

            helperComp.remove();
        } else {
            var currentSourceFile = currentSourceData.source.file;
            currentSourceFile.copy(file.fsName);
            updateCurrentSecond();

            bm_eventDispatcher.sendEvent('bm:image:process', {
                /***
                path: temporaryFolder.fsName + '/' + imageName, 
                ***/
                path: file.fsName, 
                should_compress: bm_renderManager.shouldCompressImages(), 
                compression_rate: bm_renderManager.getCompressionQuality()/100,
                should_encode_images: bm_renderManager.shouldEncodeImages()
            })
        }
    }

    function imageProcessed(changedFlag, encoded_data) {
        
        //For now all images are pngs
        if(changedFlag) {
            currentSavingAsset.p = currentSavingAsset.p.replace(new RegExp('png' + '$'), 'jpg')
            bm_fileManager.replaceFileExtension(currentSavingAsset.fileId, 'jpg');
        }
        if(encoded_data) {
            currentSavingAsset.p = encoded_data;
            currentSavingAsset.u = '';
            currentSavingAsset.e = 1;
            bm_fileManager.removeFile(currentSavingAsset.fileId);
        }
        if(currentSavingAsset.t === 'seq') {
            currentStillIndex += 1;
            scheduleNextSaveStilInSequence();
        } else {
            currentExportingImage += 1;
            scheduleNextSaveImage();
        }
    }
    
    function renderQueueIsBusy() {
        for (var i = 1; i <= app.project.renderQueue.numItems; i++) {
            if (app.project.renderQueue.item(i).status == RQItemStatus.RENDERING) {
                return true;
            }
        }
        return false;
    }

    function backupRenderQueue() {
        var queue = [];
        for (var i = 1; i <= app.project.renderQueue.numItems; i++) {
            var item = app.project.renderQueue.item(i);
            if (item.status === RQItemStatus.QUEUED) {
                queue.push(i);
                item.render = false;
            }
        }
        return queue;
    }

    function restoreRenderQueue(queue) {
        for (var i = 0; i < queue.length; i++) {
            app.project.renderQueue.item(queue[i]).render = true;
        }
    }

    function exportImages(path, assets, compId, _originalNamesFlag, _originalAssetsFlag) {
        if ((imageSources.length === 0 && sequenceSourcesStills.length === 0 && videoSources.length === 0) || bm_renderManager.shouldSkipImages()) {
            bm_renderManager.imagesReady();
            return;
        }
        if (renderQueueIsBusy()) {
            bm_eventDispatcher.sendEvent('bm:alert', {message: 'Render queue is currently busy. \n\rCan\'t continue with render.\n\rCheck for elements in AE\'s render queue in a Rendering status, remove them and try again.'});
            return;
        }
        currentCompID = compId;
        originalNamesFlag = _originalNamesFlag;
        originalAssetsFlag = _originalAssetsFlag;
        bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Exporting images', compId: currentCompID, progress: 0});
        currentExportingImage = 0;
        currentExportingImageSequenceIndex = 0;
        currentExportingVideoIndex = 0;
        var file = new File(path);
        folder = file.parent;
        folder.changePath('images/');
        assetsArray = assets;

        try {
            playSound = app.preferences.getPrefAsLong("Misc Section", "Play sound when render finishes", PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            autoSave = app.preferences.getPrefAsLong("Auto Save", "Enable Auto Save RQ2", PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            app.preferences.savePrefAsLong("Misc Section", "Play sound when render finishes", 0, PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            app.preferences.savePrefAsLong("Auto Save", "Enable Auto Save RQ2", 0, PREFType.PREF_Type_MACHINE_INDEPENDENT);
        }  catch(err) {
            canEditPrefs = false;
        }

        queue = backupRenderQueue();
        scheduleNextSaveImage();  
    }
    
    function addFont(fontName, fontFamily, fontStyle) {
        var i = 0, len = fonts.length;
        while (i < len) {
            if (fonts[i].name === fontName && fonts[i].family === fontFamily && fonts[i].style === fontStyle) {
                return;
            }
            i += 1;
        }
        fonts.push({
            name: fontName,
            family: fontFamily,
            style: fontStyle
        }
                  );
    }
    
    function getFonts() {
        return fonts;
    }
    
    function reset() {
        compSources.length = 0;
        imageSources.length = 0;
        videoSources.length = 0;
        sequenceSources.length = 0;
        sequenceSourcesStills.length = 0;
        fonts.length = 0;
        imageCount = 0;
        videoCount = 0;
        sequenceCount = 0;
        sequenceSourcesStillsCount = 0;
        imageNameIndex = 0;
    }
    
    return {
        imageProcessed: imageProcessed,
        checkCompSource: checkCompSource,
        checkImageSource: checkImageSource,
        checkVideoSource: checkVideoSource,
        searchSequenceSource: searchSequenceSource,
        addSequenceSource: addSequenceSource,
        addImageSequenceStills: addImageSequenceStills,
        getSequenceSourceBySource: getSequenceSourceBySource,
        setCompSourceId: setCompSourceId,
        exportImages : exportImages,
        addFont : addFont,
        getFonts : getFonts,
        reset: reset,
        scheduleNextSaveStilInSequence: scheduleNextSaveStilInSequence,
        scheduleNextSaveImage: scheduleNextSaveImage,
        saveNextVideo: saveNextVideo,
    };
    
}());