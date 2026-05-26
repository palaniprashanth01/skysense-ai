---
name: design-system-oryzo-ai
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# ORYZO AI

## Mission
Deliver implementation-ready design-system guidance for ORYZO AI that can be applied consistently across e-commerce storefront interfaces.

## Brand
- Product/brand: ORYZO AI
- URL: https://oryzo.ai/
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: structured, accessible, implementation-first
- Main font style: `font.family.primary=halyard-display-variable`, `font.family.stack=halyard-display-variable`, `font.size.base=12px`, `font.weight.base=500`, `font.lineHeight.base=12px`
- Typography scale: `font.size.xs=7.5px`, `font.size.sm=12px`, `font.size.md=13.33px`, `font.size.lg=13.5px`, `font.size.xl=24px`, `font.size.2xl=51px`, `font.size.3xl=123px`
- Color palette: `color.text.primary=#ffedd7`, `color.border.muted=#dc5000`, `color.surface.base=#000000`, `color.surface.muted=#382416`
- Spacing scale: `space.1=1px`, `space.2=2px`, `space.3=7.5px`, `space.4=14.4px`, `space.5=24px`, `space.6=30px`, `space.7=36px`, `space.8=204px`
- Radius/shadow/motion tokens: `radius.xs=22.5px`, `radius.sm=36px` | `motion.duration.instant=180ms`, `motion.duration.fast=200ms`, `motion.duration.normal=250ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->
