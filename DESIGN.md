---
name: Comfama
version: alpha
status: project visual source of truth
owner: project
last_reviewed: 2026-07-14
---

# Comfama Design System

## Overview

`DESIGN.md` is the single source of truth for the visual language of this
project. Every UI surface — Stitch outputs, generated React components, native
controls, or hand-written markup — must resolve to the semantic tokens declared
here. No external brand assets, third-party kits, or ad-hoc palettes are
allowed in this project: when in doubt, this file wins.

The system exists to make Comfama feel **human, inclusive, clear, optimistic,
and service-oriented**. Citizens, associates, and partners should always know
where they are, what they can do next, and whether something succeeded.
Component density stays generous, motion stays purposeful, and copy stays
plain.

This document is the project's palette authority. The exact hex values declared
below are the only valid Comfama colors in this codebase. Any token outside
this list is an error.

## Colors

All colors are exposed as **semantic tokens**. Components reference roles, never
raw hex. Only `DESIGN.md` may carry hex literals.

### Core palette

| Token            | Hex       | Role                                       |
| ---------------- | --------- | ------------------------------------------ |
| `color.primary`  | `#DB0061` | Primary actions, key emphasis, brand mark  |
| `color.foreground` | `#303030` | Body text, headings, primary foreground  |
| `color.neutral`  | `#CFCFCF` | Dividers, subtle surfaces, disabled tracks |
| `color.error`    | `#EB003F` | Destructive states, validation errors       |
| `color.help`     | `#0071EB` | Informational help, links, guidance        |
| `color.alert`    | `#FFC218` | Warnings, pending attention                |

### Supporting tokens

| Token                | Hex       | Role                                       |
| -------------------- | --------- | ------------------------------------------ |
| `color.surface`      | `#FFFFFF` | Page and card background                   |
| `color.on-primary`   | `#FFFFFF` | Foreground on `color.primary`              |
| `color.on-error`     | `#FFFFFF` | Foreground on `color.error`                |
| `color.on-help`      | `#FFFFFF` | Foreground on `color.help`                 |
| `color.on-alert`     | `#303030` | Foreground on `color.alert`                |

### Usage rules

- `color.neutral` (`#CFCFCF`) is reserved for **surfaces, dividers, borders, and
  disabled tracks**. It must never carry body or label text because its
  contrast on `color.surface` is below WCAG AA.
- `color.on-alert` is dark (`#303030`) on purpose: `color.alert` is a light
  yellow and white-on-yellow fails AA.
- Foreground on `color.surface` is always `color.foreground`.

## Typography

The project uses **Roboto only** — Roboto Regular, Roboto Medium, and Roboto
Bold. No serif, no display, no system fallback for branding.

| Token                   | Size  | Line height | Weight | Tracking | Use                                  |
| ----------------------- | ----- | ----------- | ------ | -------- | ------------------------------------ |
| `typography.display`    | 48 px | 56 px       | 700    | -1%      | Marketing hero, Stitch splash         |
| `typography.headline.lg`| 32 px | 40 px       | 700    | -0.5%    | Section titles                        |
| `typography.headline.md`| 24 px | 32 px       | 700    | 0        | Card titles                           |
| `typography.body.lg`    | 18 px | 28 px       | 400    | 0        | Long-form copy, descriptions          |
| `typography.body.md`    | 16 px | 24 px       | 400    | 0        | Default body                          |
| `typography.body.sm`    | 14 px | 20 px       | 400    | 0        | Compact body, captions                |
| `typography.label.md`   | 14 px | 20 px       | 500    | +0.5%    | Button labels, input labels           |
| `typography.label.sm`   | 12 px | 16 px       | 500    | +1%      | Helper text, badges, chips            |

All body sizes meet minimum 14 px and the line-height ratios keep body copy at
or above 1.5 for readability.

## Layout

Spacing follows a strict **8 px rhythm**. Components stack, pad, and gap in
multiples of 8; half-steps (4 px) are allowed only for inline icon nudges.

| Token            | Value | Common use                            |
| ---------------- | ----- | ------------------------------------- |
| `spacing.1`      | 4 px  | Icon-to-label nudge, optical kerning  |
| `spacing.2`      | 8 px  | Tight stack, list gap                 |
| `spacing.3`      | 12 px | Inline control gap                    |
| `spacing.4`      | 16 px | Default vertical rhythm               |
| `spacing.5`      | 20 px | Form field vertical padding           |
| `spacing.6`      | 24 px | Section gap                           |
| `spacing.8`      | 32 px | Card padding                          |
| `spacing.10`     | 40 px | Block-to-block rhythm                 |
| `spacing.12`     | 48 px | Page section gap                      |
| `spacing.16`     | 64 px | Hero / top-of-page                    |

Layout grids use a 12-column fluid grid with 24 px gutters at 1280 px and
collapse to 4 columns with 16 px gutters below 768 px.

## Elevation & Depth

Elevation is restrained. Surfaces stay light and rely on `color.surface` with
`color.neutral` dividers; shadows are reserved for floating actions and
menus.

