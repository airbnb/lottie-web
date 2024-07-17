/* eslint-disable max-classes-per-file */
/* eslint-disable no-continue */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */

const utils = {
  css: function (element, property) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
  },

  compare: function (a, b) {
    return ['top', 'left', 'right', 'bottom'].every((key) => a[key] === b[key]);
  },

  detectTextDirection: function (/* DOMRectList */rects) {
    if (rects.length === 0) {
      return TextDirection.Undefined;
    } if (rects.length === 1) {
      return TextDirection.LTR;
    }
    let left = rects[0].left;
    let right = rects[0].right;
    let goingRight;
    let goingLeft;
    for (const rect of rects) {
      if (goingRight === undefined && goingLeft === undefined) {
        // First rectangle
        if (rects[0].left <= rects[rects.length - 1].right) {
          goingLeft = false;
          goingRight = true;
        } else {
          goingLeft = true;
          goingRight = false;
        }
      } else if (utils.equal(right, rect.left)) { // We are going sequentially right
        if (goingLeft) {
          return TextDirection.Mixed;
        }
        console.assert(goingRight);
        right = rect.right;
      } else if (utils.equal(left, rect.right)) { // We are going sequentially left
        if (goingRight) {
          return TextDirection.Mixed;
        }
        console.assert(goingLeft);
        left = rect.left;
      } else {
        return TextDirection.Mixed;
      }
    }
    console.assert(goingRight !== goingLeft);
    return goingRight ? TextDirection.LTR : TextDirection.RTL;
  },

  equal: function (a, b) { return Math.abs(a - b) < 0.001; },

};

// Text unit properties
const TextDirection = Object.freeze({
  Undefined: 'Undefined',
  LTR: 'LTR',
  RTL: 'RTL',
  Mixed: 'Mixed',
});

// Text unit properties
const Properties = Object.freeze({
  graphemeStart: 1,
  wordStart: 2,
  whiteSpace: 4,
  // Lots of other properties, don't know what we need at the moment
});

// Simple rectangle
class Rect {
  constructor(/* Number */x, /* Number */y, /* Number */width, /* Number */height) {
    this.left = x;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
  }

  extend(/* Rect */rect, /* Boolean */indirected) {
    if (indirected) {
      this.left = Math.min(this.left, rect.left, rect.right);
      this.right = Math.max(this.right, rect.left, rect.right);
    } else if (rect.left <= rect.right) {
      // Left to right
      this.left = Math.min(this.left, rect.left);
      this.right = Math.max(this.right, rect.right);
    } else {
      // Right to left
      this.left = Math.max(this.left, rect.left);
      this.right = Math.min(this.right, rect.right);
    }
    this.top = Math.min(this.top, rect.top);
    this.bottom = Math.max(this.bottom, rect.bottom);
  }

  assign(/* DOMRect */rect) {
    this.left = rect.left;
    this.top = rect.top;
    this.right = rect.right;
    this.bottom = rect.bottom;
  }

  assignDirectionally(/* DOMRect */rect, /* TextDirection */wordTextDirection) {
    this.assign(rect);
    if (wordTextDirection === TextDirection.RTL) {
      [this.left, this.right] = [this.right, this.left];
    }
    console.assert((this.left <= this.right) === (wordTextDirection === TextDirection.LTR));
  }

  /** Merge rects
   * @param {Array} rects
   * @param {TextDirection} textDirection
   */
  merge(rects, textDirection) {
    console.assert(rects.length > 0);
    let left = rects[0].left;
    let right = rects[0].right;
    let top = rects[0].top;
    let bottom = rects[0].bottom;
    for (const rect of rects) {
      left = Math.min(left, rect.left);
      right = Math.max(right, rect.right);
      top = Math.min(top, rect.top);
      bottom = Math.max(bottom, rect.bottom);
    }
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    if (textDirection === TextDirection.RTL) {
      [this.left, this.right] = [this.right, this.left];
    }
  }

