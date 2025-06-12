// Global type declarations for the application

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Fix for loadable component types
declare module '@loadable/component' {
  import { ComponentType, ReactNode } from 'react';

  interface LoadableOptions {
    fallback?: ReactNode;
    ssr?: boolean;
    resolveComponent?: (components: any) => any;
    cacheKey?: (props: any) => string;
    chunkName?: string;
  }

  function loadable<P = {}>(
    loadFn: (props?: P) => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
    options?: LoadableOptions
  ): ComponentType<P>;

  export default loadable;
}

export {};
