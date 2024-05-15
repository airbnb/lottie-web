let utils = {
  css : function ( element, property ) {
    return window.getComputedStyle( element, null ).getPropertyValue( property );
  },

  compare : function (a, b) {
    return ['top', 'left', 'right', 'bottom'].every(key => a[key] === b[key]);
  },

  detectTextDirection : function (/*DOMRectList*/rects) {
    if (rects.length === 0) {
      return TextDirection.Undefined;
    } else if (rects.length === 1) {
      return TextDirection.LTR;
    }
    let right = rects[0].left;
    let left = rects[0].right;
    let goingRight = undefined;
    let goingLeft = undefined;
    for (rect of rects) {
      if (left === rect.left && right === rect.right) {
        // First rectangle
        continue;
      }

      if (right === rect.left) {  // We are going sequentially right
        if (goingLeft) {
          return TextDirection.Mixed;
        }
        goingLeft = true;
        right = rect.right;
      } else if (left === rect.right) { // We are going sequentially left
        if (goingRight) {
          return TextDirection.Mixed;
        }
        goingRight = true;
        left = rect.left;
      } else {
        return TextDirection.Mixed;
      }
    }
    console.assert(goingRight !== goingLeft);
    return goingRight ? TextDirection.LTR : TextDirection.RTL;
  }
}

