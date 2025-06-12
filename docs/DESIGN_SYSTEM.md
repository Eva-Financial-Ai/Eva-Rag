# EVA Platform Design System

This document outlines the design system for the EVA Platform, ensuring consistency across the application.

## Typography

### Font Sizes

| Class     | Size (rem) | Size (px) | Use Case                 |
|-----------|------------|-----------|--------------------------|
| text-xs   | 0.75rem    | 12px      | Small footnotes, labels  |
| text-sm   | 0.875rem   | 14px      | Secondary text           |
| text-base | 1rem       | 16px      | Body text (default)      |
| text-lg   | 1.125rem   | 18px      | Emphasized body text     |
| text-xl   | 1.25rem    | 20px      | Subheadings              |
| text-2xl  | 1.5rem     | 24px      | Section headings         |
| text-3xl  | 1.875rem   | 30px      | Page headings            |
| text-4xl  | 2.25rem    | 36px      | Large titles             |
| text-5xl  | 3rem       | 48px      | Hero headings            |
| text-6xl  | 3.75rem    | 60px      | Largest display text     |

### Font Weights

| Class         | Weight | Use Case                       |
|---------------|--------|---------------------------------|
| font-light    | 300    | Light text                      |
| font-normal   | 400    | Normal text (default)           |
| font-medium   | 500    | Medium emphasis                 |
| font-semibold | 600    | High emphasis                   |
| font-bold     | 700    | Strongest emphasis              |

### Line Heights

| Class          | Line Height | Use Case                       |
|----------------|------------|---------------------------------|
| leading-tight  | 1.25       | Headings                        |
| leading-snug   | 1.375      | Condensed text                  |
| leading-normal | 1.5        | Body text (default)             |
| leading-relaxed| 1.625      | Long-form content               |
| leading-loose  | 2          | Maximum readability             |

## Colors

The EVA Platform uses a consistent color palette to ensure visual harmony:

### Primary Colors

- Primary (Red Variants): Used for main actions, CTAs, and branding elements
- Secondary (Blue Variants): Used for supporting elements and secondary actions

### Neutral Colors

- Gray scale: Used for text, backgrounds, borders
- Silver scale: Used for subtle UI elements

### Functional Colors

- Success: Green variants for positive feedback
- Warning: Yellow/Amber variants for cautionary elements
- Error: Red variants for error states
- Info: Blue variants for informational elements

## Spacing

Consistent spacing helps create visual rhythm and hierarchy:

| Class   | Size (rem) | Size (px) | Use Case                   |
|---------|------------|-----------|----------------------------|
| p-0/m-0 | 0          | 0px       | No spacing                 |
| p-1/m-1 | 0.25rem    | 4px       | Smallest spacing unit      |
| p-2/m-2 | 0.5rem     | 8px       | Tight spacing              |
| p-3/m-3 | 0.75rem    | 12px      | Compact spacing            |
| p-4/m-4 | 1rem       | 16px      | Default spacing (base)     |
| p-5/m-5 | 1.25rem    | 20px      | Slightly larger spacing    |
| p-6/m-6 | 1.5rem     | 24px      | Medium spacing             |
| p-8/m-8 | 2rem       | 32px      | Large spacing              |
| p-10/m-10 | 2.5rem   | 40px      | Extra large spacing        |
| p-12/m-12 | 3rem     | 48px      | Very large spacing         |
| p-16/m-16 | 4rem     | 64px      | Extremely large spacing    |

## Components

### Buttons

- **Primary Button**: High emphasis, used for main actions
- **Secondary Button**: Medium emphasis, used for secondary actions
- **Tertiary Button**: Low emphasis, used for tertiary actions

### Cards

Use the `.card` class for consistent card styling:
- White background (dark mode: dark gray)
- Rounded corners (0.5rem)
- Subtle shadow
- Consistent padding (1rem)

### Navigation

Navigation items use consistent styling:
- Font size: text-sm (14px)
- Font weight: font-medium (500)
- Consistent padding
- Active state highlighting

## Responsive Design

The EVA Platform uses a mobile-first approach with the following breakpoints:

| Breakpoint | Min Width | Description                                     |
|------------|-----------|--------------------------------------------------|
| sm         | 640px     | Small devices (landscape phones, small tablets)  |
| md         | 768px     | Medium devices (tablets)                         |
| lg         | 1024px    | Large devices (desktops, small laptops)          |
| xl         | 1280px    | Extra large devices (large desktops, laptops)    |
| 2xl        | 1536px    | 2X large devices (large screens)                 |

## Usage Guidelines

1. **Typography**: Use the defined text classes for consistent font sizes
2. **Spacing**: Use the spacing system for margins and paddings
3. **Colors**: Stick to the defined color palette
4. **Components**: Use the pre-defined component classes
5. **Responsive**: Design mobile-first, then adapt for larger screens

## Implementation

This design system is implemented through:

1. CSS Variables (in design-system.css)
2. Tailwind CSS configuration
3. Component-specific styles when needed

For more details, see the `src/styles/design-system.css` file and `tailwind.config.js`. 