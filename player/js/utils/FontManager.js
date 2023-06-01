import createNS from './helpers/svg_elements';
import createTag from './helpers/html_elements';
import getFontProperties from './getFontProperties';

const FontManager = (function () {
  var maxWaitingTime = 5000;
  var emptyChar = {
    w: 0,
    size: 0,
    shapes: [],
    data: {
      shapes: [],
    },
  };
  var combinedCharacters = [];
  // Hindi characters
  combinedCharacters = combinedCharacters.concat([2304, 2305, 2306, 2307, 2362, 2363, 2364, 2364, 2366,
    2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379,
    2380, 2381, 2382, 2383, 2387, 2388, 2389, 2390, 2391, 2402, 2403]);

  var BLACK_FLAG_CODE_POINT = 127988;
  var CANCEL_TAG_CODE_POINT = 917631;
  var A_TAG_CODE_POINT = 917601;
  var Z_TAG_CODE_POINT = 917626;
  var VARIATION_SELECTOR_16_CODE_POINT = 65039;
  var ZERO_WIDTH_JOINER_CODE_POINT = 8205;
  var REGIONAL_CHARACTER_A_CODE_POINT = 127462;
  var REGIONAL_CHARACTER_Z_CODE_POINT = 127487;

  var surrogateModifiers = [
    'd83cdffb',
    'd83cdffc',
    'd83cdffd',
    'd83cdffe',
    'd83cdfff',
  ];

  function trimFontOptions(font) {
    var familyArray = font.split(',');
    var i;
    var len = familyArray.length;
    var enabledFamilies = [];
    for (i = 0; i < len; i += 1) {
      if (familyArray[i] !== 'sans-serif' && familyArray[i] !== 'monospace') {
        enabledFamilies.push(familyArray[i]);
      }
    }
    return enabledFamilies.join(',');
  }

  function setUpNode(font, family) {
    var parentNode = createTag('span');
    // Node is invisible to screen readers.
    parentNode.setAttribute('aria-hidden', true);
    parentNode.style.fontFamily = family;
    var node = createTag('span');
    // Characters that vary significantly among different fonts
    node.innerText = 'giItT1WQy@!-/#';
    // Visible - so we can measure it - but not on the screen
    parentNode.style.position = 'absolute';
    parentNode.style.left = '-10000px';
    parentNode.style.top = '-10000px';
    // Large font size makes even subtle changes obvious
    parentNode.style.fontSize = '300px';
    // Reset any font properties
    parentNode.style.fontVariant = 'normal';
    parentNode.style.fontStyle = 'normal';
    parentNode.style.fontWeight = 'normal';
    parentNode.style.letterSpacing = '0';
    parentNode.appendChild(node);
    document.body.appendChild(parentNode);

    // Remember width with no applied web font
    var width = node.offsetWidth;
    node.style.fontFamily = trimFontOptions(font) + ', ' + family;
    return { node: node, w: width, parent: parentNode };
  }

  function checkLoadedFonts() {
    var i;
    var len = this.fonts.length;
    var node;
    var w;
    var loadedCount = len;
    for (i = 0; i < len; i += 1) {
      if (this.fonts[i].loaded) {
        loadedCount -= 1;
      } else if (this.fonts[i].fOrigin === 'n' || this.fonts[i].origin === 0) {
        this.fonts[i].loaded = true;
      } else {
        node = this.fonts[i].monoCase.node;
        w = this.fonts[i].monoCase.w;
        if (node.offsetWidth !== w) {
          loadedCount -= 1;
          this.fonts[i].loaded = true;
        } else {
          node = this.fonts[i].sansCase.node;
          w = this.fonts[i].sansCase.w;
          if (node.offsetWidth !== w) {
            loadedCount -= 1;
            this.fonts[i].loaded = true;
          }
        }
        if (this.fonts[i].loaded) {
          this.fonts[i].sansCase.parent.parentNode.removeChild(this.fonts[i].sansCase.parent);
          this.fonts[i].monoCase.parent.parentNode.removeChild(this.fonts[i].monoCase.parent);
        }
      }
    }

    if (loadedCount !== 0 && Date.now() - this.initTime < maxWaitingTime) {
      setTimeout(this.checkLoadedFontsBinded, 20);
    } else {
      setTimeout(this.setIsLoadedBinded, 10);
    }
  }

  function createHelper(fontData, def) {
    var engine = (document.body && def) ? 'svg' : 'canvas';
    var helper;
    var fontProps = getFontProperties(fontData);
    if (engine === 'svg') {
      var tHelper = createNS('text');
      tHelper.style.fontSize = '100px';
      // tHelper.style.fontFamily = fontData.fFamily;
      tHelper.setAttribute('font-family', fontData.fFamily);
      tHelper.setAttribute('font-style', fontProps.style);
      tHelper.setAttribute('font-weight', fontProps.weight);
      tHelper.textContent = '1';
      if (fontData.fClass) {
        tHelper.style.fontFamily = 'inherit';
        tHelper.setAttribute('class', fontData.fClass);
      } else {
        tHelper.style.fontFamily = fontData.fFamily;
      }
      def.appendChild(tHelper);
      helper = tHelper;
    } else {
      var tCanvasHelper = new OffscreenCanvas(500, 500).getContext('2d');
      tCanvasHelper.font = fontProps.style + ' ' + fontProps.weight + ' 100px ' + fontData.fFamily;
      helper = tCanvasHelper;
    }
    function measure(text) {
      if (engine === 'svg') {
        helper.textContent = text;
        return helper.getComputedTextLength();
      }
      return helper.measureText(text).width;
    }
    return {
      measureText: measure,
    };
  }

  function addFonts(fontData, defs) {
    if (!fontData) {
      this.isLoaded = true;
      return;
    }
    if (this.chars) {
      this.isLoaded = true;
      this.fonts = fontData.list;
      return;
    }
    if (!document.body) {
      this.isLoaded = true;
      fontData.list.forEach((data) => {
        data.helper = createHelper(data);
        data.cache = {};
      });
      this.fonts = fontData.list;
      return;
    }

    var fontArr = fontData.list;
    var i;
    var len = fontArr.length;
    var _pendingFonts = len;
    for (i = 0; i < len; i += 1) {
      var shouldLoadFont = true;
      var loadedSelector;
      var j;
      fontArr[i].loaded = false;
      fontArr[i].monoCase = setUpNode(fontArr[i].fFamily, 'monospace');
      fontArr[i].sansCase = setUpNode(fontArr[i].fFamily, 'sans-serif');
      if (!fontArr[i].fPath) {
        fontArr[i].loaded = true;
        _pendingFonts -= 1;
      } else if (fontArr[i].fOrigin === 'p' || fontArr[i].origin === 3) {
        loadedSelector = document.querySelectorAll('style[f-forigin="p"][f-family="' + fontArr[i].fFamily + '"], style[f-origin="3"][f-family="' + fontArr[i].fFamily + '"]');

        if (loadedSelector.length > 0) {
          shouldLoadFont = false;
        }

        if (shouldLoadFont) {
          var s = createTag('style');
          s.setAttribute('f-forigin', fontArr[i].fOrigin);
          s.setAttribute('f-origin', fontArr[i].origin);
          s.setAttribute('f-family', fontArr[i].fFamily);
          s.type = 'text/css';
          s.innerText = '@font-face {font-family: ' + fontArr[i].fFamily + "; font-style: normal; src: url('" + fontArr[i].fPath + "');}";
          defs.appendChild(s);
        }
      } else if (fontArr[i].fOrigin === 'g' || fontArr[i].origin === 1) {
        loadedSelector = document.querySelectorAll('link[f-forigin="g"], link[f-origin="1"]');

        for (j = 0; j < loadedSelector.length; j += 1) {
          if (loadedSelector[j].href.indexOf(fontArr[i].fPath) !== -1) {
            // Font is already loaded
            shouldLoadFont = false;
          }
        }

        if (shouldLoadFont) {
          var l = createTag('link');
          l.setAttribute('f-forigin', fontArr[i].fOrigin);
          l.setAttribute('f-origin', fontArr[i].origin);
          l.type = 'text/css';
          l.rel = 'stylesheet';
          l.href = fontArr[i].fPath;
          document.body.appendChild(l);
        }
      } else if (fontArr[i].fOrigin === 't' || fontArr[i].origin === 2) {
        loadedSelector = document.querySelectorAll('script[f-forigin="t"], script[f-origin="2"]');

        for (j = 0; j < loadedSelector.length; j += 1) {
          if (fontArr[i].fPath === loadedSelector[j].src) {
            // Font is already loaded
            shouldLoadFont = false;
          }
        }

        if (shouldLoadFont) {
          var sc = createTag('link');
          sc.setAttribute('f-forigin', fontArr[i].fOrigin);
          sc.setAttribute('f-origin', fontArr[i].origin);
          sc.setAttribute('rel', 'stylesheet');
          sc.setAttribute('href', fontArr[i].fPath);
          defs.appendChild(sc);
        }
      }
      fontArr[i].helper = createHelper(fontArr[i], defs);
      fontArr[i].cache = {};
      this.fonts.push(fontArr[i]);
    }
    if (_pendingFonts === 0) {
      this.isLoaded = true;
    } else {
      // On some cases even if the font is loaded, it won't load correctly when measuring text on canvas.
      // Adding this timeout seems to fix it
      setTimeout(this.checkLoadedFonts.bind(this), 100);
    }
  }

  function addChars(chars) {
    if (!chars) {
      return;
    }
    if (!this.chars) {
      this.chars = [];
    }
    var i;
    var len = chars.length;
    var j;
    var jLen = this.chars.length;
    var found;
    for (i = 0; i < len; i += 1) {
      j = 0;
      found = false;
      while (j < jLen) {
        if (this.chars[j].style === chars[i].style && this.chars[j].fFamily === chars[i].fFamily && this.chars[j].ch === chars[i].ch) {
          found = true;
        }
        j += 1;
      }
      if (!found) {
        this.chars.push(chars[i]);
        jLen += 1;
      }
    }
  }

  function getCharData(char, style, font) {
    var i = 0;
    var len = this.chars.length;
    while (i < len) {
      if (this.chars[i].ch === char && this.chars[i].style === style && this.chars[i].fFamily === font) {
        return this.chars[i];
      }
      i += 1;
    }
    if (((typeof char === 'string' && char.charCodeAt(0) !== 13) || !char)
            && console
            && console.warn // eslint-disable-line no-console
            && !this._warned
    ) {
      this._warned = true;
      console.warn('Missing character from exported characters list: ', char, style, font); // eslint-disable-line no-console
    }
    return emptyChar;
  }

  function measureText(char, fontName, size) {
    var fontData = this.getFontByName(fontName);
    // Using the char instead of char.charCodeAt(0)
    // to avoid collisions between equal chars
    var index = char;
    if (!fontData.cache[index]) {
      var tHelper = fontData.helper;
      if (char === ' ') {
        var doubleSize = tHelper.measureText('|' + char + '|');
        var singleSize = tHelper.measureText('||');
        fontData.cache[index] = (doubleSize - singleSize) / 100;
      } else {
        fontData.cache[index] = tHelper.measureText(char) / 100;
      }
    }
    return fontData.cache[index] * size;
  }

  function getFontByName(name) {
    var i = 0;
    var len = this.fonts.length;
    while (i < len) {
      if (this.fonts[i].fName === name) {
        return this.fonts[i];
      }
      i += 1;
    }
    return this.fonts[0];
  }

  function getCodePoint(string) {
    var codePoint = 0;
    var first = string.charCodeAt(0);
    if (first >= 0xD800 && first <= 0xDBFF) {
      var second = string.charCodeAt(1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return codePoint;
  }

  // Skin tone modifiers
  function isModifier(firstCharCode, secondCharCode) {
    var sum = firstCharCode.toString(16) + secondCharCode.toString(16);
    return surrogateModifiers.indexOf(sum) !== -1;
  }

  function isZeroWidthJoiner(charCode) {
    return charCode === ZERO_WIDTH_JOINER_CODE_POINT;
  }

  // This codepoint may change the appearance of the preceding character.
  // If that is a symbol, dingbat or emoji, U+FE0F forces it to be rendered
  // as a colorful image as compared to a monochrome text variant.
  function isVariationSelector(charCode) {
    return charCode === VARIATION_SELECTOR_16_CODE_POINT;
  }

  // The regional indicator symbols are a set of 26 alphabetic Unicode
  /// characters (A–Z) intended to be used to encode ISO 3166-1 alpha-2
  // two-letter country codes in a way that allows optional special treatment.
  function isRegionalCode(string) {
    var codePoint = getCodePoint(string);
    if (codePoint >= REGIONAL_CHARACTER_A_CODE_POINT && codePoint <= REGIONAL_CHARACTER_Z_CODE_POINT) {
      return true;
    }
    return false;
  }

  // Some Emoji implementations represent combinations of
  // two “regional indicator” letters as a single flag symbol.
  function isFlagEmoji(string) {
    return isRegionalCode(string.substr(0, 2)) && isRegionalCode(string.substr(2, 2));
  }

  function isCombinedCharacter(char) {
    return combinedCharacters.indexOf(char) !== -1;
  }

  // Regional flags start with a BLACK_FLAG_CODE_POINT
  // folowed by 5 chars in the TAG range
  // and end with a CANCEL_TAG_CODE_POINT
  function isRegionalFlag(text, index) {
    var codePoint = getCodePoint(text.substr(index, 2));
    if (codePoint !== BLACK_FLAG_CODE_POINT) {
      return false;
    }
    var count = 0;
    index += 2;
    while (count < 5) {
      codePoint = getCodePoint(text.substr(index, 2));
      if (codePoint < A_TAG_CODE_POINT || codePoint > Z_TAG_CODE_POINT) {
        return false;
      }
      count += 1;
      index += 2;
    }
    return getCodePoint(text.substr(index, 2)) === CANCEL_TAG_CODE_POINT;
  }

  function setIsLoaded() {
    this.isLoaded = true;
  }

  var Font = function () {
    this.fonts = [];
    this.chars = null;
    this.typekitLoaded = 0;
    this.isLoaded = false;
    this._warned = false;
    this.initTime = Date.now();
    this.setIsLoadedBinded = this.setIsLoaded.bind(this);
    this.checkLoadedFontsBinded = this.checkLoadedFonts.bind(this);
  };
  Font.isModifier = isModifier;
  Font.isZeroWidthJoiner = isZeroWidthJoiner;
  Font.isFlagEmoji = isFlagEmoji;
  Font.isRegionalCode = isRegionalCode;
  Font.isCombinedCharacter = isCombinedCharacter;
  Font.isRegionalFlag = isRegionalFlag;
  Font.isVariationSelector = isVariationSelector;
  Font.BLACK_FLAG_CODE_POINT = BLACK_FLAG_CODE_POINT;

  var fontPrototype = {
    addChars: addChars,
    addFonts: addFonts,
    getCharData: getCharData,
    getFontByName: getFontByName,
    measureText: measureText,
    checkLoadedFonts: checkLoadedFonts,
    setIsLoaded: setIsLoaded,
  };

  Font.prototype = fontPrototype;

  return Font;
}());

export default FontManager;