  /** Rectangle height
   * @return {number}
   */
  height() { return this.bottom - this.top; }

  /** Rectangle width
   * @return {number}
   */
  width() { return this.right - this.left; }

  /*
    left;
    right;
    top;
    bottom;
  */
}

// Text unit: a unit of text (grapheme, word, text run, line)
class TextRange {
  constructor(/* Number */start, /* Number */end) {
    this.start = start;
    this.end = end;
  }
/*
  start;
  end;
 */
}

class GlyphRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
/*
  start;
  end;
 */
}

// Glyph cluster: a range of glyphs that visualize a single grapheme
class GlyphCluster {
  constructor() {
    this.textRange = new TextRange(0, 0);
    this.glyphRange = new GlyphRange(0, 0);
    this.bounds = new Rect(0, 0, 0, 0);
    this.text = '';
    this.isWhitespaces = false;
    this.isNewLine = false;
    this.isTrailingSpaces = false;
    this.isLeadingSpaces = false;
  }

  textDirection() {
    if (this.bounds.left <= this.bounds.right) {
      return TextDirection.LTR;
    }
    return TextDirection.RTL;
  }
/*
  textRange;
  glyphRange;
  bounds;
  text;
  isWhitespaces;
*/
}

// Set of glyphs making a word (or a part of a word if it's broken by lines)
class GlyphWord {
  constructor() {
    this.textRange = new TextRange(0, 0);
    this.glyphRange = new GlyphRange(0, 0);
    this.bounds = new Rect(0, 0, 0, 0);
    this.text = '';
    this.isWhitespaces = false;
  }

  startFrom(/* GlyphCluster */currentCluster) {
    this.text = '';
    this.textRange = new TextRange(currentCluster.textRange.start, currentCluster.textRange.start);
    this.glyphRange = new TextRange(currentCluster.glyphRange.start, currentCluster.glyphRange.start);
    this.bounds = new Rect(
      (currentCluster.textDirection() === TextDirection.RTL) ? currentCluster.bounds.right : currentCluster.bounds.left,
      currentCluster.bounds.top,
      0,
      currentCluster.bounds.bottom - currentCluster.bounds.top
    );
  }

/*
  textRange;
  glyphRange;
  bounds;
  text;
  isWhitespaces;
 */
}

// Set of glyphs with the same text attributes (font name, font style, font size, text direction, decorations, ...)
class GlyphRun {
  constructor() {
    this.textRange = new TextRange(0, 0);
    this.glyphRange = new GlyphRange(0, 0);
    this.wordRange = new GlyphRange(0, 0);
    this.bounds = new Rect(0, 0, 0, 0);
    this.textDirection = TextDirection.Undefined;
  }

  startFrom(/* GlyphCluster */currentCluster) {
    this.textDirection = currentCluster.textDirection();
    this.textRange = new TextRange(currentCluster.textRange.start, currentCluster.textRange.start);
    this.glyphRange = new TextRange(currentCluster.glyphRange.start, currentCluster.glyphRange.start);
    this.wordRange = new TextRange(this.wordRange.end, this.wordRange.end);
    this.bounds = new Rect(
      (currentCluster.textDirection() === TextDirection.RTL) ? currentCluster.bounds.right : currentCluster.bounds.left,
      currentCluster.bounds.top,
      0,
      currentCluster.bounds.bottom - currentCluster.bounds.top
    );
  }
/*
  textRange;
  glyphRange;
  wordRange;
  bounds;
  font;
  textDirection;
*/
}

// Set of glyphs placed on the same line (could be shuffled inside, but it's still one range)
class GlyphLine {
  constructor() {
    this.textRange = new TextRange(0, 0);
    this.glyphRange = new GlyphRange(0, 0);
    this.wordRange = new GlyphRange(0, 0);
    this.runRange = new GlyphRange(0, 0);
    this.bounds = new Rect(0, 0, 0, 0);
  }

