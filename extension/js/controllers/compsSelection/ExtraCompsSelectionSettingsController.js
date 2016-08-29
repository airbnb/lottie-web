var ExtraCompsSelectionSettingsController = (function(){
    var ob = {};
    ob.init = init;
    ob.show = show;
    ob.hide = hide;
    ob.updateList = updateList;

    var compositionsContainer;
    var template;
    var compsList = [], selectedList;

    function handleElementClick(ev){
        var closest = $(ev.target).closest('tr');
        var id = closest.attr('data-comp-id');
        toggleCompSelection(id);
    }

    function toggleCompSelection(id){
        console.log('toggleCompSelection:',id);
        var i = 0, len = compsList.length;
        while(i<len){
            if(compsList[i].id == id){
                compsList[i].selected = !compsList[i].selected;
                if(compsList[i].selected){
                    compsList[i].elem.addClass('selected');
                    selectedList.push(id);
                } else {
                    compsList[i].elem.removeClass('selected');
                    selectedList.splice(selectedList.indexOf(id),1);
                }
                break;
            }
            i += 1;

        }
        console.log(selectedList);
    }

    function markCompsAsSelected(){

        var i, len = selectedList.length, j, jLen = compsList.length, id;
        for(i=0;i<len;i+=1){
            j = 0;
            id = selectedList[i];
            while(j<jLen){
                if(compsList[j].id == id){
                    compsList[j].selected = true;
                    compsList[j].elem.addClass('selected');
                    break;
                }
                j += 1;
            }
            if(j === jLen){
                selectedList.splice(i,1);
                i -= 1;
                len -= 1;
            }
        }



        var j = 0, len = compsList.length;

    }

    function init(element){
        compositionsContainer = element.find('.extraCompositions').find('tbody');
        compositionsContainer.hide();
        compositionsContainer.on('click', handleElementClick);
    }

    function show(){
        compositionsContainer.show();
    }

    function hide(){
        compositionsContainer.hide();
    }

    function markCompsAsErasable(){
        var i, len = compsList.length;
        for(i=0;i<len;i+=1){
            compsList[i].erasable = true;
        }
    }

    function removeMarkedComps(){
        var i, len = compsList.length;
        for(i=0;i<len;i+=1){
            if(compsList[i].erasable){
                compositionsContainer.remove(compsList[i].elem);
                compsList.splice(i,1);
                i -= 1;
                len -= 1;
            }
            compsList[i].erasable = true;
        }
    }

    function findCompElementData(elementData){
        var i = 0, len = compsList.length, compData;
        while(i<len){
            if(compsList[i].id == elementData.id){
                compData = compsList[i];
                compData.erasable = false;
                break;
            }
            i += 1;
        }
        var compElement;
        if(!compData){
            compElement = $(Mustache.render(template));
            compData = {
                erasable: false,
                id: elementData.id,
                elem: compElement,
                selected: false
            };
            compElement.attr('data-comp-id',compData.id);
            compsList.push(compData);
        }
        compData.selected = false;
        compElement = compData.elem;
        compElement.removeClass('selected');
        compElement.find('.name').text(elementData.name);
        return compData;
    }

    function updateList(compositions, selected){
        selectedList = selected;
        if(!template){
            template = document.getElementById('extraCompsSelectionTemplate').innerHTML;
        }
        markCompsAsErasable();
        var i, len = compositions.length, compData;
        for(i=0;i<len;i+=1){
            compData = findCompElementData(compositions[i]);
            compositionsContainer.append(compData.elem);
        }
        markCompsAsSelected();
        removeMarkedComps();
        //
        //template = document.getElementById('fontTemplate').innerHTML;
        //output = Mustache.render(template, {fontData: fonts[i], storedData: storedData});
        //fontElem = $(output);

    }


    return ob;
}());