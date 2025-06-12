// Type declarations for modules without TypeScript definitions
import '@testing-library/jest-dom';

declare module 'dompurify' {
  export function sanitize(input: string): string;
}

declare module 'react-intl' {
  import { ReactNode } from 'react';

  export interface FormattedMessageProps {
    id: string;
    defaultMessage?: string;
    values?: Record<string, any>;
  }

  export const FormattedMessage: React.FC<FormattedMessageProps>;
}

declare module 'html2canvas' {
  interface Html2CanvasOptions {
    allowTaint?: boolean;
    backgroundColor?: string;
    canvas?: HTMLCanvasElement;
    foreignObjectRendering?: boolean;
    imageTimeout?: number;
    ignoreElements?: (element: Element) => boolean;
    logging?: boolean;
    onclone?: (document: Document) => void;
    proxy?: string;
    removeContainer?: boolean;
    scale?: number;
    useCORS?: boolean;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    scrollX?: number;
    scrollY?: number;
    windowWidth?: number;
    windowHeight?: number;
  }

  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions
  ): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'jspdf' {
  export interface JsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: 'mm' | 'cm' | 'in' | 'px' | 'pt' | 'pc';
    format?: string | [number, number];
    compress?: boolean;
    precision?: number;
    filters?: string[];
  }

  export type JsPDF = {
    addPage: (format?: string | [number, number], orientation?: 'portrait' | 'landscape') => JsPDF;
    setFontSize: (size: number) => JsPDF;
    text: (text: string, x: number, y: number, options?: any) => JsPDF;
    addImage: (
      imageData: string | HTMLImageElement | HTMLCanvasElement,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: 'NONE' | 'FAST' | 'MEDIUM' | 'SLOW',
      rotation?: number
    ) => JsPDF;
    save: (filename: string) => JsPDF;
    output: (type: string, options?: any) => any;
  };

  class JsPDF {
    constructor(options?: JsPDFOptions);
  }

  export default JsPDF;
}

declare module 'semver' {
  export function valid(version: string): string | null;
  export function gt(version1: string, version2: string): boolean;
  export function lt(version1: string, version2: string): boolean;
  export function gte(version1: string, version2: string): boolean;
  export function lte(version1: string, version2: string): boolean;
  export function eq(version1: string, version2: string): boolean;
  export function satisfies(version: string, range: string): boolean;
  export function coerce(version: string): string | null;
}

// Fix for react-spring animated components
declare module '@react-spring/web' {
  import {
    ComponentPropsWithRef,
    ComponentType,
    CSSProperties,
    ForwardRefExoticComponent,
    PropsWithoutRef,
    RefAttributes,
  } from 'react';

  export type AnimatedProps<T> = T;

  export interface SpringValue<T = any> {
    get(): T;
    set(value: T): void;
  }

  type AnimatedComponentProps<T extends React.ElementType> = React.ComponentPropsWithRef<T> & {
    style?: any;
    children?: React.ReactNode;
    className?: string;
    ref?: React.Ref<any>;
  };

  type CreateAnimated = {
    [Tag in keyof JSX.IntrinsicElements]: ForwardRefExoticComponent<
      AnimatedComponentProps<Tag> & RefAttributes<Element>
    >;
  } & {
    <C extends ComponentType<any>>(
      component: C
    ): ComponentType<AnimatedProps<ComponentPropsWithRef<C>>>;
  };

  export const animated: CreateAnimated;
  export const a: CreateAnimated;
}

// Helper functions
declare function getCsrfToken(): string;

// Add JSX namespace for TypeScript
declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Extend Jest matchers for @testing-library/jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
    }
  }
}

// Add declarations for conversation components
declare module './ConversationHeader' {
  import React from 'react';
  import { TransactionConversation } from '../types/conversation';

  interface ConversationHeaderProps {
    conversation: TransactionConversation;
    onInviteUser: () => void;
    onViewDeal: () => void;
  }

  const ConversationHeader: React.FC<ConversationHeaderProps>;
  export default ConversationHeader;
}

declare module './MessageBubble' {
  import React from 'react';
  import { ConversationMessage } from '../types/conversation';

  interface MessageBubbleProps {
    message: ConversationMessage;
    isCurrentUser: boolean;
  }

  const MessageBubble: React.FC<MessageBubbleProps>;
  export default MessageBubble;
}

declare module './SmartMatchPanel' {
  import React from 'react';
  import { TransactionConversation, SmartMatchRecommendation } from '../types/conversation';

  interface SmartMatchPanelProps {
    conversation: TransactionConversation;
    onSelectLender: (recommendation: SmartMatchRecommendation) => void;
  }

  const SmartMatchPanel: React.FC<SmartMatchPanelProps>;
  export default SmartMatchPanel;
}

declare module './TypingIndicator' {
  import React from 'react';

  interface TypingIndicatorProps {
    sender: string;
  }

  const TypingIndicator: React.FC<TypingIndicatorProps>;
  export default TypingIndicator;
}

// Update the ToggleSwitch declaration to be more specific with the right path
declare module './ToggleSwitch' {
  import React from 'react';

  interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }

  export const ToggleSwitch: React.FC<ToggleSwitchProps>;
  export default ToggleSwitch;
}

// Add specific path for demo components
declare module 'src/components/demo/ToggleSwitch' {
  import React from 'react';

  interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }

  export const ToggleSwitch: React.FC<ToggleSwitchProps>;
  export default ToggleSwitch;
}