  startFrom(/* GlyphCluster */currentCluster) {
    this.textRange = new TextRange(currentCluster.textRange.start, currentCluster.textRange.start);
    this.glyphRange = new TextRange(currentCluster.glyphRange.start, currentCluster.glyphRange.start);
    this.wordRange = new TextRange(this.wordRange.end, this.wordRange.end);
    this.runRange = new TextRange(this.runRange.end, this.runRange.end);
    this.bounds = new Rect(
      (currentCluster.textDirection() === TextDirection.RTL) ? currentCluster.bounds.right : currentCluster.bounds.left,
      currentCluster.bounds.top,
      0,
      currentCluster.bounds.bottom - currentCluster.bounds.top
    );
  }

  endAt(/* GlyphCluster */currentCluster) {
    this.textRange.end = currentCluster.textRange.end;
    this.glyphRange.end = currentCluster.glyphRange.end;
  }
/*
  textRange;
  glyphRange;
  wordRange;
  runRange;
  bounds;
*/
}

// TODO: Implement multiple styles
// eslint-disable-next-line no-unused-vars
class FontStyleRanges {
  constructor(/* TextRange */textRange, /* String */fontStyle) {
    this.textRange = textRange;
    this.fontStyle = fontStyle;
  }
/*
  textRange;
  fontStyle;
*/
}

// Collecting text properties and glyph information
// eslint-disable-next-line no-unused-vars
class Shaper {
  constructor() {
    this.clearInputs();
    this.clearOutputs();
  }

  clearInputs() {
    this.text = '';
    this.fontStyleRanges = [];
  }

  clearOutputs() {
    this.layoutPerformed = false;
    this.properties = [];
    this.graphemes = [];
    this.words = [];
    this.runs = [];
    this.lines = [];
    this.bounds = new Rect(0, 0, 0, 0);
  }

  /**
   * Adds styled text part to the paragraph
   * @param {String} text Text to add
   * @param {String} fontStyle Style of the text
   */
  addText(text, fontStyle) {
    if (this.layoutPerformed) {
      alert('Cannot modify the text after layout');
      return;
    }
    const textUnit = new TextRange(this.text.length, this.text.length + text.length);
    this.fontStyleRanges.push(new FontStyleRanges(textUnit, fontStyle));
    this.text += text;
  }

  /**
   * @param {GlyphLine} line
   * @param {Number} end
   */
  finishLine(line, end) {
    if (line.textRange.start === end) {
      // The line has not started really
      return;
    }
    // Make sure the grapheme, the run and the word are finished by now
    line.glyphRange.end = this.graphemes.length;
    line.runRange.end = this.runs.length;
    line.wordRange.end = this.words.length;
    this.lines.push(structuredClone(line));
  }

  /**
   * @param {GlyphRun} run
   * @param {Number} end
   */
  finishRun(run, end) {
    if (run.textRange.start === end) {
      // The run has not really started
      return;
    }
    // Make sure the grapheme and the word are finished by now
    run.textRange.end = end;
    run.glyphRange.end = this.graphemes.length;
    run.wordRange.end = this.words.length;
    this.runs.push(structuredClone(run));
  }

  /**
   * @param {GlyphWord} word
   */
  finishWord(word) {
    // Make sure the grapheme is finished
    word.glyphRange.end = this.graphemes.length;
    this.words.push(structuredClone(word));
  }

  /**
   * @param {GlyphCluster} cluster
   * @param {Number} textStart
   * @param {Number} textEnd
   * @param {Number} graphemeStart
   * @param {Number} graphemeEnd
   * @param {String} text
   * @param {Boolean} whitespaces
   * @param {Boolean} newLines
   */
  addCluster(cluster, textStart, textEnd, graphemeStart, graphemeEnd, text, whitespaces, newLines) {
    cluster.textRange = { start: textStart, end: textEnd };
    cluster.glyphRange = { start: graphemeStart, end: graphemeEnd };
    cluster.text = text;
    cluster.isWhitespaces = whitespaces;
    cluster.isNewLine = newLines;
    this.graphemes.push(structuredClone(cluster));
  }

