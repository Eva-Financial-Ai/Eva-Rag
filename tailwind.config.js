/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.html',
    './public/index.html',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  // darkMode: 'class', // Dark mode disabled temporarily to fix PostCSS errors
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    fontFamily: {
      sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      serif: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Inter', 'system-ui', 'sans-serif'],
      book: ['Inter', 'system-ui', 'sans-serif'],
    },
    extend: {
      fontSize: {
        // Use CSS variables from typography-system.css
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
      },
      lineHeight: {
        tight: 1.2,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
      },
      letterSpacing: {
        tighter: 'var(--tracking-tighter)',
        tight: 'var(--tracking-tight)',
        normal: 'var(--tracking-normal)',
        wide: 'var(--tracking-wide)',
        wider: 'var(--tracking-wider)',
        widest: 'var(--tracking-widest)',
      },
      spacing: {
        // Use CSS variables from unified-design-system.css
        0: 'var(--space-0)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
        12: 'var(--space-12)',
        16: 'var(--space-16)',
        20: 'var(--space-20)',
        24: 'var(--space-24)',
      },
      colors: {
        // EVA brand colors - Red as primary
        primary: {
          DEFAULT: '#dc2626',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        secondary: {
          DEFAULT: '#6366f1',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        error: {
          DEFAULT: '#d32f2f',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // System colors
        background: {
          light: '#f8f9fa',
          dark: '#1a1a1a',
        },
        text: {
          light: '#333333',
          dark: '#f5f5f5',
          'light-secondary': '#666666',
          'dark-secondary': '#b0b0b0',
        },
        border: {
          light: '#e5e7eb',
          dark: '#444444',
        },
        // Preserve legacy colors for backward compatibility
        'risk-red': {
          DEFAULT: '#D32F2F',
          light: '#EF5350',
          dark: '#B71C1C',
        },
        black: '#000000',
        white: '#FFFFFF',
        silver: {
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        'light-bg': '#f8f9fa',
        'dark-bg': '#1a1a1a',
        'light-border': '#e5e7eb',
        'light-text': '#333333',
        'dark-text': '#f5f5f5',
        'light-text-secondary': '#666666',
        'dark-card': '#2a2a2a',
        'sidebar-bg': '#1e1e1e',
        'card-bg': '#2a2a2a',
      },
      // Unified spacing system - increase by 21%
      spacing: {
        18: '4.5rem', // 72px
        22: '5.5rem', // 88px
        26: '6.5rem', // 104px
        30: '7.5rem', // 120px
        34: '8.5rem', // 136px
        38: '9.5rem', // 152px
        42: '10.5rem', // 168px
        46: '11.5rem', // 184px
        50: '12.5rem', // 200px
        // Keep legacy spacing values but increase them too
        'ui-element': '1.45rem', // 1.2rem -> ~1.45rem
        'sidebar-expanded': '23.43rem', // 19.36rem -> ~23.43rem
        'sidebar-collapsed': '8.23rem', // 6.8rem -> ~8.23rem
        'content-edge': 'calc(1in * 1.21)', // 1in -> ~1.21in
      },
      borderRadius: {
        DEFAULT: '0.30rem', // 4px -> ~5px
        sm: '0.15rem', // 2px -> ~2.4px
        md: '0.45rem', // 6px -> ~7.3px
        lg: '0.61rem', // 8px -> ~10px
        xl: '0.91rem', // 12px -> ~15px
        '2xl': '1.21rem', // 16px -> ~19px
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        focus: '0 0 0 3px rgba(79, 70, 229, 0.25)',
        title: '0 1px 1px rgba(0, 0, 0, 0.1)',
      },
      width: {
        // Update width values by 21%
        18: '6.59rem', // 5.45rem -> ~6.59rem
        22: '8.23rem', // 6.8rem -> ~8.23rem
        64: '23.43rem', // 19.36rem -> ~23.43rem
        76: '29.28rem', // 24.2rem -> ~29.28rem
        80: '24.2rem', // 20rem -> ~24.2rem
        84: '25.41rem', // 21rem -> ~25.41rem
        88: '26.62rem', // 22rem -> ~26.62rem
        90: '27.83rem', // 23rem -> ~27.83rem
        96: '29.04rem', // 24rem -> ~29.04rem
        100: '30.25rem', // 25rem -> ~30.25rem
        120: '36.3rem', // 30rem -> ~36.3rem
        160: '48.4rem', // 40rem -> ~48.4rem
        200: '60.5rem', // 50rem -> ~60.5rem
        'sidebar-collapsed': '8.23rem', // 6.8rem -> ~8.23rem
        'sidebar-expanded': '23.43rem', // 19.36rem -> ~23.43rem
      },
      height: {
        input: '3.03rem', // 40px -> ~48px
        14: '5.12rem', // 4.23rem -> ~5.12rem
        17: '6.41rem', // 5.3rem -> ~6.41rem
        128: '38.72rem', // 32rem -> ~38.72rem
        160: '48.4rem', // 40rem -> ~48.4rem
      },
      padding: {
        input: '0.91rem', // 0.75rem -> ~0.91rem
        btn: '0.61rem 1.21rem', // standard button padding increased by 21%
        'btn-sm': '0.30rem 0.61rem', // small button padding increased
        'btn-lg': '0.91rem 1.82rem', // large button padding increased
        chat: '1.45rem', // 1.2rem -> ~1.45rem
        card: '1.75rem', // 1.45rem -> ~1.75rem
        header: '1.45rem', // 1.2rem -> ~1.45rem
        'sidebar-offset': '1.21rem', // 1rem -> ~1.21rem
        'content-edge': 'calc(1in * 1.21)', // 1in -> ~1.21in
        'mobile-edge': '0.61rem', // 0.5rem -> ~0.61rem
        'tablet-edge': '1.21rem', // 1rem -> ~1.21rem
        'desktop-edge': '1.82rem', // 1.5rem -> ~1.82rem
      },
      margin: {
        element: '1.45rem', // 1.2rem -> ~1.45rem
        'sidebar-offset': '1.21rem', // 1rem -> ~1.21rem
        'content-edge': 'calc(1in * 1.21)', // 1in -> ~1.21in
        'mobile-edge': '0.61rem', // 0.5rem -> ~0.61rem
        'tablet-edge': '1.21rem', // 1rem -> ~1.21rem
        'desktop-edge': '1.82rem', // 1.5rem -> ~1.82rem
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '70%': { transform: 'scale(1.05)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-in-out',
        'slide-in': 'slide-in 0.4s ease-in-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-in': 'bounce-in 0.6s ease-out',
      },
      zIndex: {
        60: '60',
        70: '70',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
      // Larger minimum tap target sizes
      minWidth: {
        touch: '44px', // Minimum touch target
        button: '120px', // Minimum button width
      },
      minHeight: {
        touch: '44px', // Minimum touch target
        button: '48px', // Minimum button height
      },
    },
  },
  plugins: [
    function ({ addComponents, theme, addBase }) {
      // Add base rules to prevent accessibility issues
      addBase({
        // Prevent white buttons with white text
        '.bg-white.text-white': {
          color: theme('colors.gray.800') + ' !important',
        },
        '.text-white.bg-white': {
          color: theme('colors.gray.800') + ' !important',
        },
        // Prevent light backgrounds with light text
        '.bg-gray-50.text-white, .bg-gray-100.text-white, .bg-gray-200.text-white': {
          color: theme('colors.gray.700') + ' !important',
        },
        '.bg-gray-50.text-gray-100, .bg-gray-50.text-gray-200, .bg-gray-50.text-gray-300': {
          color: theme('colors.gray.700') + ' !important',
        },
        '.bg-gray-100.text-gray-100, .bg-gray-100.text-gray-200, .bg-gray-100.text-gray-300': {
          color: theme('colors.gray.700') + ' !important',
        },
        '.bg-gray-200.text-gray-100, .bg-gray-200.text-gray-200, .bg-gray-200.text-gray-300': {
          color: theme('colors.gray.700') + ' !important',
        },
        // Ensure buttons have proper contrast
        'button.bg-white': {
          color: theme('colors.gray.800') + ' !important',
          '&.text-white': {
            color: theme('colors.gray.800') + ' !important',
          },
        },
        'a.bg-white': {
          color: theme('colors.gray.800') + ' !important',
          '&.text-white': {
            color: theme('colors.gray.800') + ' !important',
          },
        },
        // Ensure form inputs have proper contrast
        'input.bg-white, select.bg-white, textarea.bg-white': {
          color: theme('colors.gray.800') + ' !important',
          '&::placeholder': {
            color: theme('colors.gray.500') + ' !important',
          },
        },
      });

      const components = {
        '.title-case': {
          textTransform: 'capitalize',
        },
        '.sentence-case': {
          textTransform: 'none',
          '&::first-letter': {
            textTransform: 'uppercase',
          },
        },
        // Typography components based on the design system
        '.display-large': {
          fontSize: theme('fontSize.display-lg[0]'),
          lineHeight: theme('fontSize.display-lg[1].lineHeight'),
          letterSpacing: theme('fontSize.display-lg[1].letterSpacing'),
          fontWeight: theme('fontWeight.extrabold'),
          fontFamily: theme('fontFamily.display'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.display-medium': {
          fontSize: theme('fontSize.display-md[0]'),
          lineHeight: theme('fontSize.display-md[1].lineHeight'),
          letterSpacing: theme('fontSize.display-md[1].letterSpacing'),
          fontWeight: theme('fontWeight.extrabold'),
          fontFamily: theme('fontFamily.display'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.display-small': {
          fontSize: theme('fontSize.display-sm[0]'),
          lineHeight: theme('fontSize.display-sm[1].lineHeight'),
          letterSpacing: theme('fontSize.display-sm[1].letterSpacing'),
          fontWeight: theme('fontWeight.extrabold'),
          fontFamily: theme('fontFamily.display'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.headline-large': {
          fontSize: theme('fontSize.headline-lg[0]'),
          lineHeight: theme('fontSize.headline-lg[1].lineHeight'),
          letterSpacing: theme('fontSize.headline-lg[1].letterSpacing'),
          fontWeight: theme('fontWeight.extrabold'),
          fontFamily: theme('fontFamily.display'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.headline-medium': {
          fontSize: theme('fontSize.headline-md[0]'),
          lineHeight: theme('fontSize.headline-md[1].lineHeight'),
          letterSpacing: theme('fontSize.headline-md[1].letterSpacing'),
          fontWeight: theme('fontWeight.extrabold'),
          fontFamily: theme('fontFamily.display'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.headline-small': {
          fontSize: theme('fontSize.headline-sm[0]'),
          lineHeight: theme('fontSize.headline-sm[1].lineHeight'),
          letterSpacing: theme('fontSize.headline-sm[1].letterSpacing'),
          fontWeight: theme('fontWeight.extrabold'),
          fontFamily: theme('fontFamily.display'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.title-large': {
          fontSize: theme('fontSize.title-lg[0]'),
          lineHeight: theme('fontSize.title-lg[1].lineHeight'),
          letterSpacing: theme('fontSize.title-lg[1].letterSpacing'),
          fontWeight: theme('fontWeight.extrabold'),
          fontFamily: theme('fontFamily.sans'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.title-medium': {
          fontSize: theme('fontSize.title-md[0]'),
          lineHeight: theme('fontSize.title-md[1].lineHeight'),
          letterSpacing: theme('fontSize.title-md[1].letterSpacing'),
          fontWeight: theme('fontWeight.bold'),
          fontFamily: theme('fontFamily.sans'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.title-small': {
          fontSize: theme('fontSize.title-sm[0]'),
          lineHeight: theme('fontSize.title-sm[1].lineHeight'),
          letterSpacing: theme('fontSize.title-sm[1].letterSpacing'),
          fontWeight: theme('fontWeight.bold'),
          fontFamily: theme('fontFamily.sans'),
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.body-large': {
          fontSize: theme('fontSize.body-lg[0]'),
          lineHeight: theme('fontSize.body-lg[1].lineHeight'),
          letterSpacing: theme('fontSize.body-lg[1].letterSpacing'),
          fontWeight: theme('fontWeight.normal'),
          fontFamily: theme('fontFamily.sans'),
        },
        '.body-medium': {
          fontSize: theme('fontSize.body-md[0]'),
          lineHeight: theme('fontSize.body-md[1].lineHeight'),
          letterSpacing: theme('fontSize.body-md[1].letterSpacing'),
          fontWeight: theme('fontWeight.normal'),
          fontFamily: theme('fontFamily.sans'),
        },
        '.body-small': {
          fontSize: theme('fontSize.body-sm[0]'),
          lineHeight: theme('fontSize.body-sm[1].lineHeight'),
          letterSpacing: theme('fontSize.body-sm[1].letterSpacing'),
          fontWeight: theme('fontWeight.normal'),
          fontFamily: theme('fontFamily.sans'),
        },
        '.label-large': {
          fontSize: theme('fontSize.label-lg[0]'),
          lineHeight: theme('fontSize.label-lg[1].lineHeight'),
          letterSpacing: theme('fontSize.label-lg[1].letterSpacing'),
          fontWeight: theme('fontWeight.bold'),
          fontFamily: theme('fontFamily.sans'),
          color: '#222',
        },
        '.label-medium': {
          fontSize: theme('fontSize.label-md[0]'),
          lineHeight: theme('fontSize.label-md[1].lineHeight'),
          letterSpacing: theme('fontSize.label-md[1].letterSpacing'),
          fontWeight: theme('fontWeight.bold'),
          fontFamily: theme('fontFamily.sans'),
          color: '#222',
        },
        '.label-small': {
          fontSize: theme('fontSize.label-sm[0]'),
          lineHeight: theme('fontSize.label-sm[1].lineHeight'),
          letterSpacing: theme('fontSize.label-sm[1].letterSpacing'),
          fontWeight: theme('fontWeight.bold'),
          fontFamily: theme('fontFamily.sans'),
          color: '#222',
        },
        // Form element components
        '.form-field': {
          marginBottom: theme('spacing.3'),
        },
        '.form-label': {
          display: 'block',
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.bold'),
          marginBottom: theme('spacing.1'),
          color: '#222',
        },
        '.form-label-required': {
          '&::after': {
            content: '" *"',
            color: theme('colors.error.DEFAULT'),
          },
        },
        '.form-input': {
          display: 'block',
          width: '100%',
          height: theme('height.input'),
          padding: theme('padding.input'),
          fontSize: theme('fontSize.base'),
          lineHeight: theme('lineHeight.normal'),
          color: 'var(--text-color, #333)',
          backgroundColor: '#fff',
          backgroundClip: 'padding-box',
          border: '1px solid var(--border-color, #e5e7eb)',
          borderRadius: theme('borderRadius.DEFAULT'),
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          '&:focus': {
            borderColor: theme('colors.primary.DEFAULT'),
            outline: '0',
            boxShadow: theme('boxShadow.focus'),
          },
          '&.error': {
            borderColor: theme('colors.error.DEFAULT'),
          },
        },
        '.form-select': {
          display: 'block',
          width: '100%',
          height: theme('height.input'),
          padding: theme('padding.input'),
          fontSize: theme('fontSize.base'),
          lineHeight: theme('lineHeight.normal'),
          color: 'var(--text-color, #333)',
          backgroundColor: '#fff',
          backgroundClip: 'padding-box',
          border: '1px solid var(--border-color, #e5e7eb)',
          borderRadius: theme('borderRadius.DEFAULT'),
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '16px 12px',
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          '&:focus': {
            borderColor: theme('colors.primary.DEFAULT'),
            outline: '0',
            boxShadow: theme('boxShadow.focus'),
          },
        },
        '.form-helper-text': {
          marginTop: theme('spacing.1'),
          fontSize: theme('fontSize.xs'),
          color: 'var(--text-color-light, #666)',
        },
        '.form-error-message': {
          marginTop: theme('spacing.1'),
          fontSize: theme('fontSize.xs'),
          color: theme('colors.error.DEFAULT'),
        },
        '.heading-fancy': {
          fontFamily: theme('fontFamily.display'),
          fontWeight: theme('fontWeight.extrabold'),
          letterSpacing: theme('letterSpacing.wide'),
          textTransform: 'uppercase',
          color: theme('colors.primary.DEFAULT'),
          textShadow: theme('boxShadow.title'),
        },
        '.chat-message': {
          fontSize: theme('fontSize.body-md[0]'),
          lineHeight: theme('fontSize.body-md[1].lineHeight'),
          padding: theme('padding.chat'),
          borderRadius: '0.5rem',
          marginBottom: '0.8rem',
        },
        '.chat-header': {
          fontSize: theme('fontSize.headline-sm[0]'),
          fontWeight: theme('fontWeight.bold'),
          marginBottom: '1.2rem',
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        '.dashboard-card': {
          padding: theme('padding.card'),
          borderRadius: '0.6rem',
          boxShadow: theme('boxShadow.md'),
        },
        '.dashboard-title': {
          fontSize: theme('fontSize.title-lg[0]'),
          fontWeight: theme('fontWeight.extrabold'),
          marginBottom: '1rem',
          color: '#222',
          textShadow: theme('boxShadow.title'),
        },
        // Layout components
        '.main-content': {
          transition: 'margin-left 300ms ease-in-out, width 300ms ease-in-out',
          width: 'calc(100% - var(--sidebar-width, 19.36rem))',
          marginLeft: 'var(--sidebar-width, 19.36rem)',
          '@screen sm': {
            paddingLeft: theme('padding.4'),
            paddingRight: theme('padding.4'),
          },
          '@screen md': {
            paddingLeft: theme('padding.6'),
            paddingRight: theme('padding.6'),
          },
          '@screen lg': {
            paddingLeft: theme('padding.8'),
            paddingRight: theme('padding.8'),
          },
        },
        '.main-content-collapsed': {
          width: 'calc(100% - 6.8rem)',
          marginLeft: '6.8rem',
        },
        // Responsive container for page content
        '.page-container': {
          width: '100%',
          maxWidth: '100%',
          margin: '0 auto',
          padding: '1.5rem',
          '@screen sm': {
            maxWidth: '100%',
            padding: '1.5rem',
          },
          '@screen md': {
            maxWidth: '100%',
            padding: '2rem',
          },
          '@screen lg': {
            maxWidth: '100%',
            padding: '2.5rem',
          },
          '@screen xl': {
            maxWidth: '100%',
            padding: '3rem',
          },
          '@screen 2xl': {
            maxWidth: '1920px',
            padding: '3rem',
            marginLeft: 'auto',
            marginRight: 'auto',
          },
        },
        // Stack layout utility
        '.stack': {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        },
        '.stack-sm > * + *': {
          marginTop: theme('spacing.2'),
        },
        '.stack-md > * + *': {
          marginTop: theme('spacing.4'),
        },
        '.stack-lg > * + *': {
          marginTop: theme('spacing.8'),
        },
        // Cluster layout utility
        '.cluster': {
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme('spacing.2'),
          justifyContent: 'flex-start',
          alignItems: 'center',
        },
        '.cluster-sm': {
          gap: theme('spacing.1'),
        },
        '.cluster-lg': {
          gap: theme('spacing.4'),
        },
        // Accessibility utility
        '.visually-hidden': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },

        // Red background universal rule - always use white text
        '.bg-red-50, .bg-red-100, .bg-red-200': {
          color: theme('colors.gray.800'),
        },
        '.bg-red-300, .bg-red-400, .bg-red-500, .bg-red-600, .bg-red-700, .bg-red-800, .bg-red-900':
          {
            color: theme('colors.white'),
          },
        '.bg-error, .bg-error-500, .bg-error-600, .bg-error-700, .bg-error-800, .bg-error-900': {
          color: theme('colors.white'),
        },
        '.bg-risk-red, .bg-risk-red-light, .bg-risk-red-dark': {
          color: theme('colors.white'),
        },

        // Button and header red background variants
        '.btn-red, .header-red': {
          backgroundColor: theme('colors.red.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.red.700'),
            color: theme('colors.white'),
          },
          '&:focus': {
            backgroundColor: theme('colors.red.700'),
            color: theme('colors.white'),
          },
          '&:active': {
            backgroundColor: theme('colors.red.800'),
            color: theme('colors.white'),
          },
        },
      };

      addComponents(components);
    },
  ],
  variants: {
    extend: {
      backgroundColor: ['dark', 'active', 'group-hover', 'disabled'],
      textColor: ['dark', 'disabled'],
      borderColor: ['dark', 'focus', 'disabled'],
      opacity: ['disabled'],
      cursor: ['disabled'],
      ringColor: ['focus-visible'],
      ringWidth: ['focus-visible'],
      fontWeight: ['hover', 'focus'],
    },
  },
};
