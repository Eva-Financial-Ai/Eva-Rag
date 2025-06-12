declare module 'react-feather' {
  import React from 'react';
  
  export interface IconProps {
    color?: string;
    size?: string | number;
    className?: string;
    onClick?: () => void;
    [key: string]: any;
  }
  
  export const AlertCircle: React.FC<IconProps>;
  export const Camera: React.FC<IconProps>;
  export const ChevronLeft: React.FC<IconProps>;
  export const Clock: React.FC<IconProps>;
  export const Database: React.FC<IconProps>;
  export const File: React.FC<IconProps>;
  export const FileText: React.FC<IconProps>;
  export const Image: React.FC<IconProps>;
  export const Menu: React.FC<IconProps>;
  export const MessageCircle: React.FC<IconProps>;
  export const Plus: React.FC<IconProps>;
  export const Send: React.FC<IconProps>;
  export const Settings: React.FC<IconProps>;
  export const Target: React.FC<IconProps>;
  export const TrendingUp: React.FC<IconProps>;
  export const Users: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const Zap: React.FC<IconProps>;
} 