  /**
   * Performs the text layout
   * @param {Number} width
   */
  layout(width, fontManager) {
    // TODO: deal with locales
    this.clearOutputs();
    this.extractSegments('grapheme', Properties.graphemeStart);
    this.extractSegments('word', Properties.wordStart);

    let span;
    let rect = null;
    if (this.coloredId !== undefined) {
      span = document.getElementById(this.coloredId);
      rect = document.getElementById(this.measurementId);
    } else {
      this.coloredId = 'undefined';
      this.measurementId = 'undefined';
      span = document.createElement('span');
      document.body.appendChild(span);
    }

    const font = this.fontStyleRanges[0].fontStyle;
    if (width > 0) {
      span.style.width = `${width}px`;
      span.style.whiteSpace = 'pre-wrap';
      span.style.overflow = 'hidden';
    } else if (this.coloredId !== 'undefined') {
      // Trying to use a heuristics to get a decent text width that fit the entire text
      span.style.width = `${font.size * this.text.length * 2}px`;
      span.style.border = '2px solid black';
    } else {
      span.style.whiteSpace = 'pre-wrap';
      span.style.overflow = 'hidden';
    }
    span.style.position = 'absolute';
    span.style.left = '0px';
    span.style.top = '0px';
    span.style.padding = '0px';
    span.style.margin = '0px';
    span.style.float = 'left';
    span.style.margin = '0px';
    span.style.padding = '0px';
    span.style.visibility = 'collapse';
    if (font.className !== undefined && font.className !== '') {
      span.style.class = font.className;
    } else {
      span.style.fontFamily = font.family;
    }
    span.style.fontSize = `${font.size}px`;
    span.style.fontStyle = font.style;
    span.style.fontWeight = font.weight;
    this.generateSpanStructures(span, fontManager, font);
    this.extractInfo(span);
    this.lottie_convertWhitespaces();
    if (rect !== null) {
      rect.style = 'margin: 0px; padding: 0px; border: 0px';
      const size = this.measurement();
      rect.innerHTML = `${(size.right - size.left).toFixed(2)} x ${(size.bottom - size.top).toFixed(2)}`;
    }

    if (this.coloredId === 'undefined') {
      document.body.removeChild(span);
    } else {
      span.style.visibility = 'visible';
    }
  }

  /**
   * Generate <span> structures for all types of text units to pass it to the browser and get back
   * the shaped results
   * @param {Element}
   */
  generateSpanStructures(div, fontManager, font) {
    let isGrapheme = false;
    let isWord = false;
    let html = '';
    let g = 0;
    let w = 0;
    let hadWhitespaces = false;
    let start = 0;
    for (let i = 0; i < this.properties.length; ++i) {
      const property = this.properties[i];
      hadWhitespaces = (this.properties[i] & Properties.whiteSpace) === Properties.whiteSpace;
      if (((property & Properties.graphemeStart) === Properties.graphemeStart) && isGrapheme) {
        // Finish the grapheme
        const text = this.text.substring(start, i);
        if (fontManager.chars) {
          let width = 0;
          for (const c of text) {
            const charData = fontManager.getCharData(c, font.style, font.family);
            width += (charData.w * font.size) / 100;
          }
          html += `width:${width}px'>`;
        } else {
          html += '\'>';
        }
        html += text;
        html += '</span>';
        isGrapheme = false;
      }
      if (((property & Properties.wordStart) === Properties.wordStart) && isWord) {
        // Finish the word
        html += '</span>';
        isWord = false;
        // Grapheme does not cross the word edges
        console.assert(property && Properties.graphemeStart);
      }
      const char = this.text.substring(i, i + 1);
      const isNewline = (char === '\r');
      if (isNewline) {
        console.assert(!isWord && !isGrapheme);
        // Multiple <br/> will be reduced to one line break;
        // it's not what we want here
        html += '<br>';
        continue;
      }
      if ((property & Properties.wordStart) === Properties.wordStart) {
        // Start the word
        html += `<span id='w${w}' class='`;
        html += (hadWhitespaces ? 'whitespaces ' : '') + "word' style='word-break: keep-all; margin: 0px; padding: 0px;'>";
        w += 1;
        isWord = true;
      }
      if ((property & Properties.graphemeStart) === Properties.graphemeStart) {
        // Start the grapheme
        html += `<span id='g${g}' class='grapheme' style='margin: 0px; padding: 0px;`;
        g += 1;
        isGrapheme = true;
        start = i;
      }
    }

    for (; start < this.text.length; start += 1) {
      const char = this.text.substring(start, start + 1);
      const isNewline = (char === '\r');
      if (isNewline) {
        console.assert(!isWord && !isGrapheme);
        // Multiple <br/> will be reduced to one line break;
        // it's not what we want here
        html += '<br>';
      } else {
        break;
      }
    }

    if (isGrapheme) {
      // Finish the grapheme
      const text = this.text.substring(start);
      if (fontManager.chars) {
        let width = 0;
        for (const c of text) {
          const charData = fontManager.getCharData(c, font.style, font.family);
          width += (charData.w * font.size) / 100;
        }
        html += `width:${width}px'>`;
      } else {
        html += '\'>';
      }
      html += text;
      html += '</span>';
      // isGrapheme = false;
    }
    if (isWord) {
      // Finish the word
      html += '</span>';
      // isWord = false;
    }
    div.innerHTML = html;
  }

