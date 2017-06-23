if (!Object.values) {
  Object.values = function(object) {
    return Object.getOwnPropertyNames(object).map(name => object[name]);
  };
}
