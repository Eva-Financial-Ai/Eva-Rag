/**
 * Test utilities for mocking browser APIs in Jest tests
 * Provides type-safe mocks for canvas, matchMedia, and other browser APIs
 */

export const createMatchMediaMock = (matches = false) => {
  return jest.fn().mockImplementation(
    (query: string): MediaQueryList => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })
  );
};

export const createCanvasContextMock = (): CanvasRenderingContext2D => {
  const canvas = document.createElement('canvas');
  return {
    canvas,
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1,
      colorSpace: 'srgb' as PredefinedColorSpace,
    })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => new ImageData(1, 1)),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    getContextAttributes: jest.fn(() => ({
      alpha: true,
      colorSpace: 'srgb' as PredefinedColorSpace,
      desynchronized: false,
      willReadFrequently: false,
    })),
    strokeStyle: '#000000',
    fillStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    getLineDash: jest.fn(() => []),
    setLineDash: jest.fn(),
    lineDashOffset: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: 'rgba(0, 0, 0, 0)',
    font: '10px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    direction: 'inherit' as CanvasDirection,
    measureText: jest.fn(() => ({
      width: 0,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 0,
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
      fontBoundingBoxAscent: 0,
      fontBoundingBoxDescent: 0,
      emHeightAscent: 0,
      emHeightDescent: 0,
      hangingBaseline: 0,
      alphabeticBaseline: 0,
      ideographicBaseline: 0,
    })),
    strokeText: jest.fn(),
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createPattern: jest.fn(() => null),
    clip: jest.fn(),
    transform: jest.fn(),
    resetTransform: jest.fn(),
    isPointInPath: jest.fn(() => false),
    isPointInStroke: jest.fn(() => false),
    createConicGradient: jest.fn(),
    filter: 'none',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low' as ImageSmoothingQuality,
    strokeRect: jest.fn(),
    rect: jest.fn(),
    quadraticCurveTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    arcTo: jest.fn(),
    ellipse: jest.fn(),
    roundRect: jest.fn(),
    scrollPathIntoView: jest.fn(),
    drawFocusIfNeeded: jest.fn(),
    getTransform: jest.fn(() => new DOMMatrix()),
    isContextLost: jest.fn(() => false),
    reset: jest.fn(),
    fontKerning: 'auto' as CanvasFontKerning,
    fontStretch: 'normal' as CanvasFontStretch,
    fontVariantCaps: 'normal' as CanvasFontVariantCaps,
    letterSpacing: '0px',
    textRendering: 'auto' as CanvasTextRendering,
    wordSpacing: '0px',
  } as unknown as CanvasRenderingContext2D;
};

export const createIntersectionObserverMock = () => {
  return class IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin: string = '0px';
    thresholds: ReadonlyArray<number> = [0];

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.root = options?.root || null;
      this.rootMargin = options?.rootMargin || '0px';
      this.thresholds = options?.threshold
        ? Array.isArray(options.threshold)
          ? options.threshold
          : [options.threshold]
        : [0];
    }
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  };
};

export const createResizeObserverMock = () => {
  return class ResizeObserver {
    constructor(callback: ResizeObserverCallback) {}
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
};

export const setupBrowserMocks = () => {
  // Setup all browser API mocks
  global.matchMedia = createMatchMediaMock();
  global.scrollTo = jest.fn();
  global.IntersectionObserver = createIntersectionObserverMock();
  global.ResizeObserver = createResizeObserverMock();
  global.URL.createObjectURL = jest.fn(() => 'mock-url');
  global.URL.revokeObjectURL = jest.fn();

  // Canvas mock
  HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
    if (contextId === '2d') {
      return createCanvasContextMock();
    }
    if (contextId === 'bitmaprenderer') {
      return {
        transferFromImageBitmap: jest.fn(),
        canvas: document.createElement('canvas'),
      } as unknown as ImageBitmapRenderingContext;
    }
    return null;
  }) as any;

  // Basic window/document mocks for test environments
  if (typeof global.window === 'undefined') {
    (global as any).window = {};
  }

  const win = global.window as any;

  if (!win.document) {
    win.document = {
      createElement: () => ({ style: {} }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  }

  if (!win.navigator) {
    win.navigator = { userAgent: 'node.js' };
  }

  if (!win.requestAnimationFrame) {
    win.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
    win.cancelAnimationFrame = (id: any) => clearTimeout(id);
  }
};
