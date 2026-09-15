# Put this animated contribution graph on your own profile

This repository is a GitHub template. Copy it, follow four short steps, and your GitHub profile shows
a 3D animation of your own last year of contributions. Every day a GitHub Actions workflow in your copy
fetches your calendar, redraws the picture and publishes it to GitHub Pages, so the graph stays fresh
without a server and without you touching it again.

The whole page below uses one example: a GitHub user called **octocat** setting this up.

## What octocat gets

A looping animation, published at `https://octocat.github.io/octocat/contributions.svg`:

1. Green blocks rise out of a grey plate, one column per week, one row per weekday. Taller and darker
   blocks mean more contributions that day, the same colours GitHub uses.
2. A hole sweeps across the plate and every block drops into it.
3. A greeting rises in the same block style, drawn with a block font: a pixel font where every pixel
   is one block. The default greeting is `welcome :)`.
4. The hole sweeps back, the greeting drops in, and the loop starts over.

The README on octocat's profile shows that picture. It only needs a public copy of this repository;
octocat pays nothing and runs nothing.

## Set it up

You need a GitHub account and about five minutes. No tokens to create: the workflow uses the token
GitHub gives every workflow run.

1. **Copy the repository.** On this repository's page click **Use this template**, then **Create a
   new repository**. Name it after your username, `octocat/octocat` in the example, and make it
   **public**. That specific name makes GitHub show the repository's README on your profile. Any other
   name also works; the graph will then live at `https://octocat.github.io/<repository name>/contributions.svg`
   and you can embed it in a different README.
2. **Turn on GitHub Pages.** In your new repository open **Settings**, then **Pages**. Under
   **Build and deployment**, set **Source** to **GitHub Actions**. Nothing else to fill in.
3. **Run the workflow once.** Open the **Actions** tab, pick the **Contributions** workflow in the
   left column and click **Run workflow**. It takes about a minute. When it turns green, the picture is
   live at the address above.
4. **Point the README at your picture.** Edit `README.md` in your copy so the address carries your
   username instead of `worgho2`:

   ```html
   <img src="https://octocat.github.io/octocat/contributions.svg" alt="3D contribution graph" width="836" height="599">
   ```

   The width and height are the picture's fixed size in pixels; they never change between runs, so
   keep them. They stop the page from jumping while the image loads.

From then on the workflow runs by itself every day around 03:17 UTC, and also whenever you push a
change to the code. Your username is read from the repository owner, so there is nothing to
configure for it.

## Change the greeting

The greeting is a repository variable named `GREETING_TEXT`. In your copy open **Settings**, then
**Secrets and variables**, then **Actions**, open the **Variables** tab and click
**New repository variable**. Name: `GREETING_TEXT`. Value: the text you want, for example `hi there!`.
Run the workflow once from the Actions tab to see it, or wait for the next daily run.

Two limits, because the text is drawn with the block font on a plate 53 blocks wide and 7 blocks deep:

- Use letters, digits and common punctuation (anything you can type on a US keyboard). Accented
  letters and emoji have no block shape and make the run fail.
- Keep it short. Most letters are 4 blocks wide plus 1 block of spacing, so about 10 characters fit.
  A greeting that is too wide makes the run fail, and the log names the width it needed.

A failed run keeps the previous picture online; nothing disappears while you fix the text.

## Which contributions count

The picture uses the same calendar GitHub shows on your profile. Private repositories are counted
only if you have turned on **Include private contributions on my profile** in your profile's
**Contribution settings**; otherwise only public activity appears.

## If something looks wrong

- **The address returns 404.** Pages is not set to GitHub Actions yet (step 2), or the workflow has
  not run successfully yet (step 3). Fix the setting, run the workflow, refresh.
- **The picture is stale for more than a day.** Open the Actions tab and look at the latest
  Contributions run. GitHub also switches off scheduled workflows after 60 days without a push; the
  workflow guards against that by pushing a tiny commit on the first day of each month, which is why
  it needs permission to write to the repository. If it was switched off anyway, the Actions tab
  offers a button to enable it again.
- **The run failed on "no glyph for ...".** The greeting contains a character the block font does
  not have. See "Change the greeting".

## For developers: run it on your machine

You need Node.js 24.2 or newer (the CLI relies on `import.meta.main`) and pnpm 10. Install with `pnpm install`.

The renderer is one command, `pnpm generate`, and it has two modes:

- `pnpm generate` fetches the live calendar. It needs `GITHUB_TOKEN` in the environment (a personal
  access token with no special scopes is enough), reads the username from `GITHUB_USERNAME`
  (default `worgho2`) and the greeting from `GREETING_TEXT` (default `welcome :)`).
- `pnpm generate calendar.json` renders a saved calendar instead, so you can iterate on the
  animation without a token or network. Save one with the GitHub CLI:

  ```sh
  gh api graphql -F login=octocat -f query='
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks { contributionDays { date contributionCount weekday } }
          }
        }
      }
    }' > calendar.json
  ```

Both modes write `dist/contributions.svg` and `dist/index.html` (the small page served at the Pages
root) and print a JSON summary. Open the SVG in a browser tab to watch the animation. `pnpm test`,
`pnpm typecheck` and `pnpm lint` are the checks the pull request workflow runs.

## For developers: make it your own

The code is a small builder plus interchangeable parts. `src/index.ts` is the only file that knows
the whole story: it picks where the calendar comes from, then describes the animation as a chain of
operations on the plate: write the contributions with the grow transition, wait, erase with the hole
from the left, write the greeting with the wave transition, erase with the hole from the right.

- `src/plate-animation-builder/` turns that chain into an SVG. You should not need to edit it.
- `src/writable/` holds the things that can be written on the plate. `github-contributions/` maps a
  calendar to block heights and GitHub's greens; `text/` maps a string to the block font. Add a folder
  here for a new data source.
- `src/write-transitions/` holds ways for blocks to rise (`grow`, `wave`) and
  `src/erase-transitions/` ways for them to vanish (`hole`). Add a folder here for a new move, then
  use it in the chain in `src/index.ts`.
- `src/writable/text/glyphs.ts` is the block font, 7 rows tall, one entry per character. Edit a
  shape there and `pnpm test` checks it still has 7 rows of equal width.

The design notes behind all of this are in `docs/superpowers/specs/`.
