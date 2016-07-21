var bm_XMPHelper = (function(){
    var ob = {};
    ob.init = init;
    ob.created = true;
    ob.setMetadata = setMetadata;
    ob.getMetadata = getMetadata;
    var namespace = 'bodymovin';
    
    function init(){
        var proj = app.project;

        if(ExternalObject.AdobeXMPScript == undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if(schemaNS == "" || schemaNS == undefined) {
            schemaNS = XMPMeta.registerNamespace(namespace, namespace);
        }
    }
    
   function setMetadata(property, value) {
        var proj = app.project;

        if(ExternalObject.AdobeXMPScript == undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }
        var metaData = new XMPMeta(proj.xmpPacket);
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if(schemaNS == "" || schemaNS == undefined) {
        } else {
            try {
                metaData.setProperty(schemaNS, namespace+":"+property, value);
                ob.created = true;
            } catch(err) {
                ob.created = false;
            }
        }
        proj.xmpPacket = metaData.serialize();
    }


    // To get metadata from within a script, a function like so:
    function getMetadata(property) {
        var proj = app.project;


        if(ExternalObject.AdobeXMPScript == undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }
        var metaData = new XMPMeta(proj.xmpPacket);
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if(schemaNS == "" || schemaNS == undefined) {
            return undefined;
        }
        var metaValue = metaData.getProperty(schemaNS, property);
        if(!metaValue) {
            return undefined;
        }
        return metaValue.value;
    } 
    
    init();
    
    return ob;
}())