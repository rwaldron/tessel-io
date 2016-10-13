if (!Array.prototype.includes) {
  Array.prototype.includes = function(entry) {
    return this.indexOf(entry) !== -1;
  };
}

if (!Object.values) {
  Object.values = function(object) {
    return Object.getOwnPropertyNames(object).map(name => object[name]);
  };
}
