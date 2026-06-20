---
name: Modern Learning System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464555'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  section-gap: 40px
---

## Brand & Style

The design system is anchored in an **Educational Modernist** aesthetic, prioritizing clarity, optimism, and frictionless navigation. It is designed for learners who require a high-focus environment that still feels vibrant and encouraging. 

The visual style utilizes **Modern Corporate** principles with a leaning toward **Soft Minimalism**. By combining expansive whitespace with high-energy accent colors, the system directs attention to course content and scheduling without overwhelming the user. The interface should feel "light as air," using depth and soft edges to create a friendly, approachable atmosphere for lifelong learning.

## Colors

The palette is built on a clean, high-reflectance background to ensure maximum legibility and a sense of "digital calm."

*   **Indigo Blue (Primary):** Used for primary actions, active navigation states, and brand-heavy elements. It conveys professionalism and trust.
*   **Soft Mint (Success):** Utilized for positive feedback loops, such as successful registration or course completion. The background tint should be highly desaturated to keep the UI "airy."
*   **Warm Orange (Highlight):** Reserved for "Upcoming" alerts, urgent reminders, and highlighting high-value features. It acts as a visual "tap" on the shoulder.
*   **Neutrals:** A scale of cool grays provides structure. The primary background is pure white (#FFFFFF) to allow the indigo and orange to pop.

## Typography

This design system uses **Inter** exclusively to leverage its exceptional legibility on small screens and its neutral, systematic character.

*   **Headlines:** Use Bold (700) or Semi-Bold (600) weights with slight negative letter-spacing to create a tight, modern editorial feel.
*   **Body:** Keep line heights generous (1.5x) to prevent "wall of text" fatigue, especially in course descriptions.
*   **Labels:** Use Medium (500) weights for status badges and metadata to ensure they remain distinct from body copy.

## Layout & Spacing

The system follows a **Mobile-First, Fluid Grid** philosophy. 

1.  **Mobile (Default):** A single-column layout with 20px side margins. Elements are stacked vertically with 16px or 24px gaps.
2.  **The 8px Rhythm:** All spacing increments must be multiples of 8px to maintain vertical rhythm.
3.  **Calendar Grid:** For the monthly view, the grid is a 7-column fluid container. On mobile, use a "dot-indicator" view for days, with the full class list appearing below the selected date to maintain thumb-reachability.
4.  **Whitespace:** Prioritize "breathe room" around class cards and registration buttons to reduce cognitive load.

## Elevation & Depth

To maintain the "Modern" feel, the design system avoids heavy shadows. Instead, it uses **Ambient Soft Depth**:

*   **Level 0 (Background):** Pure white or ultra-light gray (#F9FAFB).
*   **Level 1 (Cards):** Subtle 1px border (#F3F4F6) with a very diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.04)`.
*   **Level 2 (Active/Floating):** Used for primary buttons and active calendar selections. Shadow: `0px 8px 24px rgba(79, 70, 229, 0.15)` (tinted with the primary indigo).
*   **Backdrop Blur:** Use a 12px blur on sticky headers to maintain context of the content scrolling beneath.

## Shapes

The shape language is defined by **Large Radii**, creating a friendly and safe atmosphere.

*   **Standard Elements:** Buttons, Input fields, and Small Chips use a **0.5rem (8px)** radius.
*   **Containers:** Class cards and Modal sheets use a **1rem (16px)** radius to feel substantial and distinct.
*   **Status Badges:** Use a fully rounded **Pill** shape to differentiate them from interactive buttons.

## Components

### Buttons
*   **Primary:** Indigo Blue background, white text. Large padding (16px vertical) and bold labels.
*   **Secondary/Ghost:** Indigo Blue outline or text-only, used for "View Details" to ensure the "Register" button remains the focus.

### Class Cards
*   **Structure:** Featured thumbnail at the top (16:9 ratio), followed by a padding-heavy content area.
*   **Information Hierarchy:** Headline, followed by a time/date label with an icon, and a status badge in the top-right corner of the image.

### Status Badges
*   **Open:** Indigo Blue text on a light blue tint.
*   **Ongoing:** Warm Orange text on a light orange tint.
*   **Completed:** Soft Mint text on a light mint tint.

### Calendar
*   **Interaction:** Tapping a date should show a high-contrast Indigo circle around the number. 
*   **Indicators:** Use small dots underneath the date numbers to signify multiple classes on a single day.

### Input Fields
*   **Style:** Minimalist borders with 1px thickness. Focus state uses a 2px Indigo Blue border and a soft indigo outer glow.