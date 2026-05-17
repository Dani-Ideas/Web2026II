---
name: Fleet Operational Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cddbf0'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9fe'
  surface-container-highest: '#d6e4f9'
  on-surface: '#0f1c2b'
  on-surface-variant: '#44474c'
  inverse-surface: '#243141'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777d'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f6073'
  primary: '#041627'
  on-primary: '#ffffff'
  primary-container: '#1a2b3c'
  on-primary-container: '#8192a7'
  inverse-primary: '#b7c8de'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fd8b00'
  on-secondary-container: '#603100'
  tertiary: '#001912'
  on-tertiary: '#ffffff'
  tertiary-container: '#003025'
  on-tertiary-container: '#3aa186'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4fb'
  primary-fixed-dim: '#b7c8de'
  on-primary-fixed: '#0b1d2d'
  on-primary-fixed-variant: '#38485a'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#92f5d6'
  tertiary-fixed-dim: '#76d8bb'
  on-tertiary-fixed: '#002018'
  on-tertiary-fixed-variant: '#005140'
  background: '#f8f9ff'
  on-background: '#0f1c2b'
  surface-variant: '#d6e4f9'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-page: 32px
---

## Brand & Style

The design system is engineered for high-stakes operational environments where speed of cognition and reliability are paramount. The brand personality is **Industrial-Modern**: a synthesis of utilitarian efficiency and sophisticated technology. It evokes a sense of "command and control," positioning the user as an empowered operator of complex logistics.

The visual style follows a **High-Contrast Corporate** approach. It prioritizes clarity over decoration, using a structured grid and a rigorous color hierarchy to minimize cognitive load. Elements are substantial and grounded, avoiding fragile aesthetics in favor of a robust, heavy-duty feel that reflects the physical nature of fleet management.

## Colors

The color palette is built for extreme functional differentiation. 

- **Deep Navy (#1A2B3C)** serves as the anchor, used for global navigation, headers, and primary text to establish authority and professional trust.
- **Safety Orange (#FF8C00)** is reserved strictly for primary actions and critical alerts, ensuring high visibility against the navy and neutral backgrounds.
- **Semantic Colors** (Emerald Green, Amber, Red) follow standard industrial conventions for "Pass," "Caution," and "Fail/Critical" statuses.

Use high-contrast ratios (minimum 4.5:1 for body text) to ensure legibility in various lighting conditions, including high-glare environments typical for field operations.

## Typography

This design system utilizes **Inter** for its exceptional legibility and comprehensive technical features. 

- **Numerical Data:** Use tabular lining (`tnum`) for all data tables and fuel/odometer readings to ensure vertical alignment of digits.
- **Hierarchy:** Use heavy weights (600-700) for headlines and labels to maintain the industrial aesthetic.
- **Micro-copy:** Small labels should use uppercase with slight letter spacing to remain legible even at 10px-12px sizes on mobile terminals.

## Layout & Spacing

The system employs a **12-column fluid grid** with fixed gutters. The rhythm is based on a **4px baseline shift**, ensuring all components align to a predictable vertical scale.

- **Density:** Use "Compact" density for data-heavy tables (8px cell padding) and "Comfortable" density for configuration forms (16px-24px padding).
- **Alignment:** All primary containers must snap to the 16px grid. Large-scale dashboards should utilize the full width of the screen to maximize data visualization real estate.

## Elevation & Depth

To maintain an industrial and reliable feel, this design system minimizes the use of soft shadows. Depth is primarily communicated through **Tonal Layering** and **Subtle Outlines**.

- **Level 0 (Background):** Solid light gray (#F8FAFC).
- **Level 1 (Cards/Tables):** White background with a 1px solid border (#E2E8F0). No shadow.
- **Level 2 (Popovers/Modals):** White background with a sharp, medium-density shadow (Offset: 0, 4px; Blur: 12px; Color: rgba(26, 43, 60, 0.15)).
- **Interactive States:** Use a 2px Safety Orange border for focus states to ensure they are unmistakable.

## Shapes

The shape language is **Soft-Industrial**. We use a 4px (0.25rem) base radius to prevent the interface from feeling "sharp" or hostile, while maintaining the structured, rectilinear look of professional equipment. 

- **Buttons & Inputs:** 4px radius.
- **Status Badges:** Fully rounded (pill) to contrast against the rectangular grid of data tables.
- **Data Containers:** 8px radius for top-level card containers.

## Components

### Buttons
- **Primary:** Deep Navy background with White text. High-contrast.
- **Action/Urgent:** Safety Orange background with White text. Used for "Start Route," "Emergency," or "Dispatch."
- **Ghost:** Transparent background with 1px Navy border. Used for secondary navigation.

### Data Tables
- Header rows must be Deep Navy with White uppercase labels.
- Alternate row striping (Zebra) using #F1F5F9 for increased scanability.
- Action icons should be grouped in the final right-hand column.

### Status Badges
- **Pass:** Emerald Green background (10% opacity) with Emerald Green bold text.
- **Caution:** Amber background (10% opacity) with Amber bold text.
- **Alert:** Safety Orange background (solid) with White text for maximum urgency.

### Input Fields
- Heavy 1px border (#CBD5E1) that darkens on hover.
- Error states must include both a red border and a secondary "Caution" icon to assist with color-blind accessibility.

### Fleet-Specific Components
- **Vehicle Card:** Includes a large status badge, fuel percentage bar, and "Quick Dispatch" orange button.
- **Telemetry Sparkline:** Compact, monochromatic line graphs within tables to show fuel or speed trends without taking up excessive space.