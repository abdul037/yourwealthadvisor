

# Tharwa Net Logo Redesign

A fresh, bold, and techy abstract symbol for your next-gen personal finance wealth manager.

## Overview

We'll create a new abstract symbol that embodies growth, wealth, and modern fintech aesthetics—moving away from the current "T + Arrow" design to a distinctive abstract mark that stands out in the personal finance space.

## Design Direction

**Style:** Bold & Techy
- Dynamic, futuristic look with sharp geometric angles
- Inspired by leading fintech brands like Revolut, N26, and Monzo
- High contrast with the signature emerald green gradient

**Concept:** Abstract Symbol
- A unique geometric mark representing:
  - **Upward momentum** (wealth growth)
  - **Interconnection** (network/net concept from "Tharwa Net")
  - **Precision** (financial accuracy and control)

## Implementation Plan

### Step 1: Fix Build Error
There's a TypeScript error in the `social-weekly-digest` edge function that needs to be fixed first:
- Update the `listAllUsers` function parameter type to use a more flexible type annotation

### Step 2: Generate New Logo Assets
Use AI image generation to create a new abstract logo with these specifications:
- Bold geometric abstract symbol
- Emerald green (#10b981) to teal gradient
- Sharp angles with clean lines
- Dark background variant for app use
- Transparent background variant for flexibility

### Step 3: Update Logo Files
Replace all logo assets across the project:

| File | Purpose | Size |
|------|---------|------|
| `src/assets/logo-icon.png` | Main app logo | 512x512 |
| `public/pwa-192x192.png` | PWA small icon | 192x192 |
| `public/pwa-512x512.png` | PWA large icon | 512x512 |
| `public/apple-touch-icon.png` | iOS home screen | 180x180 |
| `public/favicon.ico` | Browser favicon | 32x32 |

### Step 4: Component Compatibility
The `TharwaLogo` component will continue to work seamlessly—it just imports the logo image file, so updating the file updates the logo everywhere automatically:
- Sidebar header
- Welcome/landing page
- Auth pages
- 404 page

## Technical Notes

- All logo files will be optimized for web
- PWA maskable icon requirements will be respected (safe zone padding)
- Dark/light theme compatibility maintained
- No component code changes needed for the logo swap

## Files to Modify

1. `supabase/functions/social-weekly-digest/index.ts` - Fix TypeScript error
2. `src/assets/logo-icon.png` - New main logo
3. `public/pwa-192x192.png` - New PWA icon (small)
4. `public/pwa-512x512.png` - New PWA icon (large)
5. `public/apple-touch-icon.png` - New iOS icon
6. `public/favicon.ico` - New favicon