  // eslint-disable-next-line class-methods-use-this
  extend(parent, glyphCluster, indirected) {
    parent.textRange.end = glyphCluster.textRange.end;
    parent.glyphRange.end = glyphCluster.glyphRange.end;
    parent.bounds.extend(glyphCluster.bounds, indirected);
  }

  /**
   * Extract all information from the browser corresponding it to the generated <span> structures
   * @param {Element} div
   */
  extractInfo(span) {
    // Bounding box
    const measurements = span.getClientRects();
    // console.assert(measurements.length === 1);
    this.bounds.assign(measurements[0]);

    const currentCluster = new GlyphCluster();
    const currentWord = new GlyphWord();
    const currentRun = new GlyphRun();
    const currentLine = new GlyphLine();

    let textIndex = 0;
    let prevGraphemeRect = new Rect(0, 0, 0, 0);
    let prevGraphemeTextDirection = TextDirection.Undefined;
    for (const word of span.children) {
      let wordTextDirection = TextDirection.LTR;
      let wordIsWhitespaces = false;
      if (word.tagName.toUpperCase() !== 'SPAN') {
        // <br> is translated into \r, but it's really hacky
        // the text is not empty and the cluster, too;

        // Finish the current word, start a new one for \r
        this.finishWord(currentWord, textIndex);
        // Finish the current run, start a new one for \r
        this.finishRun(currentRun, textIndex);
        // Finish the current line, start a new one for \r
        this.finishLine(currentLine, textIndex);

        // Add a cluster for \r (so it will be included into word, run and line)
        currentCluster.bounds.assign(new DOMRect(0, 0, 0, 0));
        this.addCluster(currentCluster, textIndex, textIndex + 1,
          this.graphemes.length, this.graphemes.length + 1, '\r', false, true);
        currentWord.startFrom(currentCluster);
        currentRun.startFrom(currentCluster);
        currentLine.startFrom(currentCluster);

        // Initialize the new cluster, word, run and line
        currentCluster.textRange = new TextRange(textIndex + 1, textIndex + 1);
        currentCluster.glyphRange = new GlyphRange(this.graphemes.length, this.graphemes.length);
        currentCluster.text = '';
        currentCluster.isWhitespaces = false;

        // Go to the next character
        textIndex += 1;
        continue;
      }

      const allBounds = word.getClientRects();
      wordTextDirection = utils.detectTextDirection(allBounds);

      // Start a new word
      const first = allBounds[0];
      const last = allBounds[allBounds.length - 1];
      if (prevGraphemeTextDirection === TextDirection.Undefined) {
        if (wordTextDirection === TextDirection.LTR || first.left <= last.right) {
          prevGraphemeRect = new Rect(first.left, first.top, 0, first.height);
          prevGraphemeTextDirection = TextDirection.LTR;
        } else {
          prevGraphemeRect = new Rect(first.right, first.top, 0, first.width);
          prevGraphemeTextDirection = TextDirection.RTL;
        }
      }
      wordIsWhitespaces = word.classList.contains('whitespaces');
      let graphemeIndex = 0;
      for (const grapheme of word.children) {
        const graphemeRects = grapheme.getClientRects();
        console.assert(graphemeRects.length === 1);
        console.assert(utils.compare(allBounds[graphemeIndex], graphemeRects[0]));
        // Correct the cluster bounds and the visual left position
        let textDirectionSwitch = prevGraphemeRect.left > graphemeRects[0].right || prevGraphemeRect.right < graphemeRects[0].left;
        let graphemeTextDirection = wordTextDirection;
        if (utils.equal(prevGraphemeRect.right, graphemeRects[0].left)) {
          // Sequential LTR: 1,2,3,4,5
          console.assert(prevGraphemeTextDirection === TextDirection.LTR);
          graphemeTextDirection = TextDirection.LTR;
        } else if (prevGraphemeRect.bottom <= graphemeRects[0].top) {
          // This is a new line, not a text direction switch
          textDirectionSwitch = false;
        } else if (prevGraphemeRect.left > graphemeRects[0].right) {
          // Switching direction (4->5):
          // RTL->LTR: 5,6,...4,3,2,1
          // LTR->RTL: 5,6,...1,2,3,4
          graphemeTextDirection = prevGraphemeTextDirection === TextDirection.LTR ? TextDirection.RTL : TextDirection.LTR;
        } else if (utils.equal(prevGraphemeRect.left, graphemeRects[0].right)) {
          // Sequential RTL: 5,4,3,2,1
          console.assert(prevGraphemeTextDirection === TextDirection.RTL);
          graphemeTextDirection = TextDirection.RTL;
        } else if (prevGraphemeRect.right < graphemeRects[0].left) {
          // Switching direction (4->5):
          // LTR->RTL: 1,2,3,4,...5,6
          // RTL->LTR: 4,3,2,1,...5,6
          graphemeTextDirection = prevGraphemeTextDirection === TextDirection.LTR ? TextDirection.RTL : TextDirection.LTR;
        } else {
          console.assert(false);
        }
        currentCluster.bounds.assignDirectionally(graphemeRects[0], graphemeTextDirection);

        if (textIndex === 0) {
          // Initialize the new cluster, word, run and line (for the very first time)
          currentCluster.textRange = new TextRange(textIndex, textIndex + grapheme.innerHTML.length);
          currentCluster.glyphRange = new GlyphRange(0, 1);
          currentCluster.text = grapheme.innerHTML;
          currentCluster.isWhitespaces = wordIsWhitespaces;
          currentWord.startFrom(currentCluster);
          currentRun.startFrom(currentCluster);
          currentLine.startFrom(currentCluster);
        }

        // Detect the line break.
        // Line break breaks also the run and the word (just to keep everything in order)
        // We also use the same code to initialize the structures (textIndex === 0)
        // Keep in mind that there could be few empty lines, too
        const forcedNewLine = (this.graphemes.length > 0) && (this.graphemes[this.graphemes.length - 1].isNewLine);
        if (!forcedNewLine && (currentCluster.bounds.top >= currentLine.bounds.bottom)) {
          // Finish word, run and line - order is important
          this.finishWord(currentWord);
          this.finishRun(currentRun, textIndex);
          this.finishLine(currentLine, textIndex);

          // There is no explicit line break - just the result of text wrapping
          this.graphemes[this.graphemes.length - 1].isNewLine = true;

          // Start the new word, run and line
          currentWord.startFrom(currentCluster);
          currentRun.startFrom(currentCluster);
          currentLine.startFrom(currentCluster);
        }

        // Check if the current grapheme has a different text direction (run break)
        // Run break should also break the word and we have to assert that
        if (textDirectionSwitch) {
          // Let's break the word if not empty (end the collected one and start another)
          if (currentWord.textRange.start < currentWord.textRange.end) {
            this.words.push(structuredClone(currentWord));
            currentWord.startFrom(currentCluster);
          }

          // Let's end the previous run and start a new one
          this.finishRun(currentRun, textIndex);
          currentRun.startFrom(currentCluster);
        }

        // Finish the current grapheme
        this.addCluster(currentCluster, currentCluster.textRange.start,
          textIndex + grapheme.innerHTML.length,
          currentCluster.glyphRange.start, this.graphemes.length + 1,
          grapheme.innerHTML, wordIsWhitespaces, false);

        // Extend all the cursors: word, run and line
        this.extend(currentWord, currentCluster, false);
        currentWord.text += grapheme.innerHTML;
        currentWord.isWhitespaces = wordIsWhitespaces;
        this.extend(currentRun, currentCluster, false);
        this.extend(currentLine, currentCluster, true);

        prevGraphemeRect = graphemeRects[0];
        prevGraphemeTextDirection = graphemeTextDirection;
        graphemeIndex += 1;

        // Start a new grapheme
        currentCluster.textRange.start = currentCluster.textRange.end;
        currentCluster.glyphRange.start = currentCluster.glyphRange.end;
        currentCluster.text = '';
        currentCluster.bounds.left = currentCluster.bounds.right;
        currentCluster.isWhitespaces = false;

        // Increment textIndex here: the current position in the text
        textIndex += grapheme.innerHTML.length;
      }

      // Just for assert
      const wordRects = word.getClientRects();
      console.assert(wordRects.length === word.children.length);
      const wordRect = new Rect(0, 0, 0, 0);
      wordRect.merge(wordRects, wordTextDirection);
      console.assert(currentWord.isWhitespaces === wordIsWhitespaces);
      console.assert(currentWord.textRange.end === textIndex);

      // Finish the current word, start the new one
      this.finishWord(currentWord);
      currentWord.startFrom(currentCluster);
      // Update the run and the line
      currentLine.wordRange.end = this.words.length;
      currentRun.wordRange.end = this.words.length;
    }

    // Finish the run and the line, add them to the collected lists
    this.finishRun(currentRun, textIndex);
    this.finishLine(currentLine, textIndex);

    this.layoutPerformed = true;
  }

