# kennethjsmith.github.io

Ken Smith's personal site: https://kennethjsmith.github.io

Older school projects are on [Portfolium](https://portfolium.com/kenjamessmith).

Built with React, TypeScript and Vite. Pushing to `main` builds the site and deploys it to GitHub Pages
through `.github/workflows/deploy.yml`.

## Develop

```sh
npm install
npm run dev      # local dev server with hot reload
npm run lint
npm run build    # type-check and build into dist/
npm run preview  # serve the built site locally
```

## Where things live

- `src/components/`: one component per section of the page
- `src/data/projects.ts`: the project cards; add an entry here to add a project
- `src/index.css`: all styles
- `public/`: files served as-is (images, video, and redirects for the old `/about`, `/projects` and `/resume` URLs; `/resume` now goes to LinkedIn)
