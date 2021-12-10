const propertyGroupFactory = (function () {
  return function (interfaceFunction, parentPropertyGroup) {
    return function (val) {
      val = val === undefined ? 1 : val;
      if (val <= 0) {
        return interfaceFunction;
      }
      return parentPropertyGroup(val - 1);
    };
  };
}());

export default propertyGroupFactory;
