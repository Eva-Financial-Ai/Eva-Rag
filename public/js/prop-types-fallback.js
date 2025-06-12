/* Fallback implementation of PropTypes to prevent chunk loading errors */
if (!window.PropTypes) {
  window.PropTypes = {
    array: function() { return null; },
    bool: function() { return null; },
    func: function() { return null; },
    number: function() { return null; },
    object: function() { return null; },
    string: function() { return null; },
    symbol: function() { return null; },
    any: function() { return null; },
    arrayOf: function() { return null; },
    element: function() { return null; },
    elementType: function() { return null; },
    instanceOf: function() { return null; },
    node: function() { return null; },
    objectOf: function() { return null; },
    oneOf: function() { return null; },
    oneOfType: function() { return null; },
    shape: function() { return null; },
    exact: function() { return null; },
    checkPropTypes: function() { return null; },
    resetWarningCache: function() { return null; }
  };
  console.info('PropTypes polyfill loaded');
}
