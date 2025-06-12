/**
 * TypeScript Compatibility Layer
 * Provides compatibility between TypeScript 5.2 and latest versions
 */

// Add missing utility types for older TypeScript versions
declare global {
  // NoInfer utility type (added in TypeScript 5.4)
  type NoInfer<T> = [T][T extends any ? 0 : never];

  // Awaited type enhancement for older versions
  type AwaitedCompat<T> = T extends PromiseLike<infer U> ? U : T;

  // Template literal pattern matching improvements
  type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

  // Const type parameter modifier compatibility
  type Const<T> = T;

  // Improved index signature handling
  type SafeIndex<T, K extends PropertyKey> = K extends keyof T ? T[K] : never;

  // Import attributes compatibility
  type ImportMeta = {
    url: string;
    env?: Record<string, string>;
    resolve?: (specifier: string) => string;
  };
}

// Module augmentation for React 18+ compatibility
declare module 'react' {
  // Add missing React 18 types for older TypeScript
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  // Suspense boundary compatibility
  interface SuspenseProps {
    fallback?: ReactNode;
    children?: ReactNode;
    unstable_avoidThisFallback?: boolean;
  }
}

// Module augmentation for DOM types
declare global {
  interface Window {
    // WebSocket compatibility
    WebSocket: typeof WebSocket;
    
    // Cloudflare-specific globals
    __CLOUDFLARE_CONF__?: {
      accountId: string;
      zoneId: string;
      apiToken: string;
    };
  }

  // FormData compatibility for older environments
  interface FormData {
    entries(): IterableIterator<[string, FormDataEntryValue]>;
    keys(): IterableIterator<string>;
    values(): IterableIterator<FormDataEntryValue>;
    [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
  }

  // File API enhancements
  interface File {
    webkitRelativePath?: string;
    stream(): ReadableStream<Uint8Array>;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
  }
}

// TypeScript configuration compatibility
declare module 'typescript' {
  interface CompilerOptions {
    // Options that may not exist in older versions
    ignoreDeprecations?: string;
    verbatimModuleSyntax?: boolean;
    allowArbitraryExtensions?: boolean;
    customConditions?: string[];
  }
}

// Utility type aliases for common patterns
type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

type DeepReadonly<T> = T extends object ? {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
} : T;

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type ValueOf<T> = T[keyof T];

// Promise utility types
type PromiseValue<T> = T extends Promise<infer U> ? U : T;
type AsyncReturnType<T extends (...args: any) => any> = PromiseValue<ReturnType<T>>;

// Export to make types available
export {
  DeepPartial,
  DeepReadonly,
  Mutable,
  ValueOf,
  PromiseValue,
  AsyncReturnType,
}; 