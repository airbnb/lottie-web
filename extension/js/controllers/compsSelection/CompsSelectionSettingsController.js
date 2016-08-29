var SelectionSettings = function (view) {
        
    var ob = {}, settingsView, compData, tempData = {}, callback;
    var segments, segmentsCheckbox, segmentsTextBox, compositions;
    var standalone, standaloneCheckbox;
    var demo, demoCheckbox;
    var glyphs,hiddens,guideds,extraComps, glyphsCheckbox,guidedsCheckbox,hiddensCheckbox, extraCompsCheckbox;

    function updateSegmentsData() {
        if (tempData.segmented) {
            segments.addClass('active');
            segmentsCheckbox.addClass('selected');
            segmentsTextBox.prop('disabled', '');
        } else {
            segments.removeClass('active');
            segmentsCheckbox.removeClass('selected');
            segmentsTextBox.prop('disabled', 'disabled');
        }
        segmentsTextBox.val(tempData.segmentTime);
    }

    function updateStandaloneData() {
        if (tempData.standalone) {
            standaloneCheckbox.addClass('selected');
        } else {
            standaloneCheckbox.removeClass('selected');
        }
    }

    function updateDemoData() {
        if (tempData.demo) {
            demoCheckbox.addClass('selected');
        } else {
            demoCheckbox.removeClass('selected');
        }
    }

    function updateGlyphsData() {
        if (tempData.glyphs) {
            glyphsCheckbox.addClass('selected');
        } else {
            glyphsCheckbox.removeClass('selected');
        }
    }

    function updateHiddensData() {
        if (tempData.hiddens) {
            hiddensCheckbox.addClass('selected');
        } else {
            hiddensCheckbox.removeClass('selected');
        }
    }
    function updateExtraCompsData() {
        if (tempData.extraComps && tempData.extraComps.active) {
            extraCompsCheckbox.addClass('selected');
            ExtraCompsSelectionSettingsController.show();
            ExtraCompsSelectionSettingsController.updateList(compositions,tempData.extraComps.list);
        } else {
            extraCompsCheckbox.removeClass('selected');
            ExtraCompsSelectionSettingsController.hide();
        }
    }

    function updateGuidedsData() {
        if (tempData.guideds) {
            guidedsCheckbox.addClass('selected');
        } else {
            guidedsCheckbox.removeClass('selected');
        }
    }

    function handleSegmentCheckboxClick() {
        tempData.segmented = !tempData.segmented;
        updateSegmentsData();
        mainController.saveData();
    }

    function handleStandaloneCheckboxClick() {
        tempData.standalone = !tempData.standalone;
        updateStandaloneData();
        mainController.saveData();
    }

    function handleDemoCheckboxClick() {
        tempData.demo = !tempData.demo;
        updateDemoData();
        mainController.saveData();
    }

    function handleGlyphsCheckboxClick() {
        tempData.glyphs = !tempData.glyphs;
        updateGlyphsData();
        mainController.saveData();
    }

    function handleHiddensCheckboxClick() {
        tempData.hiddens = !tempData.hiddens;
        updateHiddensData();
        mainController.saveData();
    }

    function handleExtraCompsCheckboxClick() {
        tempData.extraComps.active = !tempData.extraComps.active;
        updateExtraCompsData();
        mainController.saveData();
    }

    function handleGuidedsCheckboxClick() {
        tempData.guideds = !tempData.guideds;
        updateGuidedsData();
        mainController.saveData();
    }

    function cancelSettings() {
        settingsView.hide();
    }

    function saveSettings() {
        tempData.segmentTime = segmentsTextBox.val();
        compData = JSON.parse(JSON.stringify(tempData));
        callback.apply(null, [compData]);
        settingsView.hide();
    }

    function init() {
        settingsView = view.find('.settingsView');
        settingsView.hide();
        segments = settingsView.find('.segments');
        segments.find('.checkboxCombo').on('click', handleSegmentCheckboxClick);
        segmentsCheckbox = segments.find('.checkbox');
        segmentsTextBox = segments.find('.inputText');
        standalone = settingsView.find('.standalone');
        standalone.find('.checkboxCombo').on('click', handleStandaloneCheckboxClick);
        standaloneCheckbox = standalone.find('.checkbox');
        demo = settingsView.find('.demo');
        demo.find('.checkboxCombo').on('click', handleDemoCheckboxClick);
        demoCheckbox = demo.find('.checkbox');
        glyphs = settingsView.find('.glyphs');
        glyphs.find('.checkboxCombo').on('click', handleGlyphsCheckboxClick);
        hiddens = settingsView.find('.hiddens');
        hiddens.find('.checkboxCombo').on('click', handleHiddensCheckboxClick);
        extraComps = settingsView.find('.extraComps');
        extraComps.find('.checkboxCombo').on('click', handleExtraCompsCheckboxClick);
        guideds = settingsView.find('.guideds');
        guideds.find('.checkboxCombo').on('click', handleGuidedsCheckboxClick);
        glyphsCheckbox = glyphs.find('.checkbox');
        hiddensCheckbox = hiddens.find('.checkbox');
        extraCompsCheckbox = extraComps.find('.checkbox');
        guidedsCheckbox = guideds.find('.checkbox');
        settingsView.find('.buttons .cancel').on('click', cancelSettings);
        settingsView.find('.buttons .return').on('click', saveSettings);
        ExtraCompsSelectionSettingsController.init(settingsView);
        updateAllData();
    }
    
    function updateAllData(){
        updateSegmentsData();
        updateStandaloneData();
        updateDemoData();
        updateGlyphsData();
        updateHiddensData();
        updateExtraCompsData();
        updateGuidedsData();
    }

    function show(data, cb, comps) {
        settingsView.show();
        compData = data;
        tempData = JSON.parse(JSON.stringify(compData));
        callback = cb;
        compositions = comps;
        updateAllData();
    }

    ob.init = init;
    ob.show = show;
    return ob;
};