import { HEIGHT, WIDTH } from './graph/geometry.ts';

/** The page served at the Pages root: the graph, sized like the README, linking back to the profile. */
export const indexHtml = (login: string, svgPath: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${login}</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #ffffff; font: 14px system-ui, sans-serif; }
  main { padding: 16px; text-align: center; }
  img { max-width: 100%; height: auto; }
  a { color: inherit; }
  @media (prefers-color-scheme: dark) { body { background: #0d1117; color: #e6edf3; } }
</style>
</head>
<body>
<main>
<a href="https://github.com/${login}"><img src="${svgPath}" alt="3D contribution graph of ${login}" width="${WIDTH}" height="${HEIGHT}"></a>
<p>The last year of <a href="https://github.com/${login}">${login}</a>'s GitHub contributions, regenerated daily.</p>
</main>
</body>
</html>
`;
