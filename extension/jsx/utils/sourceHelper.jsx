/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global layerElement, bm_generalUtils, bm_eventDispatcher, bm_renderManager, bm_compsManager, File, app*/
var bm_sourceHelper = (function () {
    'use strict';
    var compSources = [], imageSources = [], fonts = [], currentExportingImage, destinationPath, assetsArray, folder, helperComp, currentCompID, imageCount = 0;
    var ob = {};

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
    
    function checkImageSource(item) {
        var arr = imageSources;
        var i = 0, len = arr.length, isRendered = false;
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
            name: item.name,
            id: 'image_' + imageCount
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
    
    function saveNextImage() {
        if (bm_compsManager.cancelled) {
            return;
        }
        if (currentExportingImage === imageSources.length) {
            bm_renderManager.imagesReady();
            return;
        }
        var currentSourceData = imageSources[currentExportingImage];
        bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Exporting image: ' + currentSourceData.name, compId: currentCompID, progress: currentExportingImage / imageSources.length});
        var currentSource = currentSourceData.source;
        assetsArray.push({
            id: currentSourceData.id,
            w: currentSourceData.width,
            h: currentSourceData.height,
            p: 'images/img_' + currentExportingImage + '.png'
        });
        var helperComp = app.project.items.addComp('tempConverterComp', Math.max(4, currentSource.width), Math.max(4, currentSource.height), 1, 1, 1);
        helperComp.layers.add(currentSource);
        var file = new File(folder.absoluteURI + '/img_' + currentExportingImage + '.png');
        helperComp.saveFrameToPng(0, file);
        helperComp.remove();
        currentExportingImage += 1;
        saveNextImage();
    }
    
    function createAtlas() {
        var i, len = imageSources.length;
        var imagesList = [];
        for (i = 0; i < len; i += 1) {
            imagesList.push({
                w: imageSources[i].width + 4,
                h: imageSources[i].height + 4,
                id: imageSources[i].id
            });
        }
        bm_eventDispatcher.sendEvent('bm:render:atlas', {images: imagesList});
    }
    
    function getSourceDataById(id) {
        var i = 0, len = imageSources.length;
        while( i < len) {
            if(imageSources[i].id === id) {
                return imageSources[i];
            }
            i += 1;
        }
    }
    
    function setAtlasData(blocks) {
        if (bm_compsManager.cancelled) {
            return;
        }
        var compWidth = 0;
        var compHeight = 0;
        var i, len = blocks.length;
        for (i = 0; i < len; i += 1) {
            compWidth = Math.max(blocks[i].fit.w + blocks[i].fit.x, compWidth);
            compHeight = Math.max(blocks[i].fit.h + blocks[i].fit.y, compHeight);
        }
        var helperComp = app.project.items.addComp('atlasConverterComp', Math.max(4, compWidth), Math.max(4, compHeight), 1, 1, 1);
        var source, sourceData, layer;
        for (i = 0; i < len; i += 1) {
            sourceData = getSourceDataById(blocks[i].id);
            source = sourceData.source;
            layer = helperComp.layers.add(source);
            layer.transform['Anchor Point'].setValue([0, 0]);
            layer.transform['Position'].setValue([blocks[i].fit.x + 2, blocks[i].fit.y + 2]);
            assetsArray.push({
                id: blocks[i].id,
                w: blocks[i].w,
                h: blocks[i].h,
                x: blocks[i].fit.x + 2,
                y: blocks[i].fit.y + 2,
                p: 'images/atlas_' + '0' + '.png'
            });
        }
        bm_eventDispatcher.log('assetsArray len: ' + assetsArray.length);
        bm_renderManager.imagesReady(assetsArray);
        var file = new File(folder.absoluteURI + '/atlas_' + '0' + '.png');
        helperComp.saveFrameToPng(0, file);
        helperComp.remove();
    }
    
    function saveImages() {
        if (ob.atlas) {
            createAtlas();
        } else {
            saveNextImage();
        }
    }
    
    function exportImages(path, assets, compId) {
        if (imageSources.length === 0) {
            bm_renderManager.imagesReady();
            return;
        }
        currentCompID = compId;
        bm_eventDispatcher.sendEvent('bm:render:update', {type: 'update', message: 'Exporting images', compId: currentCompID, progress: 0});
        currentExportingImage = 0;
        var file = new File(path);
        folder = file.parent;
        folder.changePath('images/');
        assetsArray = assets;
        if (!folder.exists) {
            if (folder.create()) {
                saveImages();
            } else {
                bm_eventDispatcher.sendEvent('alert', 'folder failed to be created at: ' + folder.fsName);
            }
        } else {
            saveImages();
        }
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
        fonts.length = 0;
        imageCount = 0;
        assetsArray = null;
    }
    
    ob = {
        checkCompSource: checkCompSource,
        checkImageSource: checkImageSource,
        setCompSourceId: setCompSourceId,
        setAtlasData: setAtlasData,
        exportImages : exportImages,
        addFont : addFont,
        getFonts : getFonts,
        atlas: true,
        reset: reset
    };
    
    return ob;
    
}());