// Text unit properties
const TextDirection = Object.freeze({
  Undefined: "Undefined",
  LTR: "LTR",
  RTL: "RTL",
  Mixed: "Mixed",
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
  constructor(/*Number*/x, /*Number*/y, /*Number*/width, /*Number*/height) {
    this.left = x;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
  }

  extend(/*Rect*/rect, /*Boolean*/indirected) {
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

  assign(/*DOMRect*/rect) {
    this.left = rect.left;
    this.top = rect.top;
    this.right = rect.right;
    this.bottom = rect.bottom;
  }

  assignDirectionally(/*DOMRect*/rect, /*TextDirection*/wordTextDirection) {
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
    for (let rect of rects) {
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

  left;
  right;
  top;
  bottom;
}

// Text unit: a unit of text (grapheme, word, text run, line)
class TextRange {
  constructor(/*Number*/start, /*Number*/end) {
    this.start = start;
    this.end = end;
  }
  start;
  end;
}

class GlyphRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  start;
  end;
}

// Glyph cluster: a range of glyphs that visualize a single grapheme
class GlyphCluster {
  constructor() {
    this.textRange = new TextRange(0, 0);
    this.glyphRange = new GlyphRange(0, 0);
    this.bounds = new Rect(0, 0, 0, 0);
    this.text = "";
    this.isWhitespaces = false;
  }

  textDirection() {
    if (this.bounds.left <= this.bounds.right) {
      return TextDirection.LTR;
    } else {
      return TextDirection.RTL;
    }
  }

  textRange;
  glyphRange;
  bounds;
  text;
  isWhitespaces;
}

// Set of glyphs making a word (or a part of a word if it's broken by lines)
class GlyphWord {
  constructor() {
    this.textRange = new TextRange(0, 0);
    this.glyphRange = new GlyphRange(0, 0);
    this.bounds = new Rect(0, 0, 0, 0);
    this.text = "";
    this.isWhitespaces = false;
  }

  startFrom(/*GlyphCluster*/currentCluster) {
    this.text = "";
    this.textRange = new TextRange(currentCluster.textRange.start, currentCluster.textRange.start);
    this.glyphRange = new TextRange(currentCluster.glyphRange.start, currentCluster.glyphRange.start);
    this.bounds = new Rect(
      (currentCluster.textDirection() === TextDirection.RTL) ? currentCluster.bounds.right : currentCluster.bounds.left,
      currentCluster.bounds.top,
      0,
      currentCluster.bounds.bottom - currentCluster.bounds.top);
  }

  textRange;
  glyphRange;
  bounds;
  text;
  isWhitespaces;
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

  startFrom(/*GlyphCluster*/currentCluster) {
    this.textDirection = currentCluster.textDirection();
    this.textRange = new TextRange(currentCluster.textRange.start, currentCluster.textRange.start);
    this.glyphRange = new TextRange(currentCluster.glyphRange.start, currentCluster.glyphRange.start);
    this.wordRange = new TextRange(this.wordRange.end, this.wordRange.end);
    this.bounds = new Rect(
      (currentCluster.textDirection() === TextDirection.RTL) ? currentCluster.bounds.right : currentCluster.bounds.left,
      currentCluster.bounds.top,
      0,
      currentCluster.bounds.bottom - currentCluster.bounds.top);
  }

  textRange;
  glyphRange;
  wordRange;
  bounds;
  font;
  textDirection;
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

  startFrom(/*GlyphCluster*/currentCluster) {
    this.textRange = new TextRange(currentCluster.textRange.start, currentCluster.textRange.start);
    this.glyphRange = new TextRange(currentCluster.glyphRange.start, currentCluster.glyphRange.start);
    this.wordRange = new TextRange(this.wordRange.end, this.wordRange.end);
    this.runRange = new TextRange(this.runRange.end, this.runRange.end);
    this.bounds = new Rect(
      (currentCluster.textDirection() === TextDirection.RTL) ? currentCluster.bounds.right : currentCluster.bounds.left,
      currentCluster.bounds.top,
      0,
      currentCluster.bounds.bottom - currentCluster.bounds.top);
  }

  endAt(/*GlyphCluster*/currentCluster) {
    this.textRange.end = currentCluster.textRange.end;
    this.glyphRange.end = currentCluster.glyphRange.end;
  }

  textRange;
  glyphRange;
  wordRange;
  runRange;
  bounds;
}

// TODO: Implement multiple styles
class fontStyleRanges {
  constructor(/*TextRange*/textRange, /*String*/fontStyle) {
    this.textRange = textRange;
    this.fontStyle = fontStyle;
  }
  textRange;
  fontStyle;
}

// Collecting text properties and glyph information
class Shaper {
  constructor() {
    this.#clearInputs();
    this.#clearOutputs();
  }

  #clearInputs() {
    this.text = '';
    this.#fontStyleRanges = [];
  }

  #clearOutputs() {
    this.#layoutPerformed = false;
    this.#properties = [];
    this.graphemes = [];
    this.words = [];
    this.runs = [];
    this.lines = [];
    this.#bounds = new Rect(0, 0, 0, 0);
  }

  /**
   * Adds styled text part to the paragraph
   * @param {String} text Text to add
   * @param {String} fontStyle Style of the text
   */
  addText(text, fontStyle) {
    if (this.#layoutPerformed) {
      alert("Cannot modify the text after layout");
      return;
    }
    let textUnit = new TextRange(this.text.length, this.text.length + text.length);
    this.#fontStyleRanges.push(textUnit, fontStyle);
    this.text += text;
  }

  /**
   * Performs the text layout
   * @param {Number} width
   */
  layout(width) {
      // TODO: deal with locales
      this.#clearOutputs();
      this.#extractSegments("grapheme", Properties.graphemeStart);
      this.#extractSegments("word", Properties.wordStart);

      if (this.coloredId === undefined) {
          this.coloredId = "undefined";
          this.measurementId = "undefined";
      }

      let span = document.getElementById(this.coloredId);
      let rect = document.getElementById(this.measurementId);

      span.style = `max-width:${width}px; margin: 0px; padding: 0px;  border: 2px solid black; visibility: colapse`;
      span.style += this.#fontStyleRanges[0];
      this.#generateSpanStructures(span);
      this.#extractInfo(span);

      if (rect !== null) {
          rect.style = "margin: 0px; padding: 0px; border: 0px";
          const size = this.measurement();
          rect.innerText = `${(size.right - size.left).toFixed(2)} x ${(size.bottom - size.top).toFixed(2)}`;
      }

      if (this.coloredId === "undefined") {
          document.body.removeChild(span);
          document.body.removeChild(rect);
      } else {
        span.style.visibility = "visible";
      }
  }

  /**
   * Generate <span> structures for all types of text units to pass it to the browser and get back
   * the shaped results
   * @param {Element}
   */
  #generateSpanStructures(div) {
    let isGrapheme = false;
    let isWord = false;
    let html = "";
    let g = 0;
    let w = 0;
    let start = 0;
    for (let i = 0; i < this.#properties.length; ++i) {
      const property = this.#properties[i];
      const isWhitespaces = this.#properties[i] & Properties.whiteSpace;
      if (property & Properties.graphemeStart && isGrapheme) {
        // Finish the grapheme
        const text = this.text.substring(start, i);
        if (isWhitespaces) {
          let corrected = "";
          for (let c of text) {
            if (c === ' ') {
              corrected += "&nbsp;";
            } else {
              corrected += c;
            }
          }
          html += corrected;
        } else {
          html += text;
        }
        html += "</span>";
        isGrapheme = false;
      }
      if ((property & Properties.wordStart) && isWord) {
        // Finish the word
        html += "</span>";
        isWord = false;
        // Grapheme does not cross the word edges
        console.assert(property && Properties.graphemeStart);
      }
      const isNewline = (i < this.#properties.length - 1) && (this.text.substring(i, i + 1) === '\n');
      if (isNewline) {
        console.assert(!isWord && !isGrapheme);
        html += "<br/>";
        continue;
      }
      if (property & Properties.wordStart) {
        // Start the word
        html += `<span id='w${w}' class='`;
        html += (isWhitespaces ? "whitespaces " : "") +  "word'>";
        w += 1;
        isWord = true;
      }
      if (property & Properties.graphemeStart) {
        // Start the grapheme
        html += `<span id='g${g}' class='grapheme'>`;
        g += 1;
        isGrapheme = true;
        start = i;
      }
    }
    if (isGrapheme) {
      // Finish the grapheme
      html += this.text.substring(start);
      html += "</span>";
      //isGrapheme = false;
    }
    if (isWord) {
      // Finish the word
      html += "</span>";
      //isWord = false;
    }
    div.innerHTML = html;
  }

  #extend(parent, glyphCluster, indirected) {
    parent.textRange.end = glyphCluster.textRange.end;
    parent.glyphRange.end = glyphCluster.glyphRange.end;
    parent.bounds.extend(glyphCluster.bounds, indirected);
  }

  /**
   * Extract all information from the browser corresponding it to the generated <span> structures
   * @param {Element} div
   */
  #extractInfo(span) {
    // Bounding box
    const measurements = span.getClientRects();
    console.assert(measurements.length === 1);
    this.#bounds.assign(measurements[0]);

    let currentCluster = new GlyphCluster();
    let currentWord = new GlyphWord();
    let currentRun = new GlyphRun();
    let currentLine = new GlyphLine();

    let textIndex = 0;
    let prevGraphemeRect;
    let prevGraphemeTextDirection;
    for (let word of span.children) {
      if (word.tagName.toUpperCase() !== "SPAN") {
        // Skip <br/>
        continue;
      }

      const allBounds = word.getClientRects();
      let wordTextDirection = utils.detectTextDirection(allBounds);

      // Start a new word
      const first = allBounds[0];
      const last = allBounds[allBounds.length - 1];
      if (textIndex === 0) {
        if (wordTextDirection === TextDirection.LTR || first.left <= last.right) {
          prevGraphemeRect = new Rect(first.left, first.top, 0, first.height);
          prevGraphemeTextDirection = TextDirection.LTR;
        } else {
          prevGraphemeRect = new Rect(first.right, first.top, 0, first.width);
          prevGraphemeTextDirection = TextDirection.RTL;
        }
      }
      let graphemeIndex = 0;
      for (let grapheme of word.children) {
        const graphemeRects = grapheme.getClientRects();
        console.assert(graphemeRects.length === 1);
        console.assert(utils.compare(allBounds[graphemeIndex], graphemeRects[0]));
        // Correct the cluster bounds and the visual left position
        let textDirectionSwitch = prevGraphemeRect.left > graphemeRects[0].right || prevGraphemeRect.right < graphemeRects[0].left;
        let graphemeTextDirection = wordTextDirection;
        if (prevGraphemeRect.right === graphemeRects[0].left) {
          // Sequential LTR: 1,2,3,4,5
          console.assert(prevGraphemeTextDirection === TextDirection.LTR);
          graphemeTextDirection = TextDirection.LTR;
        } else if (prevGraphemeRect.left > graphemeRects[0].right) {
          // Switching direction (4->5):
          // RTL->LTR: 5,6,...4,3,2,1
          // LTR->RTL: 5,6,...1,2,3,4
          graphemeTextDirection = prevGraphemeTextDirection === TextDirection.LTR ? TextDirection.RTL : TextDirection.LTR;
        } else if (prevGraphemeRect.left === graphemeRects[0].right) {
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
          // Initialize the new cluster, word, run and line
          currentCluster.textRange = new TextRange(textIndex, textIndex + grapheme.innerText.length);
          currentCluster.glyphRange = new GlyphRange(0, 1);
          currentCluster.text = "";
          currentCluster.isWhitespaces = word.classList.contains("whitespaces");

          currentWord.startFrom(currentCluster);
          currentRun.startFrom(currentCluster);
          currentLine.startFrom(currentCluster);

          textIndex += grapheme.innerText.length;
        }

        // Detect the line break.
        // Line break breaks also the run and the word (just to keep everything in order)
        // We also use the same code to initialize the structures (textIndex === 0)
        if (currentCluster.bounds.top >= currentLine.bounds.bottom) {
          // Finish word, run and line
          currentLine.glyphRange.end = this.graphemes.length + 1;
          currentLine.wordRange.end = this.words.length + 1;
          currentLine.runRange.end = this.runs.length + 1;
          currentRun.glyphRange.end = this.graphemes.length + 1;
          currentRun.wordRange.end = this.words.length + 1;
          currentWord.glyphRange.end = this.graphemes.length + 1;

          // Add collected word, run and line to the list
          this.words.push(structuredClone(currentWord));
          this.runs.push(structuredClone(currentRun));
          this.lines.push(structuredClone(currentLine));

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
          }
          currentWord.startFrom(currentCluster);

          // Let's end the previous run (and the run if it's not empty)
          currentRun.textRange.end = textIndex;
          currentRun.glyphRange.end = this.graphemes.length;
          currentRun.wordRange.end = this.words.length;
          this.runs.push(structuredClone(currentRun));

          // Let's start the new run
          currentRun.startFrom(currentCluster);
        }

        // Finish the current grapheme
        currentCluster.textRange.end = textIndex + grapheme.innerText.length;
        currentCluster.glyphRange.end = this.graphemes.length + 1;
        currentCluster.text = grapheme.innerText;
        currentCluster.isWhitespaces = word.classList.contains("whitespaces");
        this.graphemes.push(structuredClone(currentCluster));

        // Extend all the cursors: word, run and line
        this.#extend(currentWord, currentCluster, false);
        currentWord.text += grapheme.innerText;
        currentWord.isWhitespaces = currentCluster.isWhitespaces;
        this.#extend(currentRun, currentCluster, false);
        this.#extend(currentLine, currentCluster, true);

        prevGraphemeRect = graphemeRects[0];
        prevGraphemeTextDirection = graphemeTextDirection;
        graphemeIndex += 1;

        // Start a new grapheme
        currentCluster.textRange.start = currentCluster.textRange.end;
        currentCluster.glyphRange.start = currentCluster.glyphRange.end;
        currentCluster.text = "";
        currentCluster.bounds.left = currentCluster.bounds.right;
        currentCluster.isWhitespaces = false;

        // Increment textIndex here: the current position in the text
        textIndex += grapheme.innerText.length;
      }

      // Finish the current word, start the new one
      const wordRects = word.getClientRects();
      console.assert(wordRects.length === word.children.length);
      let wordRect = new Rect(0,0,0,0);
      wordRect.merge(wordRects, wordTextDirection);
      console.assert(word.innerText.endsWith(currentWord.text));
      console.assert(currentWord.isWhitespaces === word.classList.contains("whitespaces"));
      console.assert(currentWord.textRange.end === textIndex);
      currentLine.wordRange.end = this.words.length + 1;
      currentRun.wordRange.end = this.words.length + 1;
      this.words.push(structuredClone(currentWord));
      currentWord.startFrom(currentCluster);
    }
    // Finish run and line
    currentLine.glyphRange.end = this.graphemes.length + 1;
    currentLine.runRange.end = this.runs.length + 1;
    currentLine.wordRange.end = this.words.length;
    currentRun.glyphRange.end = this.graphemes.length + 1;
    currentRun.wordRange.end = this.words.length;

    // Add collected run and line to the list
    this.runs.push(structuredClone(currentRun));
    this.lines.push(structuredClone(currentLine));
    this.#layoutPerformed = true;
  }

  /**
   * Extracts properties by the utf16 index in the text
   * (will return all properties that are actually applicable to the entire grapheme)
   * @param {Number} index
   * @return {Properties}
   */
  getProperties(index) {
    if (index < 0 || index >= this.#properties.count()) {
      return null;
    }
    return this.#properties[index];
  }

  /**
   * Check if the text consists of whitespaces only
   * @param {String} text
   * @return {Boolean} yes, it's whitespaces
   */
  isWhitespaces(text) {
    // TODO: Make it a proper hardcode
    for (let c of text) {
      if (c !== ' ') {
        return false;
      }
    }
    return true;
  }

  /**
   * Extract all the segments of a given type (possibly, with additional attributes)
   * writing information into #properties array (one element per utf16)
   * @param {String} granularity
   * @param {String} property
   */
  #extractSegments(granularity, property) {
    var segmenter = new Intl["Segmenter"]("en", { "granularity": granularity });
    var segments = segmenter.segment(this.text);
    for (const segment of segments) {
      const index = segment["index"];
      const len = segment["segment"]["length"];
      this.#properties[index] |= property;
      // Let's check for whitespaces
      const whitespaces = granularity === "grapheme" && this.isWhitespaces(this.text.substring(index, index + len));
      if (whitespaces) {
        for (let i = index; i < index + len; ++i) {
          this.#properties[i] |= Properties.whiteSpace;
        }
      }
    }
  }

  /** Detects the line start by glyph index
   *
   * @param {Number} index
   * @returns {Boolean}
   */
  #findLine(index) {
    const containsIndex = (line) => line.glyphRange.start <= index && line.glyphRange.end > index;
    return this.shapedLines.findIndex(containsIndex);
  }

  /** Detects the run start by glyph index
   *
   * @param {Number} index
   * @returns {Boolean}
   */
  #findRun(index) {
    const containsIndex = (run) => run.glyphRange.start <= index && run.glyphRange.end > index;
    return this.glyphRuns.findIndex(containsIndex);
  }

  /* Querying the results */
  /**
   * Returns a paragraph measurements
   * @return {Rect} A bounding box for the entire paragraph's text
   */
  measurement() {
    if (!this.#layoutPerformed) {
      alert("Cannot query information without performing layout");
      return null;
    }
    return this.#bounds;
  }

  /**
   * Returns a text positions of grapheme beginnings
   * @returns {Array} Grapheme start position
   */
  queryGraphemes() {
    if (!this.#layoutPerformed) {
      alert("Cannot query information without performing layout");
      return null;
    }
    return this.graphemes;
  }

  /**
   * Returns a text positions of word beginnings
   * @returns {Array} Word start position
   */
  queryWords() {
    if (!this.#layoutPerformed) {
      alert("Cannot query information without performing layout");
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
    if (!this.#layoutPerformed) {
      alert("Cannot query information without performing layout");
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
    if (!this.#layoutPerformed) {
      alert("Cannot query information without performing layout");
      return null;
    }
    if (index < 0 && index >= this.glyphRuns.count()) {
      return null;
    }
    return this.runs[index];
  }

  /** Generate TR element
   * @param {HTMLElement} tbody
   * @param {String} unitType
   * @param {String} classes
   * @param {Number} index1
   * @param {Number} index2
   * @param {String} text
   * @param {Rect} rect
   * @param {Rect} lineRect
   */
  #generateRow(tbody, unitType, classes, index1, index2, text, rect, lineRect) {
    let tr = document.createElement("tr");
    tr.classList = classes;
    tr.innerHTML += `<th scope='row'>${unitType}[${index1}${(index2 >= 0 ? "/" + index2 : "")}]</th>`;
    tr.innerHTML += "<td>" + text + "</td>";

    const left = Math.min(rect.left, rect.right) - lineRect.left;
    const width = Math.abs(rect.right - rect.left);
    const corrected = new Rect(
      Math.min(rect.left, rect.right) - lineRect.left,
      rect.top - lineRect.top,
      Math.abs(rect.right - rect.left),
      Math.abs(rect.bottom - rect.top));
    tr.innerHTML += "<td>" + corrected.left.toFixed(2) + "</td>";
    tr.innerHTML += "<td>" + corrected.top.toFixed(2) + "</td>";
    tr.innerHTML += "<td>" + corrected.right.toFixed(2) + "</td>";
    tr.innerHTML += "<td>" + corrected.bottom.toFixed(2) + "</td>";
    tbody.appendChild(tr);
    return corrected;
  }

  /** Updates #tbody element with all the extracted information */
  printTable() {
      const table = document.getElementById("table");
      let tbody = document.getElementById("tbody");
      if (table.styled === undefined) {
          var head = document.head || document.getElementsByTagName('head')[0];
          var style = document.createElement('style');
          head.appendChild(style);
          style.appendChild(document.createTextNode("th, td {text-align: left; vertical-align: center; }"));
          style.appendChild(document.createTextNode("td {padding: 2px; }"));
          //style.appendChild(document.createTextNode("tr.line, tr.grapheme, tr.word, tr.run, tr.whitespaces {display: none;}"));

          style.appendChild(document.createTextNode("#showGraphemes:checked { ~ * .grapheme { display: table-row; } }"));
          style.appendChild(document.createTextNode("#showWords:checked { ~ * .word { display: table-row; } }"));
          style.appendChild(document.createTextNode("#showWhitespaces:checked { ~ * .whitespaces { display: table-row; } }"));
          style.appendChild(document.createTextNode("#showTextRuns:checked { ~ * .run { display: table-row; } }"));
          style.appendChild(document.createTextNode("#showLines:checked { ~ * .line { display: table-row; } }"));
          table.styled = true;
      } else {
          tbody.innerHTML = "";
      }

      let lineCount = 0;
      let runCount = 0;
      let wordCount = 0;
      let clusterCount = 0;
      let lineCursor = new Rect(0,0,0,0);
      let runCursor = new Rect(0,0,0,0);
      let wordCursor = new Rect(0,0,0,0);
      let clusterCursor = new Rect(0,0,0,0);
      for (let line of this.lines) {
          const nextLine = this.#generateRow(tbody, "line", "line", lineCount, -1, "", line.bounds, line.bounds);
          console.assert(lineCursor.right === nextLine.left);
          lineCursor = nextLine;
          ++lineCount;
          for (let runIndex = line.runRange.start; runIndex < line.runRange.end; ++runIndex) {
              const run = this.runs[runIndex];
              let textRun = `${run.textDirection} graphemes[${run.glyphRange.start}:${run.glyphRange.end}] words[${run.wordRange.start}:${run.wordRange.end}]`;
              ++runCount;
              const nextRun = this.#generateRow(tbody, "run", "run", runCount, -1, textRun, run.bounds, line.bounds);
              console.assert(runCursor.right === nextRun.left);
              runCursor = nextRun;
              for (let wordIndex = run.wordRange.start; wordIndex < run.wordRange.end; ++wordIndex) {
                  const word = this.words[wordIndex];
                  // Few cases: whitespaces or word == cluster
                  let types = "word";
                  let classes = "word";
                  let secondCount = -1;
                  if (word.isWhitespaces) {
                      types += "/whitespaces";
                      classes += " whitespaces";
                  }
                  if (word.glyphRange.start + 1 === word.glyphRange.end) {
                      types += "/grapheme";
                      classes += " grapheme";
                      secondCount = clusterCount;
                      ++clusterCount;
                  }
                  const nextWord = this.#generateRow(tbody, types, classes, wordCount, secondCount, word.text, word.bounds, line.bounds);
                  //console.assert(wordCursor.right === nextWord.left);
                  wordCursor = nextWord;
                  ++wordCount;

                  if (word.glyphRange.start + 1 !== word.glyphRange.end) {
                      for (let clusterIndex = word.glyphRange.start; clusterIndex < word.glyphRange.end; ++clusterIndex) {
                          const cluster = this.graphemes[clusterIndex];
                          const nextCluster = this.#generateRow(tbody, "glypheme", "grapheme", clusterCount, -1, cluster.text, cluster.bounds, line.bounds);
                          //console.assert(clusterCursor.right === nextCluster.left);
                          clusterCursor = nextCluster;
                          ++clusterCount;
                      }
                  }
              }
          }
      }
  }

  // Input
  #fontStyleRanges;
  /*String*/text;
  /*Boolean*/#layoutPerformed;

  // Output
  #properties;        // Bit flags keeping all the information about graphemes, words, whitespaces and such per utf16 character
  #bounds;       // The entire paragraph bounding box

  graphemes;          // List of all grapheme clusters in the logical order (ignoring RTL)
  words;              // List of all words
  runs;               // List of text runs broken by text direction
  lines;              // List of all lines
}
