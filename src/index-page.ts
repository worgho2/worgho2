import { HEIGHT, WIDTH } from './plate-animation-builder/geometry.ts';

/**
 * What the Pages root page needs to know.
 */
export type IndexPage = {
  /**
   * The GitHub login the graph belongs to; the page links to the profile.
   */
  username: string;
  /**
   * The `owner/name` of the repository that renders the graph; the page links to its TEMPLATE.md.
   */
  repository: string;
  /**
   * Path of the SVG relative to the page.
   */
  svgPath: string;
};

/**
 * The page served at the Pages root: the graph, sized like the README, linking back to the profile
 * and to the instructions for reusing the repository as a template.
 */
export const indexPage = ({ username, repository, svgPath }: IndexPage): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${username}</title>
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
<a href="https://github.com/${username}"><img src="${svgPath}" alt="3D contribution graph of ${username}" width="${WIDTH}" height="${HEIGHT}"></a>
<p>The last year of <a href="https://github.com/${username}">${username}</a>'s GitHub contributions, regenerated daily.</p>
<p>Want one for your profile? Follow the <a href="https://github.com/${repository}/blob/main/TEMPLATE.md">instructions on how to use this repository as a template</a>.</p>
</main>
</body>
</html>
`;