  /**
   * Mark leading and trailing spaces
   */
  /*
  markSpaces() {
    for (const line of this.lines) {
      for (let r = line.runRange.start; r < line.runRange.end; r += 1) {
        const run = this.runs[r];
        let start = run.glyphRange.start;
        let end = run.glyphRange.end;
        let step = 1;
        if (run.textDirection === 'RTL') {
          start = run.glyphRange.end - 1;
          end = run.glyphRange.start - 1;
          step = -1;
        }

        var leading = true;
        for (let g = start; (step > 0 && g < end) || (step < 0 && g > end); g += step) {
          const glypheme = this.graphemes[g];
          if (leading && glypheme.isWhitespaces) {
            glypheme.isLeadingSpaces = true;
          } else {
            break;
          }
        }

        step = run.textDirection === 'RTL' ? 1 : -1;
        var trailing = true;
        for (let g = end; (step > 0 && g < start) || (step < 0 && g > start); g += step) {
          const glypheme = this.graphemes[g + step];
          if (trailing && glypheme.isWhitespaces) {
            glypheme.isTrailingSpaces = true;
          } else {
            break;
          }
        }
      }
    }
  }
  */
  /**
   * Extracts properties by the utf16 index in the text
   * (will return all properties that are actually applicable to the entire grapheme)
   * @param {Number} index
   * @return {Properties}
   */
  getProperties(index) {
    if (index < 0 || index >= this.properties.count()) {
      return null;
    }
    return this.properties[index];
  }

