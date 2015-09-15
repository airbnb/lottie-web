var FontManager = (function(){

    var maxWaitingTime = 5000;

    function setUpNode(font, family){
        var parentNode = document.createElement('span');
        parentNode.style.fontFamily    = family;
        var node = document.createElement('span');
        // Characters that vary significantly among different fonts
        node.innerHTML = 'giItT1WQy@!-/#';
        // Visible - so we can measure it - but not on the screen
        parentNode.style.position      = 'absolute';
        parentNode.style.left          = '-10000px';
        parentNode.style.top           = '-10000px';
        // Large font size makes even subtle changes obvious
        parentNode.style.fontSize      = '300px';
        // Reset any font properties
        parentNode.style.fontVariant   = 'normal';
        parentNode.style.fontStyle     = 'normal';
        parentNode.style.fontWeight    = 'normal';
        parentNode.style.letterSpacing = '0';
        parentNode.appendChild(node);
        document.body.appendChild(parentNode);

        // Remember width with no applied web font
        var width = node.offsetWidth;
        node.style.fontFamily = font + ', '+family;
        return {node:node, w:width, parent:parentNode};
    }

    function checkLoadedFonts() {
        var i, len = this.fonts.length;
        var node, w;
        var loadedCount = len;
        for(i=0;i<len; i+= 1){
            if(this.fonts[i].loaded){
                loadedCount -= 1;
                continue;
            }
            node = this.fonts[i].monoCase.node;
            w = this.fonts[i].monoCase.w;
            if(node.offsetWidth !== w){
                loadedCount -= 1;
                this.fonts[i].loaded = true;
            }else{
                node = this.fonts[i].sansCase.node;
                w = this.fonts[i].sansCase.w;
                if(node.offsetWidth !== w){
                    loadedCount -= 1;
                    this.fonts[i].loaded = true;
                }
            }
            if(this.fonts[i].loaded){
                this.fonts[i].sansCase.parent.parentNode.removeChild(this.fonts[i].sansCase.parent);
                this.fonts[i].monoCase.parent.parentNode.removeChild(this.fonts[i].monoCase.parent);
            }
        }

        if(loadedCount !== 0 && Date.now() - this.initTime < maxWaitingTime){
            setTimeout(checkLoadedFonts.bind(this),20);
        }else{
            this.loaded = true;
        }
    };

    function waitForTypekit() {
        if(window.Typekit && window.Typekit.load){
            try{Typekit.load({ async: false });}catch(e){console.log('errwor',e)}
        }else{
            setTimeout(waitForTypekit,50);
        }
    }

    function addFonts(fontData, defs){
        if(!fontData){
            this.loaded = true;
            return;
        }
        console.log(fontData);
        if(fontData.tk){
            var s = document.createElement('script');
            s.setAttribute('src',fontData.tk);
            defs.appendChild(s);
            waitForTypekit();

        }
        var fontArr = fontData.list;
        var i, len = fontArr.length;
        for(i=0; i<len; i+= 1){
            fontArr[i].loaded = false;
            fontArr[i].monoCase = setUpNode(fontArr[i].fFamily,'monospace');
            fontArr[i].sansCase = setUpNode(fontArr[i].fFamily,'sans-serif');
            if(fontArr[i].fPath){
                if(fontArr[i].fPath){
                    var s = document.createElement('style');
                    s.type = "text/css";
                    s.innerHTML = "@font-face {" + "font-family: "+fontArr[i].fFamily+"; font-style: normal; src: url('"+fontArr[i].fPath+"');}";
                    defs.appendChild(s);
                }
            }
            this.fonts.push(fontArr[i]);
        }
        checkLoadedFonts.bind(this)();
    }

    function addChars(chars){
        this.chars = chars;
        console.log(this.chars.length);
    }

    function getCharData(char, size, font){
        var i = 0, len = this.chars.length;
        while( i < len) {
            if(this.chars[i].ch === char && this.chars[i].size === size && this.chars[i].fFamily === font){
                return this.chars[i];
            }
            i+= 1;
        }
    }

    function getFontByName(name){
        var i = 0, len = this.fonts.length;
        while(i<len){
            if(this.fonts[i].fName === name) {
                return this.fonts[i].fFamily;
            }
            i += 1;
        }
        return 'sans-serif';
    }

    var Font = function(){
        this.fonts = [];
        this.chars = [];
        this.loaded = false;
        this.initTime = Date.now();
    };
    Font.prototype.addChars = addChars;
    Font.prototype.addFonts = addFonts;
    Font.prototype.getCharData = getCharData;
    Font.prototype.getFontByName = getFontByName;

    return Font;

}());