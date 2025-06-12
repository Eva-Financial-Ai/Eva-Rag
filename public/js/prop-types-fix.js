// Fix for prop-types loading issues
if (typeof window !== 'undefined' && !window.PropTypes) {
  window.PropTypes = {
    any: function() { return null; },
    array: function() { return null; },
    bool: function() { return null; },
    func: function() { return null; },
    number: function() { return null; },
    object: function() { return null; },
    string: function() { return null; },
    symbol: function() { return null; },
    node: function() { return null; },
    element: function() { return null; },
    elementType: function() { return null; },
    instanceOf: function() { return null; },
    oneOf: function() { return null; },
    oneOfType: function() { return null; },
    arrayOf: function() { return null; },
    objectOf: function() { return null; },
    shape: function() { return null; },
    exact: function() { return null; }
  };
  console.log('PropTypes polyfill loaded');
}
