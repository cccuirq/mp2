# Cocktail Atlas

A React + TypeScript cocktail recipe explorer for CS 409 MP2.

## Run

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173/mp2/).
`npm run build` checks TypeScript and builds `dist/`. `npm run preview` previews it.

## Features

- Gallery and list presentations of the same searchable collection.
- Immediate, case-insensitive name search; name and ingredient-count sorting in both directions.
- Multiple category selections (OR within categories), combined with an alcohol-content filter (AND).
- Detail routes at `/mp2/cocktails/:id`, ingredients, measures, instructions and glass type.
- Previous/next follow the current filtered and sorted result set, including results not yet displayed. Boundaries disable navigation. Returning preserves the query, filters and sort in the URL.
- Direct detail links fetch by ID when outside the loaded collection. On direct visits, previous/next use collection order if the item belongs to it.
- Session caching for one hour; partial-failure messaging, a retry button, saved API data when all live requests fail, image placeholders, empty results and unknown-route states.
- Responsive layout, accessible control labels, keyboard focus styles and reduced-motion support.

## Data scope

The app requests six first-letter groups (A, B, C, M, S, T) from TheCocktailDB with Axios. Search/filter/sort operate on that finite collection, not the entire remote database. No premium endpoints are used. The saved fallback is a real first-letter A API response retrieved on 2026-10-05; the UI identifies fallback mode. Images still require network access and display placeholders on failure.

## Deployment

The existing GitHub Actions workflow builds and deploys `dist/`. The repository is named `mp2`, so Vite uses `/mp2/`, even though the local directory is `mp2folder`. React Router derives its basename from Vite. Set repository Settings → Pages → Source to **GitHub Actions** before deployment.

`public/404.html` and the external `redirect.js` preserve direct links on GitHub Pages by redirecting through the entry page. No inline styles or inline scripts are used. If the repo name changes, update Vite's base and both redirect files.

## References and attribution

- Recipe data and photographs: https://www.thecocktaildb.com/api.php (educational test key `1`).
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Vite: https://vite.dev/guide/
- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/docs/intro
- Lucide icons: https://lucide.dev/ (ISC license).
- Fonts: DM Sans and Playfair Display through Google Fonts, https://fonts.google.com/.
- Hero illustration: original SVG created for this project.
- Implementation assistance: OpenAI Codex in the task that created this project.

## Submission reminder

The assignment requires the full LLM chat log to accompany the source code and the LLM survey to be completed. This attribution is not a replacement for that chat log. Keep the original assignment README. Record a deployed-site demonstration of at most three minutes, share it as instructed in README, and complete the submission form.
