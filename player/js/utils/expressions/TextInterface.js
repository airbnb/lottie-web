const TextExpressionInterface = (function () {
  return function (elem) {
    var _sourceText;
    function _thisLayerFunction(name) {
      switch (name) {
        case 'ADBE Text Document':
          return _thisLayerFunction.sourceText;
        default:
          return null;
      }
    }
    Object.defineProperty(_thisLayerFunction, 'sourceText', {
      get: function () {
        elem.textProperty.getValue();
        var stringValue = elem.textProperty.currentData.t;
        if (!_sourceText || stringValue !== _sourceText.value) {
          _sourceText = new String(stringValue); // eslint-disable-line no-new-wrappers
          // If stringValue is an empty string, eval returns undefined, so it has to be returned as a String primitive
          _sourceText.value = stringValue || new String(stringValue); // eslint-disable-line no-new-wrappers
          Object.defineProperty(_sourceText, 'style', {
            get: function () {
              return {
                fillColor: elem.textProperty.currentData.fc,
              };
            },
          });
        }
        return _sourceText;
      },
    });
    return _thisLayerFunction;
  };
}());

export default TextExpressionInterface;
