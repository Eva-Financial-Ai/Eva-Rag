// This file contains polyfills and module resolutions to fix common chunk loading errors

// Handle potential prop-types loading issues
if (typeof window !== 'undefined' && !window.PropTypes) {
  try {
    // Create a stub PropTypes if missing to prevent crashes
    window.PropTypes = {
      any: () => null,
      array: () => null,
      bool: () => null,
      func: () => null,
      number: () => null,
      object: () => null,
      string: () => null,
      symbol: () => null,
      node: () => null,
      element: () => null,
      elementType: () => null,
      instanceOf: () => null,
      oneOf: () => null,
      oneOfType: () => null,
      arrayOf: () => null,
      objectOf: () => null,
      shape: () => null,
      exact: () => null,
    };
    console.info('PropTypes polyfill loaded');
  } catch (e) {
    console.error('Failed to load PropTypes polyfill', e);
  }
}

// Chunk loading error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', function(event) {
    if (event && event.message && event.message.includes('ChunkLoadError')) {
      console.error('Chunk load error detected - refreshing page');
      // Optionally reload the page when a chunk loading error is detected
      // window.location.reload();
    }
  });
}

export default {}; 