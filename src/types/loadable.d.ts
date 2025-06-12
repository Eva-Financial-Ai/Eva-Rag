declare module '@loadable/component' {
  import { ComponentType, ReactNode } from 'react';

  interface LoadableOptions {
    fallback?: ReactNode;
    ssr?: boolean;
    resolveComponent?: (components: any) => any;
    cacheKey?: (props: any) => string;
    chunkName?: string;
  }

  interface LoadableComponent<T = any> extends ComponentType<T> {
    load: () => Promise<any>;
    preload: () => void;
  }

  function loadable<T = any>(
    loadFn: (props?: any) => Promise<any>,
    options?: LoadableOptions
  ): ComponentType<T>;

  export default loadable;
  export { LoadableComponent, LoadableOptions };
}
