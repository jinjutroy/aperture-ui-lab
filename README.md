# Aperture UI Lab

An interactive design system playground built with React, TypeScript, and Vite. Change the accent, theme, corner radius, and spacing density; the sample workspace and component library respond immediately. The project is a frontend engineering showcase, with all sample data stored in memory and no remote assets or tracking.

**Live demo:** https://jinjutroy.github.io/aperture-ui-lab/

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. The site uses `/aperture-ui-lab/` as its base path so the same build works on GitHub Pages.

## What to explore

- **Workspace:** search and filter sample projects, create a temporary project, and see a confirmation toast.
- **Components:** try button states, form validation, switch, tabs, dialog, and toast. The invite form is a local demo; it sends no email.
- **Tokens:** inspect the current color, radius, density, and theme, then copy the corresponding CSS from the code panel.
- **Personalization:** controls persist in `localStorage`; a reset action returns to defaults.

## Architecture and accessibility

`src/system.ts` owns the typed token model, validation, persistence, and CSS variable output. `src/App.tsx` owns the page and local interactions. `src/App.css` maps the same custom properties through workspace and component surfaces.

The experience uses labeled controls, visible focus styles, native modal dialog behavior, keyboard arrow navigation for tabs, a live region for toast feedback, form error text linked to its field, responsive layouts, and reduced motion support. The workspace content is illustrative sample data, and new projects last only until refresh.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

The GitHub Actions workflow runs these checks on pushes to `main`, builds `dist`, and deploys it to GitHub Pages.