  /**
   * Check if the text consists of whitespaces only
   * @param {String} text
   * @return {Boolean} yes, it's whitespaces
   */
  // eslint-disable-next-line class-methods-use-this
  isWhitespaces(text) {
    // TODO: Make it a proper hardcode
    for (const c of text) {
      if (c !== ' ') {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns a list of glypheme clusters as strings
   * @return {Array}
   */
  // eslint-disable-next-line camelcase
  lottie_glyphemeClusters() {
    const result = [];
    for (const cluster of this.graphemes) {
      result.push(cluster.text);
    }
    return result;
  }

  // eslint-disable-next-line camelcase
  lottie_convertWhitespaces() {
    for (const cluster of this.graphemes) {
      if (cluster.isWhitespaces) {
        cluster.text = cluster.text.replaceAll('&nbsp;', ' ');
      }
    }
  }

  /**
   * Extract all the segments of a given type (possibly, with additional attributes)
   * writing information into #properties array (one element per utf16)
   * @param {String} granularity
   * @param {String} property
   */
  extractSegments(granularity, property) {
    var segmenter = new Intl.Segmenter('en', { granularity: granularity });
    var segments = segmenter.segment(this.text);
    for (const segment of segments) {
      const index = segment.index;
      const len = segment.segment.length;
      this.properties[index] |= property;
      // Let's check for whitespaces
      const whitespaces = granularity === 'grapheme' && this.isWhitespaces(this.text.substring(index, index + len));
      if (whitespaces) {
        for (let i = index; i < index + len; i += 1) {
          this.properties[i] |= Properties.whiteSpace;
        }
      }
    }
  }

  /** Detects the line start by glyph index
   *
   * @param {Number} index
   * @returns {Boolean}
   */
  findLine(index) {
    const containsIndex = (line) => line.glyphRange.start <= index && line.glyphRange.end > index;
    return this.shapedLines.findIndex(containsIndex);
  }

  /** Detects the run start by glyph index
   *
   * @param {Number} index
   * @returns {Boolean}
   */
  findRun(index) {
    const containsIndex = (run) => run.glyphRange.start <= index && run.glyphRange.end > index;
    return this.glyphRuns.findIndex(containsIndex);
  }

  /* Querying the results */
  /**
   * Returns a paragraph measurements
   * @return {Rect} A bounding box for the entire paragraph's text
   */
  measurement() {
    if (!this.layoutPerformed) {
      alert('Cannot query information without performing layout');
      return null;
    }
    return this.bounds;
  }

  /**
   * Returns a text positions of grapheme beginnings
   * @returns {Array} Grapheme start position
   */
  queryGraphemes() {
    if (!this.layoutPerformed) {
      alert('Cannot query information without performing layout');
      return null;
    }
    return this.graphemes;
  }

  /**
   * Returns a text positions of word beginnings
   * @returns {Array} Word start position
   */
  queryWords() {
    if (!this.layoutPerformed) {
      alert('Cannot query information without performing layout');
      return null;
    }
    return this.words;
  }

  /**
   * Returns line information by line index
   * @param {Number} index Zero-based line index
   * @returns {ShapedLine} Line information
   */
  queryLine(index) {
    if (!this.layoutPerformed) {
      alert('Cannot query information without performing layout');
      return null;
    }
    if (index < 0 && index >= this.shapedLines.count()) {
      return null;
    }
    return this.lines[index];
  }

  /**
   * Returns shaped text run information by the index
   * @param {Number} index Zero-based line index
   * @returns {GlyphRun} Run information
   */
  queryRun(index) {
    if (!this.layoutPerformed) {
      alert('Cannot query information without performing layout');
      return null;
    }
    if (index < 0 && index >= this.glyphRuns.count()) {
      return null;
    }
    return this.runs[index];
  }
}
export default Shaper;