| Token            | Value                                                | Use                       |
| ---------------- | ---------------------------------------------------- | ------------------------- |
| `elevation.0`    | none                                                 | Inline content            |
| `elevation.1`    | `0 1px 2px rgba(48,48,48,0.06)`                      | Cards, inputs at rest     |
| `elevation.2`    | `0 2px 8px rgba(48,48,48,0.10)`                      | Hovered cards, popovers   |
| `elevation.3`    | `0 8px 24px rgba(48,48,48,0.14)`                     | Menus, modals, toasts     |

Shadows use `color.foreground` (alpha) only — no brand-tinted shadows.

## Shapes

Rounded corners are restrained to keep the tone human without becoming
playful. Avoid large pill radii on rectangular surfaces.

| Token              | Value  | Use                                          |
| ------------------ | ------ | -------------------------------------------- |
| `shape.rounded.xs` | 2 px   | Tags, inline chips                           |
| `shape.rounded.sm` | 4 px   | Inputs, small buttons                        |
| `shape.rounded.md` | 8 px   | Buttons, cards, banners                      |
| `shape.rounded.lg` | 12 px  | Modals, large surfaces                       |
| `shape.rounded.pill` | 999 px | Avatars, status dots                       |

## Components

Component tokens reference color, typography, spacing, shape, and elevation
tokens. They never inline raw values.

### Primary button

```
button.primary:
  background-color: {color.primary}
  color:            {color.on-primary}
  border-radius:    {shape.rounded.md}
  padding-block:    {spacing.3}
  padding-inline:   {spacing.6}
  font-family:      Roboto
  font-size:        {typography.label.md.size}
  font-weight:      {typography.label.md.weight}
  line-height:      {typography.label.md.line-height}
  box-shadow:       {elevation.0}
  border:           1px solid transparent
```

Hover: `elevation.1`. Pressed: `elevation.0` with 4% darker primary. Disabled:
`color.neutral` track with `color.foreground` at 38% opacity.

### Secondary button

```
button.secondary:
  background-color: {color.surface}
  color:            {color.primary}
  border-radius:    {shape.rounded.md}
  padding-block:    {spacing.3}
  padding-inline:   {spacing.6}
  border:           1px solid {color.primary}
  font-family:      Roboto
  font-size:        {typography.label.md.size}
  font-weight:      {typography.label.md.weight}
```

Hover: `color.primary` at 8% as fill. Pressed: 12%. Disabled: border switches
to `color.neutral`, text to `color.foreground` at 38%.

### Input

```
input.default:
  background-color: {color.surface}
  color:            {color.foreground}
  border-radius:    {shape.rounded.sm}
  border:           1px solid {color.neutral}
  padding-block:    {spacing.3}
  padding-inline:   {spacing.4}
  font-family:      Roboto
  font-size:        {typography.body.md.size}
  line-height:      {typography.body.md.line-height}
  box-shadow:       {elevation.1}
```

Focus: 2 px `color.help` outline at 2 px offset. Placeholder: `color.foreground`
at 50% opacity.

### Input (error)

```
input.error:
  background-color: {color.surface}
  color:            {color.foreground}
  border:           1px solid {color.error}
  border-radius:    {shape.rounded.sm}
  padding-block:    {spacing.3}
  padding-inline:   {spacing.4}
  font-family:      Roboto
  font-size:        {typography.body.md.size}
  helper-text-color: {color.error}
```

The error state must always travel with helper text under the field
(`typography.label.sm`, `color.error`).

### Help banner

```
banner.help:
  background-color: {color.help}
  color:            {color.on-help}
  border-radius:    {shape.rounded.md}
  padding-block:    {spacing.4}
  padding-inline:   {spacing.5}
  font-family:      Roboto
  font-size:        {typography.body.sm.size}
  line-height:      {typography.body.sm.line-height}
  icon-color:       {color.on-help}
```

### Alert banner

```
banner.alert:
  background-color: {color.alert}
  color:            {color.on-alert}
  border-radius:    {shape.rounded.md}
  padding-block:    {spacing.4}
  padding-inline:   {spacing.5}
  font-family:      Roboto
  font-size:        {typography.body.sm.size}
  line-height:      {typography.body.sm.line-height}
  icon-color:       {color.on-alert}
```

`color.on-alert` is dark on purpose for AA contrast.

## Do's and Don'ts

**Do**

- Resolve every visual choice to a semantic token from this file.
- Pair every status color (`error`, `help`, `alert`) with text and an icon —
  never rely on color alone.
- Use `color.neutral` only for surfaces, dividers, borders, and disabled
  tracks; never for body or label text.
- Keep Roboto as the single font family across all surfaces.
- Maintain an 8 px spacing rhythm; align columns to the 12-column grid.
- Preserve WCAG AA contrast on every text/background pair, including
  placeholder and disabled states.
- Use `color.on-alert` (`#303030`) for any text on `color.alert`.

**Don't**

- Don't introduce new hex values, brand colors, gradients, or third-party
  palettes into this project.
- Don't use `color.neutral` for body text — its contrast is below AA.
- Don't swap `color.alert`'s dark foreground for white; AA fails.
- Don't lean on color alone to convey state (success, error, warning, info).
- Don't use large pill radii on rectangular surfaces — keep corners
  restrained (`shape.rounded.md` and below).
- Don't bypass `DESIGN.md`. If a need is missing, update this file first and
  then ship the change.