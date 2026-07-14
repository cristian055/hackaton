---
name: comfama-design
description: "DESIGN.md, Stitch, Comfama, UI and design system — load before any UI change or branding decision in this repo."
license: Apache-2.0
metadata:
  author: project
  version: 1.0
---

## Activation Contract

Activate when the request matches any of:

- UI, design system, or component work in this repository.
- Stitch prompts, generation, or audit of generated screens.
- Changes to `DESIGN.md` or any color, typography, spacing, shape, or component decision.
- Anything referencing Comfama branding, palette, or tokens.

You are an LLM runtime contract, not a tutorial. Produce decisions, diffs, or
files; never narrate.

## Hard Rules

1. Read `../../../DESIGN.md` first. It is the only source of truth for visual decisions.
2. Reference semantic tokens (`{color.primary}`, `{typography.body.md}`); never inline raw hex outside `DESIGN.md`.
3. Roboto is the only permitted font family.
4. Exact palette only: `#DB0061`, `#303030`, `#CFCFCF`, `#EB003F`, `#0071EB`, `#FFC218`, `#FFFFFF`. No invented brand colors or gradients.
5. Accessibility is mandatory: WCAG AA contrast, no color-only meaning (pair every status with text or icon), `#CFCFCF` reserved for surfaces and dividers, dark foreground on `color.alert`.
6. When implementation is requested, match the existing stack: Next.js 15 + React 19 + Tailwind CSS v4 with `@theme` tokens declared in `app/globals.css`.
7. Do not edit application code unless explicitly asked. Reuse existing primitives.
8. Update `DESIGN.md` in the same change when introducing a new token or component.

## Decision Gates

Stop and ask the user before:

- Adding a new color, font, or component not listed in `DESIGN.md`.
- Lowering contrast or replacing a semantic color with a neutral.
- Diverging from the 8 px spacing rhythm or the restrained rounded scale.
- Generating screens outside the project's 12-column grid.

Do not ask when `DESIGN.md` already answers the question; apply the token.

## Execution Steps

1. Inspect the current UI surface and the relevant tokens in `DESIGN.md`.
2. Map each visual decision to an existing semantic token.
3. Apply tokens via Tailwind v4 `@theme` or component variants; never hardcode values.
4. Validate contrast (WCAG AA), focus/hover/disabled states, and responsiveness at 360, 768, and 1280 px.
5. If a new design decision is needed, edit `DESIGN.md` first, then implement.

## Output Contract

- Decisions list the chosen token and the rule it satisfies.
- Diff snippets reference the semantic token, never the hex.
- Accessibility notes flag any state, component, or copy relying on color alone.
- Final reply ends with the token names touched and the files edited.

## References

- `../../../DESIGN.md`
- `../../../app/globals.css`
- `../../../app/layout.tsx`
- `../../../opencode.json`